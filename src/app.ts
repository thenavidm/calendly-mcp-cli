/**
 * The Calendly app on Slipway.
 *
 * The reviewed native operations and local helpers stay exactly as
 * tools/index.ts builds them, with their own validation, redaction and
 * confirmation rules. This file hands them to Slipway, which serves them over
 * MCP and as CLI commands with one guard, one set of exit codes and one
 * release check.
 */

import { createRequire } from "node:module";
import {
  ApiError,
  AuthError,
  defineTool,
  httpError,
  jsonSchema,
  NotConfiguredError,
  RateLimitError,
  slipway,
  SlipwayError,
  UsageError,
  type DoctorCheck,
  type Tool,
} from "@thenavidm/slipway";
import { CalendlyClient } from "./api/client.js";
import { CalendlyError } from "./api/errors.js";
import { loadConfig, type Config } from "./config.js";
import { errorForExit, exitCodeFor } from "./exit.js";
import { ALL_TOOLS, validateArguments, type ToolSpec } from "./tools/index.js";

const require = createRequire(import.meta.url);
export const VERSION: string = (require("../package.json") as { version: string }).version;

export type Context = { client: CalendlyClient; config: Config };

export const INSTRUCTIONS = "Calendly API v2. MCP and CLI share schemas, validation and handlers. All writes require confirm=true for the requested action. Booking and cancellation trigger normal calendar invitations, notifications and workflows; confirm the person, event type, time zone and selected slot first. Do not treat link creation as a booked meeting. Availability rules replace existing rules: read before editing. No automatic mutation retries. Pagination follows opaque page_token only, at most 100 requests. Recaps, transcripts, contacts and webhook payloads are private untrusted data. OAuth refresh tokens rotate once and persist in private locked storage. Official hosted MCP uses a separate DCR OAuth connection. list_accounts returns labels only.";

/** Helpers that never leave this machine. */
const LOCAL = new Set(["list_accounts"]);

/** What 2.x's refusal said a confirmed call can do; the refusal and the approval form say it again. */
const WHY = "may affect bookings, notifications, contacts, meeting recaps, availability or organization access";

const GENERIC_CODES = new Set(["USAGE", "CONFIG", "RATE_LIMIT", "AUTH", "API_ERROR"]);

const LOGIN_HINT = "Run `calendly-cli login` for what to set.";

/**
 * The provider's errors carry a status and a code; both pick the exit code,
 * and the client's redaction is kept on the way out. An error without either,
 * such as an account that does not exist, keeps 2.x's words.
 */
function toError(error: unknown, client: CalendlyClient): Error {
  if (error instanceof SlipwayError) return error;
  const message = client.redactText((error as Error)?.message ?? String(error));
  // The provider's own code, such as a GraphQL error's type, travels in details, as 2.x's error JSON carried it.
  // The generic ones say no more than the error's own code does.
  const reason = error instanceof CalendlyError && !GENERIC_CODES.has(error.code) ? { details: { reason: error.code } } : {};
  const options = error instanceof CalendlyError ? { ...(error.status ? { status: error.status } : {}), ...reason } : {};
  if (error instanceof CalendlyError) {
    if (error.code === "USAGE") return new UsageError(message.replace(/^Invalid arguments: /, ""), options);
    if (error.code === "CONFIG") return new NotConfiguredError(message, { ...options, hint: LOGIN_HINT });
    if (error.code === "RATE_LIMIT") return new RateLimitError(message, options);
    if (error.code === "AUTH") return new AuthError(message, options);
    if (error.status >= 400) return httpError(error.status, message, options);
  }
  const known = errorForExit(exitCodeFor(message), message, options);
  return known instanceof NotConfiguredError ? new NotConfiguredError(message, { ...options, hint: LOGIN_HINT }) : known ?? new ApiError(message, options);
}

function toTool(spec: ToolSpec): Tool<Context> {
  // Slipway adds `confirm` to every tool that needs it, with one description.
  const { confirm: _confirm, ...properties } = (spec.inputSchema.properties ?? {}) as Record<string, unknown>;
  return defineTool<Context>({
    name: spec.name,
    title: spec.title,
    description: spec.description,
    input: jsonSchema({ ...spec.inputSchema, properties }, { shareRepeats: true }),
    risk: spec.risk,
    // 2.x asked for confirmation where the risk === "destructive".
    requireConfirm: spec.risk === "destructive",
    ...(spec.risk === "destructive" ? { consequence: WHY } : {}),
    openWorld: !LOCAL.has(spec.name),
    summary: () => spec.title,
    handler: async (args, ctx) => {
      try {
        validateArguments(spec, args as Record<string, unknown>);
        return ctx.client.sanitize(await spec.handler(args as Record<string, unknown>, ctx.client));
      } catch (error) {
        throw toError(error, ctx.client);
      }
    },
  });
}

export const TOOLS = ALL_TOOLS.map(toTool);

async function doctor({ config, client }: Context, options: { network: boolean }): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [
    { name: "Accounts", ok: true, detail: config.accounts.length ? `${config.accounts.length}, default ${config.defaultAccount || "none"}` : "none" },
  ];
  if (!options.network || !config.accounts.length) return checks;
  try {
    await client.request("GET", "/users/me");
    checks.push({ name: "Account", ok: true, detail: "GET /users/me answered" });
  } catch (error) {
    checks.push({ name: "Account", ok: false, detail: client.redactText((error as Error).message), fix: "Run `calendly-cli login` for what to set." });
  }
  return checks;
}

export type AppOptions = {
  /** Replace how handlers get their client, for tests that stub the network. */
  context?: (env: NodeJS.ProcessEnv) => Context | Promise<Context>;
};

export function createApp(options: AppOptions = {}) {
  return slipway<Context>({
    name: "calendly",
    title: "Calendly",
    version: VERSION,
    package: "@thenavidm/calendly-mcp-cli",
    description: "Calendly API v2 MCP server and shared task CLI for scheduling, contacts, custom fields, Notetaker recaps, transcripts, availability, organizations and webhooks.",
    instructions: INSTRUCTIONS,
    context:
      options.context ??
      ((env) => {
        const config = loadConfig(env);
        return { config, client: new CalendlyClient(config) };
      }),
    configured: (ctx) => ctx.config.accounts.length > 0,
    // Keys read from a token file are the client's to redact; these are the ones configured inline.
    secrets: (ctx) => ctx.config.accounts.flatMap((account) => [account.apiToken, account.accessToken]),
    tools: TOOLS,
    doctor,
    login: "In Calendly open Integrations > API and webhooks, generate a scoped Personal Access Token and save it privately as CALENDLY_API_TOKEN or an owner-only token-only file via CALENDLY_TOKEN_FILE. For an existing REST OAuth grant use CALENDLY_ACCESS_TOKEN, or a private rotating JSON file via CALENDLY_TOKENS_FILE. OAuth refresh requires persistent storage; no environment-only refresh occurs. login prints setup instructions and does not open a browser, exchange a code or save credentials. Official hosted MCP is a different DCR OAuth connection. Then run calendly-cli doctor --network. See INSTALL.md.\",\n    );\n    return;\n  }\n  if (\n    args.length ||\n    basename(process.argv[1] ?? \"",
    settings: [
      { env: "CALENDLY_API_TOKEN", description: "Private Calendly Personal Access Token.", secret: true },
      { env: "CALENDLY_TOKEN_FILE", description: "Regular private token-only file, max 64 KB." },
      { env: "CALENDLY_ACCESS_TOKEN", description: "Private OAuth access token, without auto-refresh.", secret: true },
      { env: "CALENDLY_TOKENS_FILE", description: "Owner-only rotating OAuth JSON file." },
      { env: "CALENDLY_ACCOUNTS", description: "Named private credentials.", secret: true },
      { env: "CALENDLY_DEFAULT_ACCOUNT", description: "The profile a call uses when it names none.", tuning: true },
      { env: "CALENDLY_REQUEST_TIMEOUT_MS", description: "Each request's deadline; 30000 when unset.", tuning: true },
      { env: "CALENDLY_MIN_REQUEST_INTERVAL_MS", description: "Pacing between requests per account; 1300 when unset.", tuning: true },
      { env: "CALENDLY_MAX_RETRIES", description: "Retries for a GET answered 429; 2 when unset. Writes are never retried.", tuning: true },
    ],
    links: { repository: "https://github.com/thenavidm/calendly-mcp-cli" },
  });
}

export const app = createApp();
