import {
  readFile,
  lstat,
  open,
  writeFile,
  rename,
  unlink,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { selectAccount, type Account, type Config } from "../config.js";
import { CalendlyError, UsageError } from "./errors.js";
export type Json = Record<string, any>;
export type QueryParam = {
  name: string;
  value: unknown;
  style?: string;
  explode?: boolean;
};
type Tokens = {
  access_token: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  created_at?: number;
  expires_in?: number;
};
export class CalendlyClient {
  private loaded = new Map<string, Tokens>();
  private pat = new Map<string, string>();
  private refreshes = new Map<string, Promise<Tokens>>();
  private blocked = new Set<string>();
  private schedules = new Map<string, Promise<void>>();
  private nextAt = new Map<string, number>();
  constructor(
    readonly config: Config,
    private readonly fetcher: typeof fetch = fetch,
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((r) => setTimeout(r, ms)),
  ) {}
  redactText(text: string): string {
    const values = [
      ...this.config.accounts.flatMap((a) => [a.apiToken, a.accessToken]),
      ...this.pat.values(),
      ...Array.from(this.loaded.values()).flatMap((t) => [
        t.access_token,
        t.refresh_token,
        t.client_secret,
      ]),
    ]
      .filter((v): v is string => Boolean(v))
      .sort((a, b) => b.length - a.length);
    for (const v of values) text = text.split(v).join("[redacted]");
    return text;
  }
  sanitize(v: unknown): unknown {
    if (typeof v === "string") return this.redactText(v);
    if (Array.isArray(v)) return v.map((x) => this.sanitize(x));
    if (v && typeof v === "object")
      return Object.fromEntries(
        Object.entries(v).map(([k, x]) => [
          k,
          /^(password|secret|signing_key|signing_secret|client_secret|api_token|api_key|access_token|refresh_token)$/i.test(
            k,
          )
            ? "[redacted]"
            : this.sanitize(x),
        ]),
      );
    return v;
  }
  private async file(path: string, json = false): Promise<string | Tokens> {
    try {
      const stat = await lstat(path);
      if (
        !stat.isFile() ||
        stat.size > 65536 ||
        (process.platform !== "win32" && (stat.mode & 0o077) !== 0)
      )
        throw new Error();
      const raw = await readFile(path, "utf8");
      if (!json) return raw.trim();
      const t = JSON.parse(raw);
      if (
        !t ||
        typeof t !== "object" ||
        Array.isArray(t) ||
        typeof t.access_token !== "string" ||
        !t.access_token ||
        /[\r\n]/.test(t.access_token)
      )
        throw new Error();
      for (const k of ["refresh_token", "client_id", "client_secret"])
        if (t[k] !== undefined && typeof t[k] !== "string") throw new Error();
      for (const k of ["created_at", "expires_in"])
        if (t[k] !== undefined && (!Number.isFinite(t[k]) || t[k] <= 0))
          throw new Error();
      return t as Tokens;
    } catch {
      throw new CalendlyError(
        "Cannot read private credentials: use a regular owner-only file, at most 64 KB, with the documented token format.",
        0,
        "CONFIG",
      );
    }
  }
  private async tokens(a: Account): Promise<Tokens> {
    if (this.blocked.has(a.name))
      throw new CalendlyError(
        "OAuth refresh outcome is invalid or unknown. Reauthorize, update the private token file and restart before more requests.",
        401,
        "AUTH",
      );
    const t = a.tokensFile
      ? ((await this.file(a.tokensFile, true)) as Tokens)
      : { access_token: a.accessToken };
    this.loaded.set(a.name, t);
    return t;
  }
  private async refresh(a: Account, expected: Tokens): Promise<Tokens> {
    const existing = this.refreshes.get(a.name);
    if (existing) return existing;
    const promise = (async () => {
      if (!a.tokensFile || !expected.refresh_token || !expected.client_id)
        throw new CalendlyError(
          "OAuth token expired. Configure a private rotating tokens file or renew the access token; no environment-only refresh is attempted.",
          401,
          "AUTH",
        );
      const lock = a.tokensFile + ".refresh.lock";
      let handle;
      try {
        handle = await open(lock, "wx", 0o600);
      } catch {
        throw new CalendlyError(
          "OAuth refresh is locked by another process. Wait for it to finish, then retry the read. Do not remove a live lock.",
          0,
          "CONFIG",
        );
      }
      try {
        const current = await this.tokens(a);
        if (
          current.access_token !== expected.access_token ||
          current.refresh_token !== expected.refresh_token
        )
          return current;
        const body = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: current.refresh_token!,
          ...(!current.client_secret ? { client_id: current.client_id! } : {}),
        });
        let response: Response;
        try {
          response = await this.fetcher("https://calendly.com/oauth/token", {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.timeout(this.config.timeoutMs),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              ...(current.client_secret
                ? {
                    Authorization:
                      "Basic " +
                      Buffer.from(
                        current.client_id + ":" + current.client_secret,
                      ).toString("base64"),
                  }
                : {}),
            },
            body: body.toString(),
          });
        } catch {
          this.blocked.add(a.name);
          throw new CalendlyError(
            "OAuth refresh failed or timed out; its outcome is unknown. Reauthorize and restart instead of reusing a possibly consumed refresh token.",
            0,
            "AUTH",
          );
        }
        if (!response.ok) {
          this.blocked.add(a.name);
          throw new CalendlyError(
            `OAuth refresh failed (${response.status}); reauthorize and restart. The refresh request is never automatically retried.`,
            response.status,
            "AUTH",
          );
        }
        let result: Tokens;
        try {
          result = (await response.json()) as Tokens;
          if (
            !result.access_token ||
            !result.refresh_token ||
            typeof result.access_token !== "string" ||
            typeof result.refresh_token !== "string" ||
            /[\r\n]/.test(result.access_token)
          )
            throw new Error();
        } catch {
          this.blocked.add(a.name);
          throw new CalendlyError(
            "OAuth rotation returned incomplete credentials; reauthorize and restart.",
            0,
            "AUTH",
          );
        }
        const merged = {
          ...current,
          ...result,
          created_at: Math.floor(Date.now() / 1000),
        };
        this.loaded.set(a.name, merged);
        const temp = join(
          dirname(a.tokensFile),
          `.calendly-refresh-${randomUUID()}.tmp`,
        );
        try {
          await writeFile(temp, JSON.stringify(merged), {
            mode: 0o600,
            flag: "wx",
          });
          await rename(temp, a.tokensFile);
        } catch {
          this.blocked.add(a.name);
          await unlink(temp).catch(() => {});
          throw new CalendlyError(
            "OAuth rotation succeeded but could not be saved. Reauthorize and repair private storage; do not repeat writes.",
            0,
            "CONFIG",
          );
        }
        return merged;
      } finally {
        await handle.close();
        await unlink(lock).catch(() => {});
      }
    })();
    this.refreshes.set(a.name, promise);
    try {
      return await promise;
    } finally {
      this.refreshes.delete(a.name);
    }
  }
  private async auth(a: Account): Promise<{ token: string; tokens?: Tokens }> {
    if (a.tokenFile || a.apiToken) {
      let t = this.pat.get(a.name);
      if (!t) {
        t = a.tokenFile
          ? ((await this.file(a.tokenFile)) as string)
          : a.apiToken;
        if (!t || /[\r\n]/.test(t))
          throw new CalendlyError("Invalid private PAT.", 0, "CONFIG");
        this.pat.set(a.name, t);
      }
      return { token: t };
    }
    let t = await this.tokens(a);
    if (!t.access_token)
      throw new CalendlyError(
        "No credentials configured for the selected account.",
        0,
        "CONFIG",
      );
    if (
      t.created_at &&
      t.expires_in &&
      Date.now() >= (t.created_at + t.expires_in) * 1000 - 60000
    )
      t = await this.refresh(a, t);
    return { token: t.access_token, tokens: t };
  }
  private async pace(a: Account): Promise<void> {
    const previous = this.schedules.get(a.name) ?? Promise.resolve();
    const next = previous
      .catch(() => {})
      .then(async () => {
        const delay = Math.max(0, (this.nextAt.get(a.name) ?? 0) - Date.now());
        if (delay) await this.sleep(delay);
        this.nextAt.set(a.name, Date.now() + this.config.minIntervalMs);
      });
    this.schedules.set(a.name, next);
    await next;
  }
  async request(
    method: string,
    path: string,
    query: QueryParam[] = [],
    body?: Json,
    accountHint?: string,
  ): Promise<Json> {
    if (
      !/^\/[A-Za-z0-9_%/-]+$/.test(path) ||
      path.includes("..") ||
      /%2f|%5c/i.test(path)
    )
      throw new UsageError("Unsupported Calendly API path.");
    const a = selectAccount(this.config, accountHint);
    let auth = await this.auth(a);
    const url = new URL(path, "https://api.calendly.com");
    for (const p of query) {
      const v = p.value;
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        if (p.explode === false) url.searchParams.set(p.name, v.join(","));
        else for (const x of v) url.searchParams.append(p.name, String(x));
      } else if (typeof v === "object")
        throw new UsageError("Unsupported object query parameter.");
      else url.searchParams.set(p.name, String(v));
    }
    const encoded = body === undefined ? undefined : JSON.stringify(body);
    if (encoded && Buffer.byteLength(encoded) > 5 * 1024 * 1024)
      throw new UsageError("Request JSON exceeds the 5 MB local cap.");
    let retriedAuth = false,
      retries = 0;
    for (;;) {
      await this.pace(a);
      let response: Response;
      try {
        response = await this.fetcher(url, {
          method,
          redirect: "error",
          signal: AbortSignal.timeout(this.config.timeoutMs),
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: "application/json",
            ...(encoded ? { "Content-Type": "application/json" } : {}),
          },
          ...(encoded ? { body: encoded } : {}),
        });
      } catch {
        throw new CalendlyError(
          method === "GET"
            ? "Calendly request failed or timed out."
            : "Calendly write failed or timed out; its outcome may be unknown. Inspect existing bookings/contact state before repeating it.",
          0,
          "NETWORK",
        );
      }
      if (
        method === "GET" &&
        response.status === 401 &&
        auth.tokens?.refresh_token &&
        !retriedAuth
      ) {
        retriedAuth = true;
        await response.body?.cancel();
        const t = await this.refresh(a, auth.tokens);
        auth = { token: t.access_token, tokens: t };
        continue;
      }
      if (
        method === "GET" &&
        response.status === 429 &&
        retries < this.config.maxRetries
      ) {
        const raw =
          response.headers.get("retry-after") ??
          response.headers.get("x-ratelimit-reset");
        const delay =
          raw === null
            ? 1000
            : Number.isFinite(Number(raw))
              ? Number(raw) * 1000
              : Date.parse(raw) - Date.now();
        if (Number.isFinite(delay) && delay >= 0 && delay <= 10000) {
          await response.body?.cancel();
          await this.sleep(Math.max(delay, 100));
          retries++;
          continue;
        }
      }
      const text = await response.text();
      if (!response.ok) {
        let detail = "";
        try {
          const x = JSON.parse(text);
          detail = JSON.stringify(
            this.sanitize(x.details ?? x.message ?? x.error ?? ""),
          );
        } catch {}
        throw new CalendlyError(
          this.redactText(
            `Calendly API ${response.status}${detail ? ": " + detail.slice(0, 1000) : ""}`,
          ),
          response.status,
          response.status === 429
            ? "RATE_LIMIT"
            : [401, 403].includes(response.status)
              ? "AUTH"
              : "API_ERROR",
        );
      }
      if (!text) return { success: true };
      let result: Json;
      try {
        result = JSON.parse(text);
      } catch {
        throw new CalendlyError(
          "Calendly returned a non-JSON response.",
          0,
          "API_ERROR",
        );
      }
      if (response.status === 202)
        return { ...result, http_status: 202, accepted: true };
      return result;
    }
  }
}
