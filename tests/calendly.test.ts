import { describe, it, expect, vi } from "vitest";
import {
  mkdtemp,
  writeFile,
  readFile,
  lstat,
  symlink,
  rm,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { loadConfig } from "../src/config.js";
import { CalendlyClient } from "../src/api/client.js";
import { ALL_TOOLS, validateArguments } from "../src/tools/index.js";
import { buildServer } from "../src/server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
const config = () =>
  loadConfig({
    CALENDLY_API_TOKEN: "fixture-private-value",
    CALENDLY_MIN_REQUEST_INTERVAL_MS: "0",
  });
const response = (
  value: unknown = {},
  status = 200,
  headers: Record<string, string> = {},
) =>
  new Response(status === 204 ? null : JSON.stringify(value), {
    status,
    headers,
  });
const tool = (name: string) => ALL_TOOLS.find((t) => t.name === name)!;
const invoke = async (
  name: string,
  args: Record<string, unknown>,
  fetcher: typeof fetch,
) => {
  const t = tool(name);
  validateArguments(t, args);
  return t.handler(args, new CalendlyClient(config(), fetcher));
};
const uri = (kind: string) => `https://api.calendly.com/${kind}/fixture-uuid`;
async function connect(c = config(), f: typeof fetch = vi.fn() as any) {
  const server = buildServer(c, new CalendlyClient(c, f));
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(b);
  const client = new Client({ name: "fixture", version: "1" });
  await client.connect(a);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
describe("Current routes, schemas and safe account operations", () => {
  it("discovers all current API tools and a credential-free local helper", async () => {
    const s = await connect();
    try {
      const { tools } = await s.client.listTools();
      expect(tools).toHaveLength(66);
      expect(tools.filter((t) => t.annotations?.readOnlyHint)).toHaveLength(44);
      const result = await s.client.callTool({
        name: "list_accounts",
        arguments: {},
      });
      expect(JSON.stringify(result)).not.toContain("fixture-private-value");
    } finally {
      await s.close();
    }
  });
  it("removes all writes and refuses calls to hidden tools", async () => {
    const f = vi.fn();
    const s = await connect({ ...config(), readOnly: true }, f);
    try {
      expect((await s.client.listTools()).tools).toHaveLength(44);
      expect(
        (
          await s.client.callTool({
            name: "cancel_event",
            arguments: { event_uuid: "fixture", confirm: true },
          })
        ).isError,
      ).toBe(true);
      expect(f).not.toHaveBeenCalled();
    } finally {
      await s.close();
    }
  });
  it("requires confirmation for every one of the 22 writes", async () => {
    const f = vi.fn();
    const s = await connect(config(), f);
    try {
      for (const t of ALL_TOOLS.filter((t) => t.risk !== "read")) {
        const args = Object.fromEntries(
          (t.inputSchema.required ?? []).map((k: string) => [
            k,
            t.inputSchema.properties[k].format === "uri"
              ? uri("event_types")
              : "fixture",
          ]),
        );
        expect(
          (await s.client.callTool({ name: t.name, arguments: args })).isError,
        ).toBe(true);
      }
      expect(f).not.toHaveBeenCalled();
    } finally {
      await s.close();
    }
  });
  it("uses the current availability PATCH with required query URI and full rules", async () => {
    const f = vi.fn(async (u: any, i: any) => {
      expect(String(u)).toBe(
        "https://api.calendly.com/event_type_availability_schedules?event_type=" +
          encodeURIComponent(uri("event_types")),
      );
      expect(i.method).toBe("PATCH");
      expect(i.headers.Authorization).toBe("Bearer fixture-private-value");
      expect(JSON.parse(i.body).availability_rule.timezone).toBe("UTC");
      return response();
    });
    await invoke(
      "update_event_type_availability_schedules",
      {
        event_type: uri("event_types"),
        availability_rule: { timezone: "UTC", rules: [] },
        confirm: true,
      },
      f,
    );
  });
  it("uses current locations, plural shares and global routing submission endpoints", async () => {
    const f = vi.fn(async (u: any) => response({ path: new URL(u).pathname }));
    expect(
      await invoke("list_user_locations", { user: uri("users") }, f),
    ).toEqual({ path: "/locations" });
    expect(
      await invoke(
        "create_share",
        { event_type: uri("event_types"), confirm: true },
        f,
      ),
    ).toEqual({ path: "/shares" });
    expect(
      await invoke(
        "list_routing_form_submissions",
        { form: uri("routing_forms") },
        f,
      ),
    ).toEqual({ path: "/routing_form_submissions" });
  });
  it("refuses arbitrary origins, traversal and encoded separators before networking", async () => {
    const f = vi.fn();
    for (const path of [
      "https://evil.example/users",
      "/../users",
      "/users/a%2Fb",
    ])
      await expect(
        new CalendlyClient(config(), f).request("GET", path),
      ).rejects.toThrow("Unsupported");
    expect(f).not.toHaveBeenCalled();
  });
  it("validates conditional booking name, timezone, email and guest cap", async () => {
    const f = vi.fn(async () =>
      response({ resource: { uri: uri("scheduled_events") } }, 201),
    );
    const base = {
      event_type: uri("event_types"),
      start_time: "2030-01-01T12:00:00Z",
      confirm: true,
    };
    for (const invitee of [
      { email: "user@example.com", timezone: "UTC" },
      { name: "User", email: "bad", timezone: "UTC" },
      { name: "User", email: "user@example.com" },
    ])
      await expect(
        invoke("create_invitee", { ...base, invitee }, f),
      ).rejects.toThrow();
    await expect(
      invoke(
        "create_invitee",
        {
          ...base,
          invitee: {
            first_name: "User",
            email: "user@example.com",
            timezone: "UTC",
          },
          event_guests: Array(11).fill("guest@example.com"),
        },
        f,
      ),
    ).rejects.toThrow();
    expect(f).not.toHaveBeenCalled();
    await invoke(
      "create_invitee",
      {
        ...base,
        invitee: { name: "User", email: "user@example.com", timezone: "UTC" },
      },
      f,
    );
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("preserves current booking location union and refuses the wrong kind", async () => {
    const f = vi.fn(async () => response());
    const a = {
      event_type: uri("event_types"),
      start_time: "2030-01-01T12:00:00Z",
      invitee: { name: "User", email: "user@example.com", timezone: "UTC" },
      confirm: true,
    };
    await expect(
      invoke("create_invitee", { ...a, location: { kind: "zoom" } }, f),
    ).rejects.toThrow();
    await invoke(
      "create_invitee",
      { ...a, location: { kind: "zoom_conference" } },
      f,
    );
  });
  it("validates contact primary email and accepts nullable custom fields", async () => {
    const f = vi.fn(async (_u: any, i: any) =>
      response(JSON.parse(i.body), 201),
    );
    const a = {
      name: "User",
      emails: [{ email: "user@example.com", is_primary: true }],
      custom_fields: [{ uuid: "field", value: null }],
      confirm: true,
    };
    expect(await invoke("create_contact", a, f)).toMatchObject({
      custom_fields: [{ value: null }],
    });
    await expect(
      invoke(
        "create_contact",
        { ...a, emails: [{ email: "user@example.com", is_primary: false }] },
        f,
      ),
    ).rejects.toThrow("primary");
  });
  it("requires invitee URI for no-show and sends global no-show route", async () => {
    const f = vi.fn(async (u: any) => {
      expect(String(u)).toBe("https://api.calendly.com/invitee_no_shows");
      return response({}, 201);
    });
    await expect(
      invoke("create_no_show", { confirm: true }, f),
    ).rejects.toThrow();
    await invoke(
      "create_no_show",
      { invitee: uri("invitees"), confirm: true },
      f,
    );
  });
  it("accepts corrected event-type webhook enum and restricts recap/form scopes", async () => {
    const f = vi.fn(async () => response({}, 201));
    const a = {
      url: "https://example.com/webhook",
      organization: uri("organizations"),
      scope: "organization",
      confirm: true,
    };
    await invoke("create_webhook", { ...a, events: ["event_type.updated"] }, f);
    await expect(
      invoke("create_webhook", { ...a, events: ["meeting_recap.created"] }, f),
    ).rejects.toThrow("user scope");
    await expect(
      invoke(
        "create_webhook",
        {
          ...a,
          scope: "user",
          user: uri("users"),
          events: ["routing_form_submission.created"],
        },
        f,
      ),
    ).rejects.toThrow("organization scope");
    await expect(
      invoke(
        "create_webhook",
        { ...a, scope: "group", events: ["contact.updated"] },
        f,
      ),
    ).rejects.toThrow("group URI");
  });
  it("enforces availability 31-day slot and 7-day busy windows without limiting valid new ranges", async () => {
    const f = vi.fn(async () => response({ collection: [] }));
    const start = Date.now() + 86400000;
    const a = {
      start_time: new Date(start).toISOString(),
      end_time: new Date(start + 30 * 86400000).toISOString(),
    };
    await invoke(
      "list_event_type_available_times",
      { ...a, event_type: uri("event_types") },
      f,
    );
    await expect(
      invoke("list_user_busy_times", { ...a, user: uri("users") }, f),
    ).rejects.toThrow("7 days");
    await expect(
      invoke(
        "list_event_type_available_times",
        {
          ...a,
          end_time: new Date(start + 32 * 86400000).toISOString(),
          event_type: uri("event_types"),
        },
        f,
      ),
    ).rejects.toThrow("31 days");
  });
  it("rejects missing body, mixed payload/body flags and empty updates", async () => {
    const f = vi.fn();
    await expect(
      invoke("create_contact", { confirm: true }, f),
    ).rejects.toThrow();
    await expect(
      invoke(
        "create_contact",
        {
          name: "User",
          payload: {
            name: "User",
            emails: [{ email: "user@example.com", is_primary: true }],
          },
          confirm: true,
        },
        f,
      ),
    ).rejects.toThrow("mixing");
    await expect(
      invoke(
        "update_contact",
        { contact_uuid: "fixture", payload: {}, confirm: true },
        f,
      ),
    ).rejects.toThrow("at least one");
    expect(f).not.toHaveBeenCalled();
  });
  it("preserves two independent organization/invitation UUID path arguments", async () => {
    const f = vi.fn(async (u: any) => {
      expect(new URL(u).pathname).toBe("/organizations/org/invitations/invite");
      return response({}, 204);
    });
    await invoke(
      "revoke_organization_invitation",
      { org_uuid: "org", invitation_uuid: "invite", confirm: true },
      f,
    );
  });
  it("uses opaque page tokens and never follows response URLs", async () => {
    let n = 0;
    const f = vi.fn(async (u: any) => {
      const url = new URL(u);
      expect(url.origin).toBe("https://api.calendly.com");
      expect(url.searchParams.get("count")).toBe("2");
      n++;
      expect(url.searchParams.get("page_token")).toBe(
        n === 1 ? null : "opaque/+=",
      );
      return response({
        collection: n === 1 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }, { id: 4 }],
        pagination: {
          next_page: "https://evil.example",
          next_page_token: n === 1 ? "opaque/+=" : null,
        },
      });
    });
    const x: any = await invoke(
      "list_contacts",
      { all_pages: true, max_items: 3, count: 2 },
      f,
    );
    expect(x.collection).toHaveLength(3);
    expect(x.resume).toEqual({ page_token: "opaque/+=", count: 2, skip: 1 });
    expect(x.truncated).toBe(true);
  });
  it("refuses repeated or empty continuing pages", async () => {
    const f = vi.fn(async () =>
      response({
        collection: [{ id: 1 }],
        pagination: { next_page_token: "same" },
      }),
    );
    await expect(
      invoke("list_contacts", { all_pages: true, max_items: 10 }, f),
    ).rejects.toThrow("repeated");
    const empty = vi.fn(async () =>
      response({ collection: [], pagination: { next_page_token: "next" } }),
    );
    await expect(
      invoke("list_contacts", { all_pages: true }, empty),
    ).rejects.toThrow("Empty");
  });
  it("respects X-RateLimit-Reset and avoids premature retry of long delays", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(response({}, 429, { "x-ratelimit-reset": "2" }))
      .mockResolvedValue(response());
    const sleep = vi.fn(async () => {});
    await new CalendlyClient(config(), f, sleep).request("GET", "/users/me");
    expect(sleep).toHaveBeenCalledWith(2000);
    const longer = vi.fn(async () =>
      response({}, 429, { "x-ratelimit-reset": "60" }),
    );
    await expect(
      new CalendlyClient(config(), longer, sleep).request("GET", "/users/me"),
    ).rejects.toThrow("429");
    expect(longer).toHaveBeenCalledTimes(1);
  });
  it("never retries writes on 429, 401 or unknown transport outcomes", async () => {
    for (const status of [429, 401]) {
      const f = vi.fn(async () => response({}, status));
      await expect(
        new CalendlyClient(config(), f).request("POST", "/invitees", [], {}),
      ).rejects.toThrow(String(status));
      expect(f).toHaveBeenCalledTimes(1);
    }
    const f = vi.fn(async () => {
      throw new Error("unsafe transport token");
    });
    await expect(
      new CalendlyClient(config(), f).request("POST", "/invitees", [], {}),
    ).rejects.toThrow("outcome may be unknown");
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("redacts credential fields and known values without anonymizing contact data", () => {
    const c = new CalendlyClient(config());
    expect(
      c.sanitize({
        email: "user@example.com",
        access_token: "other",
        signing_key: "private",
        text: "fixture-private-value",
      }),
    ).toEqual({
      email: "user@example.com",
      access_token: "[redacted]",
      signing_key: "[redacted]",
      text: "[redacted]",
    });
  });
  it("validates actual CLI error codes and prevents --yes from confirming writes", () => {
    const env = { ...process.env };
    for (const k of Object.keys(env))
      if (k.startsWith("CALENDLY_")) delete env[k];
    const run = (args: string[]) =>
      spawnSync(process.execPath, ["dist/index.js", ...args], {
        env,
        encoding: "utf8",
      });
    expect(run(["get-event", "--agent"]).status).toBe(2);
    expect(run(["get-current-user", "--agent"]).status).toBe(10);
    expect(
      run(["cancel-event", "--event-uuid", "fixture", "--yes", "--agent"])
        .status,
    ).toBe(2);
    expect(run(["schema", "create-contact"]).status).toBe(0);
  }, 20000);
});
describe("Owner-only credentials and current single-use OAuth rotation", () => {
  it("rejects symlink credential/payload files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "calendly-private-"));
    try {
      const token = join(dir, "token");
      await writeFile(token, "fixture-private-value", { mode: 0o600 });
      try {
        await symlink(token, join(dir, "link"));
      } catch (e: any) {
        if (process.platform === "win32" && e.code === "EPERM") return;
        throw e;
      }
      const f = vi.fn();
      await expect(
        new CalendlyClient(
          loadConfig({ CALENDLY_TOKEN_FILE: join(dir, "link") }),
          f,
        ).request("GET", "/users/me"),
      ).rejects.toThrow("regular");
      await expect(
        invoke(
          "create_contact",
          { payload_file: join(dir, "link"), confirm: true },
          f,
        ),
      ).rejects.toThrow("regular");
      expect(f).not.toHaveBeenCalled();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  it("rotates once for concurrent requests and atomically persists both new credentials", async () => {
    const dir = await mkdtemp(join(tmpdir(), "calendly-oauth-"));
    try {
      const file = join(dir, "tokens.json");
      await writeFile(
        file,
        JSON.stringify({
          access_token: "fixture-old-access",
          refresh_token: "fixture-old-refresh",
          client_id: "fixture-client",
          created_at: 1,
          expires_in: 1,
        }),
        { mode: 0o600 },
      );
      let rotations = 0;
      const f = vi.fn(async (u: any, i: any) => {
        if (String(u) === "https://calendly.com/oauth/token") {
          rotations++;
          expect(i.method).toBe("POST");
          expect(i.redirect).toBe("error");
          expect(new URLSearchParams(i.body).get("refresh_token")).toBe(
            "fixture-old-refresh",
          );
          await new Promise((r) => setTimeout(r, 10));
          return response({
            access_token: "fixture-new-access",
            refresh_token: "fixture-new-refresh",
            expires_in: 7200,
          });
        }
        expect(i.headers.Authorization).toBe("Bearer fixture-new-access");
        return response();
      });
      const c = new CalendlyClient(
        loadConfig({
          CALENDLY_TOKENS_FILE: file,
          CALENDLY_MIN_REQUEST_INTERVAL_MS: "0",
        }),
        f,
      );
      await Promise.all([
        c.request("GET", "/users/me"),
        c.request("GET", "/users/me"),
      ]);
      expect(rotations).toBe(1);
      const saved = JSON.parse(await readFile(file, "utf8"));
      expect(saved.refresh_token).toBe("fixture-new-refresh");
      if (process.platform !== "win32")
        expect((await lstat(file)).mode & 0o077).toBe(0);
      await expect(lstat(file + ".refresh.lock")).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  it("refuses competing process refresh locks before consuming a single-use token", async () => {
    const dir = await mkdtemp(join(tmpdir(), "calendly-lock-"));
    try {
      const file = join(dir, "tokens.json");
      await writeFile(
        file,
        JSON.stringify({
          access_token: "fixture-old",
          refresh_token: "fixture-refresh",
          client_id: "fixture-id",
          created_at: 1,
          expires_in: 1,
        }),
        { mode: 0o600 },
      );
      await writeFile(file + ".refresh.lock", "", { mode: 0o600 });
      const f = vi.fn();
      await expect(
        new CalendlyClient(
          loadConfig({ CALENDLY_TOKENS_FILE: file }),
          f,
        ).request("GET", "/users/me"),
      ).rejects.toThrow("locked");
      expect(f).not.toHaveBeenCalled();
      expect(await readFile(file + ".refresh.lock", "utf8")).toBe("");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  it("blocks further refresh attempts after invalid_grant or unknown outcomes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "calendly-grant-"));
    try {
      const file = join(dir, "tokens.json");
      await writeFile(
        file,
        JSON.stringify({
          access_token: "fixture-old",
          refresh_token: "fixture-refresh",
          client_id: "fixture-id",
          created_at: 1,
          expires_in: 1,
        }),
        { mode: 0o600 },
      );
      const f = vi.fn(async () => response({ error: "invalid_grant" }, 400));
      const c = new CalendlyClient(
        loadConfig({ CALENDLY_TOKENS_FILE: file }),
        f,
      );
      await expect(c.request("GET", "/users/me")).rejects.toThrow(
        "reauthorize",
      );
      await expect(c.request("GET", "/users/me")).rejects.toThrow(
        "Reauthorize",
      );
      expect(f).toHaveBeenCalledTimes(1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  it("uses confidential client Basic auth and does not put a client secret in form data", async () => {
    const dir = await mkdtemp(join(tmpdir(), "calendly-basic-"));
    try {
      const file = join(dir, "tokens.json");
      await writeFile(
        file,
        JSON.stringify({
          access_token: "fixture-old",
          refresh_token: "fixture-refresh",
          client_id: "fixture-id",
          client_secret: "fixture-secret",
          created_at: 1,
          expires_in: 1,
        }),
        { mode: 0o600 },
      );
      const f = vi.fn(async (u: any, i: any) => {
        if (String(u).endsWith("/oauth/token")) {
          expect(i.headers.Authorization).toBe(
            "Basic " +
              Buffer.from("fixture-id:fixture-secret").toString("base64"),
          );
          expect(new URLSearchParams(i.body).has("client_secret")).toBe(false);
          return response({
            access_token: "fixture-new",
            refresh_token: "fixture-new-refresh",
            expires_in: 7200,
          });
        }
        return response();
      });
      await new CalendlyClient(
        loadConfig({
          CALENDLY_TOKENS_FILE: file,
          CALENDLY_MIN_REQUEST_INTERVAL_MS: "0",
        }),
        f,
      ).request("GET", "/users/me");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
