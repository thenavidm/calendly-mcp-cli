import fs from "node:fs";
import crypto from "node:crypto";
const source = "https://developer.calendly.com/openapi/calendly-api.json";
const snapshot = new URL("./calendly-api.snapshot.json", import.meta.url);
const provenance = new URL("./calendly-api.upstream.sha256", import.meta.url);
const refresh = process.argv.includes("--refresh");
let raw = fs.readFileSync(snapshot, "utf8");
if (refresh) {
  const r = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`OpenAPI HTTP ${r.status}`);
  raw = await r.text();
}
const upstreamSha256 = refresh
  ? crypto.createHash("sha256").update(raw).digest("hex")
  : fs.readFileSync(provenance, "utf8").trim();
const api = JSON.parse(raw);
if (!api.paths || api.servers?.[0]?.url !== "https://api.calendly.com")
  throw new Error("Unexpected Calendly schema origin or missing paths.");
function strip(v) {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k]) => !["example", "examples"].includes(k))
        .map(([k, x]) => [k, strip(x)]),
    );
  return v;
}
raw = JSON.stringify(strip(api), null, 2) + "\n";
function clean(v, stack = []) {
  if (Array.isArray(v)) return v.map((x) => clean(x, stack));
  if (!v || typeof v !== "object") return v;
  if (v.$ref) {
    if (stack.includes(v.$ref))
      throw new Error("Circular request schema " + v.$ref);
    if (!v.$ref.startsWith("#/")) throw new Error("External request reference");
    const t = v.$ref
      .slice(2)
      .split("/")
      .reduce((o, k) => o?.[k.replace(/~1/g, "/").replace(/~0/g, "~")], api);
    if (!t) throw new Error("Missing " + v.$ref);
    return clean(
      {
        ...t,
        ...Object.fromEntries(Object.entries(v).filter(([k]) => k !== "$ref")),
      },
      [...stack, v.$ref],
    );
  }
  const o = {};
  for (const [k, x] of Object.entries(v))
    if (
      ![
        "example",
        "examples",
        "readOnly",
        "writeOnly",
        "nullable",
        "xml",
        "discriminator",
      ].includes(k)
    )
      o[k] = clean(x, stack);
  if (v.nullable) {
    if (typeof o.type === "string") o.type = [o.type, "null"];
    if (o.enum && !o.enum.includes(null)) o.enum.push(null);
  }
  if (["double", "int32", "int64"].includes(o.format)) delete o.format;
  if (o.pattern === "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$")
    o.pattern = "^\\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$";
  return o;
}
const snake = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
const aliases = {
  availability_get_event_type_availability:
    "list_event_type_availability_schedules",
  availability_update_event_type_availability:
    "update_event_type_availability_schedules",
  availability_list_user_availability_schedules: "list_availability_schedules",
  availability_get_user_availability_schedule: "get_availability_schedule",
  event_types_list_event_types: "list_event_types",
  event_types_list_event_type_memberships: "list_event_type_hosts",
  locations_list_user_locations: "list_user_locations",
  contacts_delete_contacts_uuid: "delete_contact",
  contacts_patch_contacts_uuid: "update_contact",
  notetaker_delete_meeting_recaps_uuid: "delete_recap",
  notetaker_get_meeting_recaps_uuid_recap: "get_recap",
  notetaker_update_meeting_recaps_uuid: "update_recap",
  notetaker_get_transcript_meeting_recaps: "get_transcript",
  notetaker_list_meeting_recaps: "list_recaps",
  organizations_create_organization_invitation: "invite_to_organization",
  organizations_delete_organization_membership: "remove_from_organization",
  scheduled_events_create_scheduled_event_cancellation: "cancel_event",
  scheduled_events_create_event_invitee: "create_invitee",
  scheduled_events_create_invitee_no_show: "create_no_show",
  scheduled_events_get_invitee_no_show: "get_no_show",
  scheduled_events_delete_invitee_no_show: "delete_no_show",
  scheduled_events_get_scheduled_event: "get_event",
  scheduled_events_list_scheduled_events: "list_events",
  webhooks_create_webhook_subscription: "create_webhook",
  webhooks_list_webhook_subscriptions: "list_webhooks",
  webhooks_get_webhook_subscription: "get_webhook",
  webhooks_delete_webhook_subscription: "delete_webhook",
  activity_log_list_activity_log_entries: "list_activity_log",
};
const idKeys = {
  user_availability_schedules: "schedule_uuid",
  contacts: "contact_uuid",
  custom_field_definitions: "definition_uuid",
  event_types: "event_type_uuid",
  groups: "group_uuid",
  group_relationships: "relationship_uuid",
  meeting_recaps: "recap_uuid",
  organizations: "org_uuid",
  invitations: "invitation_uuid",
  organization_memberships: "membership_uuid",
  routing_forms: "form_uuid",
  routing_form_submissions: "submission_uuid",
  scheduled_events: "event_uuid",
  invitee_no_shows: "no_show_uuid",
  invitees: "invitee_uuid",
};
const operations = [];
for (const [path, item] of Object.entries(api.paths))
  for (const [method, op] of Object.entries(item)) {
    if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
    const operationId = snake(op.operationId);
    const group = snake(op.tags?.[0] ?? "api");
    const name =
      aliases[operationId] ??
      snake(op.operationId.split("_").slice(1).join("_"));
    const body = clean(
      op.requestBody?.content?.["application/json"]?.schema ?? {
        type: "object",
        properties: {},
      },
    );
    if (body.properties) body.additionalProperties = false;
    const params = [...(item.parameters ?? []), ...(op.parameters ?? [])]
      .map((p) => clean(p))
      .filter((p) => ["path", "query"].includes(p.in))
      .map((p) => {
        const segments = path.split("/");
        const key =
          p.in === "path" && p.name === "uuid"
            ? (idKeys[segments[segments.indexOf("{uuid}") - 1]] ?? "uuid")
            : snake(p.name);
        const schema = {
          ...p.schema,
          description: p.description ?? p.schema.description,
        };
        if (p.in === "path")
          Object.assign(schema, { minLength: 1, pattern: "^[A-Za-z0-9_-]+$" });
        if (p.name === "count")
          Object.assign(schema, { minimum: 1, maximum: 100 });
        return {
          ...p,
          key: body.properties?.[key] ? `target_${key}` : key,
          schema,
        };
      });
    if (name === "create_invitee") {
      body.properties.event_guests.maxItems = 10;
      const invitee = body.properties.invitee;
      invitee.properties.email.format = "email";
      invitee.properties.timezone.minLength = 1;
      invitee.anyOf = [
        {
          required: ["name"],
          properties: { name: { type: "string", minLength: 1 } },
        },
        {
          required: ["first_name"],
          properties: { first_name: { type: "string", minLength: 1 } },
        },
      ];
    }
    if (["create_contact", "update_contact"].includes(name)) {
      body.properties.emails.maxItems = 10;
      body.properties.emails.minItems = 1;
      body.properties.phone_numbers.maxItems = 10;
    }
    if (name === "create_no_show") body.required = ["invitee"];
    if (name === "create_webhook") {
      const items = body.properties.events.items;
      items.enum = [
        ...new Set([
          ...items.enum,
          "event_type.created",
          "event_type.updated",
          "event_type.deleted",
        ]),
      ];
      body.properties.events.minItems = 1;
    }
    const risk = method === "get" ? "read" : "destructive";
    const paginated =
      method === "get" &&
      params.some((p) => p.name === "page_token") &&
      params.some((p) => p.name === "count");
    const scope = [
      ...new Set(
        [...op.description.matchAll(/`([a-z_]+:(?:read|write))`/g)].map(
          (m) => m[1],
        ),
      ),
    ];
    const description = `${op.summary}. ${risk === "read" ? "Reads Calendly data." : "Changes Calendly state and requires confirm=true for the specific requested action."}${paginated ? " Supports bounded opaque page_token retrieval." : ""} Required scopes: ${scope.join(", ") || "check endpoint reference"}.`;
    operations.push({
      name,
      title: op.summary,
      description,
      method: method.toUpperCase(),
      path,
      group,
      risk,
      params,
      bodySchema: body,
      bodyRequired:
        op.requestBody?.required === true || Boolean(body.required?.length),
      paginated,
      scope,
      upstreamOperationId: op.operationId,
    });
  }
if (new Set(operations.map((o) => o.name)).size !== operations.length)
  throw new Error("Duplicate operation names");
const info = {
  source,
  checked: new Date().toISOString().slice(0, 10),
  apiVersion: "v2",
  documentVersion: api.info.version,
  sha256: crypto.createHash("sha256").update(raw).digest("hex"),
  upstreamSha256,
  operationCount: operations.length,
  snapshotRedactions: [
    "All upstream example/examples fields are removed before saving; examples are not used for validation.",
  ],
  corrections: [
    "REST routes follow the current OpenAPI, including /locations, /shares and /event_type_availability_schedules. The official MCP table shows different routes; no guessed table aliases are requested.",
    "Conditional booking invitee name/first_name and valid email are enforced. Guest arrays are capped at 10.",
    "Contact email/phone arrays are capped at 10; exactly one primary email is enforced when supplied.",
    "No-show creation requires the documented invitee URI even though the exported schema omits required.",
    "Webhook event enum includes event_type.created/updated/deleted from the endpoint description omitted by the exported enum. Subscription event/scope combinations are validated.",
    "Native cursor paging preserves opaque page_token. No response next_page URL is followed; no invented offset is sent.",
    "Future availability range checks use 31 days for event-type slots and 7 days for user busy times.",
    "The upstream date-rule pattern escapes literal hyphens outside a character class; those two escapes are removed for Unicode-compatible JSON Schema regex validation.",
    "All writes require explicit confirmation and have no automatic retries. OAuth refresh rotation uses owner-only atomic storage and a per-file cross-process lock.",
  ],
};
fs.writeFileSync(
  new URL("../src/tools/operations.json", import.meta.url),
  JSON.stringify(operations, null, 2) + "\n",
);
fs.writeFileSync(
  new URL("../src/tools/api-source.json", import.meta.url),
  JSON.stringify(info, null, 2) + "\n",
);
if (refresh) {
  fs.writeFileSync(snapshot, raw);
  fs.writeFileSync(provenance, upstreamSha256 + "\n");
}
console.log(
  `Generated ${operations.length} current Calendly operations; ${operations.filter((o) => o.risk === "read").length} reads.`,
);
