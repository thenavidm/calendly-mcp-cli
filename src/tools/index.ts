import operationsData from "./operations.json" with { type: "json" };
import { Ajv, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { readFile, lstat } from "node:fs/promises";
import type { Json, CalendlyClient, QueryParam } from "../api/client.js";
import { UsageError } from "../api/errors.js";
import type { Config } from "../config.js";
import type { Risk } from "@thenavidm/slipway";
export type Operation = {
  name: string;
  title: string;
  description: string;
  method: string;
  path: string;
  group: string;
  risk: Risk;
  params: {
    name: string;
    key: string;
    in: string;
    required?: boolean;
    schema: Json;
    style?: string;
    explode?: boolean;
  }[];
  bodySchema: Json;
  bodyRequired: boolean;
  paginated: boolean;
};
export type ToolSpec = {
  name: string;
  title: string;
  description: string;
  group: string;
  inputSchema: Json;
  risk: Risk;
  handler: (args: Json, client: CalendlyClient) => Promise<unknown>;
};
const operations = operationsData as unknown as Operation[];
const ajv = new Ajv({ allErrors: true, strict: false });
(addFormats as unknown as (a: Ajv) => void)(ajv);
function check(validate: ValidateFunction, args: unknown): void {
  if (!validate(args))
    throw new UsageError(ajv.errorsText(validate.errors, { separator: "; " }));
}
function fieldsFor(op: Operation): Json {
  const properties: Json = Object.fromEntries(
    op.params.map((p) => [p.key, p.schema]),
  );
  Object.assign(properties, op.bodySchema.properties ?? {});
  properties.account = {
    type: "string",
    description:
      "Named private Calendly account; selects credentials, not an organization URI.",
  };
  if (op.risk !== "read")
    properties.confirm = {
      type: "boolean",
      description: "Must be true for the specific user-requested write.",
    };
  if (Object.keys(op.bodySchema.properties ?? {}).length) {
    properties.payload = {
      ...op.bodySchema,
      description:
        "Complete JSON request body instead of body flags. Supports nested booking, contact, availability and nullable fields.",
    };
    properties.payload_file = {
      type: "string",
      minLength: 1,
      description:
        "Regular local JSON body file, at most 5 MB. Cannot be mixed with body flags or payload.",
    };
  }
  if (op.paginated) {
    properties.all_pages = {
      type: "boolean",
      description:
        "Read bounded opaque page_token pages; each request consumes quota. Not a snapshot or guaranteed complete backup.",
    };
    properties.max_items = {
      type: "integer",
      minimum: 1,
      maximum: 10000,
      description:
        "Maximum returned records with all_pages=true, default 1000. At most 100 requests; output includes continuation state.",
    };
  }
  return {
    type: "object",
    properties,
    required: op.params.filter((p) => p.required).map((p) => p.key),
    additionalProperties: false,
  };
}
// Each schema compiles on first use: compiling all of them at load held back the server's first answer. compileAll() runs them in tests.
const bodyValidators = new Map<string, ValidateFunction>();
function bodyValidator(op: Operation): ValidateFunction {
  let v = bodyValidators.get(op.name);
  if (!v) bodyValidators.set(op.name, (v = ajv.compile(op.bodySchema)));
  return v;
}
async function execute(
  op: Operation,
  args: Json,
  client: CalendlyClient,
): Promise<unknown> {
  const flat = Object.fromEntries(
    Object.keys(op.bodySchema.properties ?? {})
      .filter((k) => args[k] !== undefined)
      .map((k) => [k, args[k]]),
  );
  if (
    (args.payload !== undefined || args.payload_file !== undefined) &&
    Object.keys(flat).length
  )
    throw new UsageError(
      "Use individual body flags or payload/payload_file without mixing them.",
    );
  if (args.payload !== undefined && args.payload_file !== undefined)
    throw new UsageError("Use payload or payload_file, not both.");
  if (
    op.bodyRequired &&
    !Object.keys(flat).length &&
    args.payload === undefined &&
    args.payload_file === undefined
  ) {
    throw new UsageError(
      "This operation requires a JSON body; inspect schema and provide body flags or payload/payload_file.",
    );
  }
  let body: Json = args.payload ?? flat;
  if (args.payload_file)
    try {
      const stat = await lstat(args.payload_file);
      if (!stat.isFile() || stat.size > 5 * 1024 * 1024) throw new Error();
      body = JSON.parse(await readFile(args.payload_file, "utf8"));
    } catch {
      throw new UsageError(
        "payload_file must be a regular JSON body file, at most 5 MB.",
      );
    }

  check(bodyValidator(op), body);
  validateSemantics(op, args, body);
  if (
    ["PUT", "PATCH"].includes(op.method) &&
    Object.keys(op.bodySchema.properties ?? {}).length &&
    !Object.keys(body).length
  )
    throw new UsageError("Provide at least one field to update.");
  if (args.max_items !== undefined && !args.all_pages)
    throw new UsageError("max_items requires all_pages=true.");
  const path = op.params
    .filter((p) => p.in === "path")
    .reduce(
      (path, p) =>
        path.replace(`{${p.name}}`, encodeURIComponent(String(args[p.key]))),
      op.path,
    );
  const query: QueryParam[] = op.params
    .filter((p) => p.in === "query" && args[p.key] !== undefined)
    .map((p) => ({
      name: p.name,
      value: args[p.key],
      style: p.style,
      explode: p.explode,
    }));
  if (!args.all_pages)
    return client.sanitize(
      await client.request(
        op.method,
        path,
        query,
        op.bodyRequired || Object.keys(body).length ? body : undefined,
        args.account,
      ),
    );
  const max = args.max_items ?? 1000;
  const count = Math.min(args.count ?? 20, max);
  let token: string | undefined = args.page_token;
  let pages = 0;
  const records: unknown[] = [];
  const seen = new Set<string>();
  let last: Json = {};
  let skip = 0;
  let next: string | undefined;
  const fixed = query.filter((p) => !["page_token", "count"].includes(p.name));
  for (;;) {
    if (token) {
      if (seen.has(token))
        throw new UsageError(
          "Repeated Calendly page token; refusing further quota-consuming requests.",
        );
      seen.add(token);
    }
    last = await client.request(
      "GET",
      path,
      [
        ...fixed,
        { name: "count", value: count },
        ...(token ? [{ name: "page_token", value: token }] : []),
      ],
      undefined,
      args.account,
    );
    pages++;
    if (
      !Array.isArray(last.collection) ||
      !last.pagination ||
      typeof last.pagination !== "object"
    )
      throw new UsageError(
        "Response does not match Calendly collection/page_token pagination.",
      );
    next = last.pagination.next_page_token ?? undefined;
    if (next !== undefined && (typeof next !== "string" || !next))
      throw new UsageError("Invalid next_page_token in Calendly response.");
    if (next && (!last.collection.length || seen.has(next)))
      throw new UsageError(
        "Empty or repeated Calendly page; refusing further requests.",
      );
    const taken = last.collection.slice(0, max - records.length);
    records.push(...taken);
    skip = taken.length;
    if (
      skip < last.collection.length ||
      records.length >= max ||
      pages >= 100 ||
      !next
    )
      break;
    token = next;
  }
  const partial = skip < last.collection.length;
  const truncated = partial || Boolean(next);
  return client.sanitize({
    ...last,
    collection: records,
    collected: records.length,
    pages,
    truncated,
    resume: truncated
      ? {
          page_token: partial ? (token ?? null) : next,
          count,
          skip: partial ? skip : 0,
        }
      : null,
  });
}
function validateSemantics(op: Operation, args: Json, body: Json): void {
  if (
    ["list_event_type_available_times", "list_user_busy_times"].includes(
      op.name,
    )
  ) {
    const start = Date.parse(args.start_time),
      end = Date.parse(args.end_time),
      days = op.name === "list_event_type_available_times" ? 31 : 7;
    if (start < Date.now() || end <= start || end - start > days * 86400000)
      throw new UsageError(
        `Availability needs a future increasing range of at most ${days} days.`,
      );
  }
  if (
    ["create_contact", "update_contact"].includes(op.name) &&
    body.emails &&
    body.emails.filter((e: Json) => e.is_primary === true).length !== 1
  )
    throw new UsageError("Provide exactly one primary email.");
  if (op.name === "create_webhook") {
    if (body.scope === "user" && !body.user)
      throw new UsageError("User webhook scope requires a user URI.");
    if (body.scope === "group" && !body.group)
      throw new UsageError("Group webhook scope requires a group URI.");
    if (
      body.events.some((e: string) => e.startsWith("meeting_recap.")) &&
      body.scope !== "user"
    )
      throw new UsageError("Meeting recap webhooks require user scope.");
    if (
      body.events.includes("routing_form_submission.created") &&
      body.scope !== "organization"
    )
      throw new UsageError(
        "Routing form submission webhooks require organization scope.",
      );
    if (!body.url.startsWith("https://"))
      throw new UsageError(
        "Webhook delivery must use a public HTTPS endpoint.",
      );
  }
  if (op.name === "create_share") {
    if (body.period_type === "fixed" && (!body.start_date || !body.end_date))
      throw new UsageError("Fixed shares require start_date and end_date.");
    if (
      ["moving", "available_moving"].includes(body.period_type) &&
      body.max_booking_time === undefined
    )
      throw new UsageError("Moving shares require max_booking_time.");
  }
}
export const ALL_TOOLS: ToolSpec[] = operations.map((op) => ({
  name: op.name,
  title: op.title,
  description: op.description,
  group: op.group,
  inputSchema: fieldsFor(op),
  risk: op.risk,
  handler: (args, client) => execute(op, args, client),
}));
ALL_TOOLS.push({
  name: "list_accounts",
  title: "List configured accounts",
  description:
    "List private account labels, default selection and configured token method. No credentials, token paths or Calendly content; no network request.",
  group: "accounts",
  risk: "read",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  handler: async (_args, client) => ({
    accounts: client.config.accounts.map((a) => ({
      name: a.name,
      default: a.name === client.config.defaultAccount,
      auth: a.tokensFile
        ? "rotating_oauth_file"
        : a.accessToken
          ? "oauth_access_token"
          : a.tokenFile
            ? "pat_file"
            : a.apiToken
              ? "pat"
              : "not_configured",
    })),
  }),
});
const validators = new Map<string, ValidateFunction>();
function validatorFor(tool: ToolSpec): ValidateFunction {
  let v = validators.get(tool.name);
  if (!v) validators.set(tool.name, (v = ajv.compile(tool.inputSchema)));
  return v;
}
export function validateArguments(tool: ToolSpec, args: Json): void {
  check(validatorFor(tool), args);
}
/** Compile every input and body schema, as loading once did, so a test can prove they all compile. */
export function compileAll(): number {
  for (const t of ALL_TOOLS) validatorFor(t);
  for (const op of operations) bodyValidator(op);
  return validators.size + bodyValidators.size;
}
export function visibleTools(config: Config): ToolSpec[] {
  return ALL_TOOLS.filter((t) => !config.readOnly || t.risk === "read");
}
