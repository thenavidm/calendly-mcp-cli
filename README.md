<img src="https://cdn.navid.media/shared/tool-logos/calendly.png" alt="Calendly" width="88">

# Calendly MCP Server & CLI

[![npm](https://img.shields.io/npm/v/@thenavidm/calendly-mcp-cli?color=orange&label=npm)](https://www.npmjs.com/package/@thenavidm/calendly-mcp-cli)
[![CI](https://github.com/thenavidm/calendly-mcp-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/thenavidm/calendly-mcp-cli/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-AGPL--3.0-green)](./LICENSE)
[![YouTube](https://img.shields.io/badge/YouTube-@thenavidm-red?logo=youtube&logoColor=white)](https://youtube.com/@thenavidm?sub_confirmation=1)
[![X](https://img.shields.io/badge/X-@thenavidm-black?logo=x)](https://x.com/thenavidm)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-thenavidm-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/thenavidm)

Calendly MCP server and CLI for Claude Code, Codex and AI agents. **66 tools: 44 reads and 22 confirmed writes** for scheduling, contacts, custom fields, Notetaker recaps, transcripts, availability, organizations and webhooks.

One package provides local MCP, the same operations as task CLI commands, and a bundled Claude Desktop .mcpb extension.

Built and maintained by [Navid Moazzez](https://navid.me?utm_source=github&utm_medium=referral&utm_campaign=calendly-mcp-cli&utm_content=readme). Complete installation and private account setup are in [INSTALL.md](INSTALL.md).

<img src="https://cdn.navid.me/repos/calendly-mcp-cli-retina.gif" alt="Illustrated Calendly workflow in the same house terminal used on navid.me" width="520">

The terminal illustrates shipped scheduling tools with sample data; it is not a verified live account booking.

You need a privately configured scoped PAT or authorized REST OAuth grant. Account roles, paid features and quotas apply. The wrapper preserves AGPL-3.0-or-later; Calendly service charges remain separate. This is a community product.

Calendly already offers an official hosted MCP and a community CLI exists. Our current API coverage and tradeoffs are compared below, without unsupported coverage or efficiency claims.

## Two ways to use it

### Command line

```bash
npm install -g @thenavidm/calendly-mcp-cli@latest
calendly-cli
calendly-cli list-events --help
calendly-cli schema create-invitee
calendly-cli get-current-user --agent
```

Configure private credentials before account calls. Every write requires --confirm; --yes and --agent do not authorize changes.

### MCP server, for your AI app

```bash
codex mcp add calendly -- npx -y @thenavidm/calendly-mcp-cli@latest
```

Then ask: *Find available slots for the event type I choose, and wait for my booking details.* All declared client/OS routes are in INSTALL.md.

### Which one

| Where you work | Surface |
| --- | --- |
| Claude Code, Codex, Cursor or another shell agent | MCP, CLI or both |
| Claude Desktop chat | Local MCP or desktop bundle |
| Scripts/CI | CLI or an MCP client |
| Remote-URL-only clients with DCR support | Official hosted Calendly MCP |

## Features

| Capability | CLI | MCP |
| --- | --- | --- |
| Identity and events | get-current-user / list-events | get_current_user / list_events |
| Availability and booking | list-event-type-available-times / create-invitee | Same underscore names |
| Contacts/custom fields | list-contacts / list-contact-custom-field-definitions | Same shared schemas |
| Recaps/transcripts | list-recaps / get-transcript | Same account permissions |
| Organizations and webhooks | list-organization-memberships / list-webhooks | Same guarded writes |
| Private account labels | list-accounts | list_accounts |
| Setup diagnosis | doctor / login | CLI utilities |

## Contents

| Number | Section | Covers |
| --- | --- | --- |
| 1 | [What you can ask it](#1-what-you-can-ask-it) | Prompts and coverage |
| 2 | [Quick install](#2-quick-install) | CLI, MCP and desktop |
| 3 | [Set up Calendly access](#3-set-up-calendly-access) | PAT, OAuth, scopes and quotas |
| 4 | [Connect your client](#4-connect-your-client) | All declared clients/OS |
| 5 | [Check it works](#5-check-it-works) | Doctor and first read |
| 6 | [Output, flags and exit codes](#6-output-flags-and-exit-codes) | Arguments, JSON and scripting |
| 7 | [MCP or CLI and token cost](#7-mcp-or-cli-and-token-cost) | Actual usage comparison |
| 8 | [Every tool and argument](#8-every-tool-and-argument) | Every operation and argument |
| 9 | [Scheduling, contacts and recap workflows](#9-scheduling-contacts-and-recap-workflows) | Booking, contacts, recaps and webhooks |
| 10 | [Pagination, quotas and accepted operations](#10-pagination-quotas-and-accepted-operations) | Opaque tokens and pending requests |
| 11 | [Several private accounts](#11-several-private-accounts) | Named private grants |
| 12 | [Writing safely](#12-writing-safely) | Confirmation and audit |
| 13 | [How it works](#13-how-it-works) | Shared architecture and maintenance |
| 14 | [Your data](#14-your-data) | Privacy and credentials |
| 15 | [Environment variables](#15-environment-variables) | Credential, safety and tuning |
| 16 | [Updates and removal](#16-updates-and-removal) | Upgrade and revoke |
| 17 | [Troubleshooting](#17-troubleshooting) | Symptoms and remedies |
| 18 | [API coverage and comparisons](#18-api-coverage-and-comparisons) | Official/community evidence |
| 19 | [Versions](#19-versions) | Versions and migration |
| 20 | [FAQ](#20-faq) | Accordion questions |


## 1. What you can ask it

- Show my current user and the event types I can access.
- Find available slots for the selected event type and time zone.
- Book the specific slot and invitee I approved.
- Read that booking before a requested cancellation.
- Find a contact and inspect its custom field definitions before changing it.
- Read an authorized meeting recap or transcript, and keep its contents private.
- Inspect existing availability rules before the requested replacement.
- List organization members, groups, routing submissions and webhook subscriptions.

The current API v2 snapshot has 65 operations. With the local account-label helper, this package exposes **66 tools: 44 reads and 22 confirmed writes**. One source serves local MCP, task CLI and the bundled desktop extension. Booking sends normal calendar invites, notifications and workflows. A generated scheduling link is not a booked event.

The official hosted MCP is a strong scheduling option. This package adds local CLI use, private PAT/REST OAuth grants, named accounts, current Contacts/Notetaker operations, schema-derived help and controlled output. Coverage differences are based on reviewed documentation, not a competitor handshake or a measured superiority claim. Live account outcomes and GUI installation remain separately unverified.

## 2. Quick install

```bash
npm install -g @thenavidm/calendly-mcp-cli@latest
calendly-cli --version
calendly-cli login
calendly-cli doctor
calendly-cli tools
```

Manual CLI/local MCP requires Node 22 or newer. Discovery and schemas work without credentials; account reads need private access. The versioned [desktop archive](https://github.com/thenavidm/calendly-mcp-cli/releases/download/v2.0.0/calendly-2.0.0.mcpb) bundles production dependencies for a compatible Claude Desktop host. See [INSTALL.md](INSTALL.md) for every declared client and OS.

After private configuration:

```bash
codex mcp add calendly -- npx -y @thenavidm/calendly-mcp-cli@latest
codex mcp list
```

## 3. Set up Calendly access

### Personal Access Token for your own account

1. Sign in to the intended Calendly account.
2. Open **Integrations > API and webhooks**, or [the token page](https://calendly.com/integrations/api_webhooks).
3. Create a named Personal Access Token with the scopes your workflow requires. Copy it once into private storage.
4. Set `CALENDLY_API_TOKEN` in private local client/shell settings, or `CALENDLY_TOKEN_FILE` to an absolute token-only file outside repositories.
5. Run `calendly-cli doctor`, then `calendly-cli doctor --network` to check a user read.

See [current PAT setup](https://developer.calendly.com/docs/authentication/how-to-authenticate-with-personal-access-tokens). The token is a Bearer credential, not your Calendly password or browser cookie. Revocation is done in Calendly. GUI clients may not inherit terminal variables; this package does not load .env automatically. On POSIX, a credential file must be owner-only, such as mode 0600; on Windows protect the file and its directory with user-only ACLs. Readers refuse symlinks and files larger than 64 KB. A PAT file takes precedence over the environment PAT, and is cached until restart.

### Existing REST OAuth grant

Use your own authorized [REST OAuth application](https://developer.calendly.com/docs/authentication/creating-an-oauth-app) when acting for users who consent to your application. This local package does not create an OAuth app, open a browser, host a callback or exchange the first authorization code. `login` prints setup instructions. Put an existing access token in `CALENDLY_ACCESS_TOKEN`, or the full grant in a private file selected by `CALENDLY_TOKENS_FILE`. Do not mix PAT and OAuth settings for the same account.

The token file is a JSON object containing `access_token`, and optionally `refresh_token`, `client_id`, `client_secret`, `created_at` (Unix seconds) and `expires_in` (seconds). Keep all actual values outside model context and repositories. A file is required for automatic refresh; an environment-only access token is never refreshed. The file is read on each request, allowing separate processes to observe a saved rotation. Without valid expiry metadata, one GET 401 can trigger one configured refresh; writes never retry after a 401.

Calendly's [single-use refresh-token rule](https://developer.calendly.com/docs/authentication/refresh-token-rotation-guide) took effect by August 31, 2026. This package refreshes against `https://calendly.com/oauth/token`, uses Basic client authentication for confidential clients or a body client_id without a secret, and atomically replaces both returned tokens in mode 0600 storage. Concurrent in-process refreshes share one promise, and a per-file `.refresh.lock` prevents another process from consuming the same token. An existing lock produces a configuration error instead of a second refresh. A crashed process can leave a lock; stop all users of that grant and verify its state before manually removing a stale lock. Never remove an active lock.

A refresh HTTP failure, unknown timeout, incomplete response or failed save requires reauthorization/private storage repair and a restart. No automatic refresh retry occurs. The old refresh token is not deliberately reused after an uncertain result. OAuth access tokens last two hours according to the current token reference; actual expiry metadata governs proactive refresh. Token rotation fixtures are verified; live grants remain unverified.

### Scopes, roles and plans

API operation descriptions list their required scopes. `:write` grants include the family's read access. Start with `users:read` for doctor, then select only needed scheduling, availability, contacts, meeting_recaps, organization, routing, group or webhook scopes. Webhooks need `webhooks:write` plus the corresponding event family's read scope. Reauthorize or replace the token if scopes change; an installed command cannot raise permissions.

Direct booking through `create_invitee` requires a paid Standard-or-higher account. Routing Forms require Teams or higher; Activity Log, outgoing communications and data-compliance deletion require Enterprise and suitable organization permissions. Notetaker endpoints require a paid plan; Contacts/Notetaker data exists only where the account and associated feature provide it. API access does not create transcripts or bypass recording/consent policy. Administrative operations depend on your actual role. See [authorization scopes](https://developer.calendly.com/docs/authentication/scopes) and the current endpoint reference before choosing a plan.

### Current request limits

The [quota reference](https://developer.calendly.com/api-docs/overview/rate-limits) documents 50 requests per user/minute on Free and 500 on paid plans. Booking has tighter limits: trial 5/day; paid non-Enterprise 10/minute, 50/hour and 100/day; Enterprise 500/minute. OAuth token requests are limited to 8/user/minute. These are shared provider limits, not allowances reserved for this process.

Default local pacing is 1,300 ms per account/process; multiple account labels for one user and other integrations share that user's quota. GET 429 handling respects Retry-After or X-RateLimit-Reset when the wait is at most ten seconds. Longer waits surface exit 7 so a script can pause explicitly, rather than retry too early. Writes and OAuth refresh requests have zero automatic retries. Every page and retried read consumes quota.

### Official hosted MCP is a separate connection

[Calendly's official MCP](https://developer.calendly.com/docs/mcp/calendly-mcp-server) is hosted at `https://mcp.calendly.com`. It uses OAuth 2.1, PKCE S256, resource discovery and Dynamic Client Registration. It does not accept a PAT or a manually provisioned console client_id/client_secret connection. A client prompting only for static OAuth credentials is incompatible with that documented flow. The documentation search MCP at `https://developer.calendly.com/_mcp/server` reads docs; it does not operate your account. Keep all three entries distinct.

## 4. Connect your client

[INSTALL.md](INSTALL.md) covers Claude Code, Codex, Claude Desktop extension/manual config, Cursor, VS Code/Copilot, Windsurf, Zed, Gemini CLI, Cline, Docker and other stdio clients on macOS, Windows and Linux. Use `npx -y @thenavidm/calendly-mcp-cli@latest` as the local server command, with private environment settings. MCP and CLI are two ways to reach the same operations; installing both is optional.

A remote-URL-only client needs a hosted connector such as Calendly's official `https://mcp.calendly.com`, with DCR OAuth support. This package does not expose a public HTTP relay. Installing a local server does not connect it to a browser-only app. Place [SKILL.md](SKILL.md) in the agent's supported skills folder if using shell commands; npm does not register it automatically. Ask the agent to inspect current help/schemas and assist with private setup without asking you to paste credentials into chat.

## 5. Check it works

```bash
calendly-cli --version
calendly-cli doctor
calendly-cli doctor --network
calendly-cli list-accounts --agent
calendly-cli get-current-user --agent
```

The local doctor checks configuration. Network doctor reads `/users/me` and reports success without printing user details; it does not book, cancel or invite anyone. A successful read proves that read's access, not every endpoint/plan permission. Full discovery has 66 tools; read-only has 44. Use the returned canonical user and organization URIs in subsequent filters, rather than substituting a bare UUID.

## 6. Output, flags and exit codes

Tool names become dashed commands; underscores are accepted too. Path parameter names follow the discovered schema, such as `event_uuid` → `--event-uuid`. Body tools accept individual top-level flags, complete `--payload` JSON, or `--payload-file` pointing to a regular JSON body file up to 5 MB. Do not mix those body routes. Path/query flags remain separate. Nested objects take JSON and array flags repeat once per item; a whole array is not a single item.

```bash
calendly-cli get-event --help
calendly-cli schema create-invitee
calendly-cli list-events --user https://api.calendly.com/users/USER_UUID --count 10 --agent
calendly-cli list-contacts --email user@example.com --count 5 --agent
```

UUIDs and URIs are illustrative; use resources discovered in your own account. Nullable fields require an actual JSON null inside payload; `--field null` is a string. Nested request properties follow the current schema; unknown top-level body fields are refused. Body-required fields are validated during execution even when the wrapper schema allows an alternative payload route. Operations whose upstream request body is required need body flags or an explicit payload; a deliberately supplied empty object is sent as JSON, never omitted.

| Flag | Behavior |
| --- | --- |
| --help / schema COMMAND | Current argument help / full JSON Schema |
| --json | Structured JSON |
| --compact | One-line JSON |
| --agent | Compact JSON, no prompts or color |
| --select a,b.c | Keep selected fields, including nested objects/arrays |
| --no-color / --no-input | Noninteractive house flags |
| --yes | Never replaces write confirmation |
| --confirm | Confirm only the requested mutation |
| --account NAME | Select private local credentials |
| --payload JSON / --payload-file PATH | Complete request body, mutually exclusive with body flags |

| Exit | Meaning |
| --- | --- |
| 0 | Success |
| 2 | Invalid arguments or refused write |
| 3 | Resource not found |
| 4 | Authentication/permission failure |
| 5 | API/transport failure |
| 7 | Rate limit |
| 10 | Missing or invalid private configuration |

Results go to stdout, errors as JSON to stderr. Selection changes local output, not the original API response or quota charge. API success is not proof of notification delivery or a completed export.

## 7. MCP or CLI and token cost

MCP and CLI use the same SDK server, schemas, validation and HTTP handlers. The CLI talks to that server through the SDK's in-memory transport; there is no second API implementation.

| Measurement | What to include |
| --- | --- |
| Eager MCP loading | All tool schemas and instructions |
| Default/deferred tool search | Actual selected schemas and discovery overhead |
| Skill read once | Full SKILL.md and command discovery |
| Recurring skill discovery | The installed skill's listing text |
| Matched successful task | Help/schema, reasoning, calls/commands, results, errors and retries |

Fresh usage measurements are pending. Codex is the current validation priority. No Claude Code installation or subscription is required to use either surface. No estimated savings are published as measurements. Do not estimate tokens from characters, substitute another repo's results or declare zero CLI cost. Record model/client/package versions and date, loading settings, input/output usage, latency and equivalent outcomes. Compare a small user/event query and repeated focused scheduling across supported official/local surfaces, using the same authorized data and result fields. API quota and service costs remain separate. No measured superiority is claimed.

## 8. Every tool and argument

All 65 API operations come from the pinned current official OpenAPI. `list_accounts` is local. Each tool is the same dashed CLI command. Top-level flags and nested request fields are shown below; `schema COMMAND` returns complete unions, enums and conditional rules. Body requirements apply whether you use individual flags or payload/payload_file.

| Tool | REST operation | Mode | Required scope |
| --- | --- | --- | --- |
| `list_activity_log` | `GET /activity_log_entries` | Read | `activity_log:read` |
| `get_availability_schedule` | `GET /user_availability_schedules/{uuid}` | Read | `availability:read` |
| `list_event_type_availability_schedules` | `GET /event_type_availability_schedules` | Read | `availability:read` |
| `update_event_type_availability_schedules` | `PATCH /event_type_availability_schedules` | Write, confirms | `availability:write` |
| `list_availability_schedules` | `GET /user_availability_schedules` | Read | `availability:read` |
| `list_user_busy_times` | `GET /user_busy_times` | Read | `availability:read` |
| `create_contact` | `POST /contacts` | Write, confirms | `contacts:write` |
| `list_contacts` | `GET /contacts` | Read | `contacts:read` |
| `delete_contact` | `DELETE /contacts/{uuid}` | Write, confirms | `contacts:write` |
| `get_contact` | `GET /contacts/{uuid}` | Read | `contacts:read` |
| `update_contact` | `PATCH /contacts/{uuid}` | Write, confirms | `contacts:write` |
| `get_contact_custom_field_definition` | `GET /contacts/custom_field_definitions/{uuid}` | Read | `contacts:read` |
| `list_contact_custom_field_definitions` | `GET /contacts/custom_field_definitions` | Read | `contacts:read` |
| `delete_invitee_data` | `POST /data_compliance/deletion/invitees` | Write, confirms | `data_compliance:write` |
| `delete_scheduled_event_data` | `POST /data_compliance/deletion/events` | Write, confirms | `data_compliance:write` |
| `create_event_type` | `POST /event_types` | Write, confirms | `event_types:write` |
| `list_event_types` | `GET /event_types` | Read | `event_types:read` |
| `create_one_off_event_type` | `POST /one_off_event_types` | Write, confirms | `event_types:write` |
| `get_event_type` | `GET /event_types/{uuid}` | Read | `event_types:read` |
| `update_event_type` | `PATCH /event_types/{uuid}` | Write, confirms | `event_types:write` |
| `list_event_type_available_times` | `GET /event_type_available_times` | Read | `availability:read` |
| `list_event_type_hosts` | `GET /event_type_memberships` | Read | `event_types:read` |
| `get_group` | `GET /groups/{uuid}` | Read | `groups:read` |
| `get_group_relationship` | `GET /group_relationships/{uuid}` | Read | `groups:read` |
| `list_group_relationships` | `GET /group_relationships` | Read | `groups:read` |
| `list_groups` | `GET /groups` | Read | `groups:read` |
| `list_user_locations` | `GET /locations` | Read | `locations:read` |
| `delete_recap` | `DELETE /meeting_recaps/{uuid}` | Write, confirms | `meeting_recaps:write` |
| `get_recap` | `GET /meeting_recaps/{uuid}` | Read | `meeting_recaps:read` |
| `update_recap` | `PATCH /meeting_recaps/{uuid}` | Write, confirms | `meeting_recaps:write` |
| `get_transcript` | `GET /meeting_recaps/{uuid}/transcript` | Read | `meeting_recaps:read` |
| `list_recaps` | `GET /meeting_recaps` | Read | `meeting_recaps:read` |
| `get_organization` | `GET /organizations/{uuid}` | Read | `organizations:read` |
| `get_organization_invitation` | `GET /organizations/{org_uuid}/invitations/{uuid}` | Read | `organizations:read` |
| `revoke_organization_invitation` | `DELETE /organizations/{org_uuid}/invitations/{uuid}` | Write, confirms | `organizations:write` |
| `get_organization_membership` | `GET /organization_memberships/{uuid}` | Read | `organizations:read` |
| `remove_from_organization` | `DELETE /organization_memberships/{uuid}` | Write, confirms | `organizations:write` |
| `get_team` | `GET /teams/{team_uuid}` | Read | `organizations:read` |
| `invite_to_organization` | `POST /organizations/{uuid}/invitations` | Write, confirms | `organizations:write` |
| `list_organization_invitations` | `GET /organizations/{uuid}/invitations` | Read | `organizations:read` |
| `list_organization_memberships` | `GET /organization_memberships` | Read | `organizations:read` |
| `list_teams` | `GET /teams` | Read | `organizations:read` |
| `list_outgoing_communications` | `GET /outgoing_communications` | Read | `outgoing_communications:read` |
| `get_routing_form` | `GET /routing_forms/{uuid}` | Read | `routing_forms:read` |
| `get_routing_form_submission` | `GET /routing_form_submissions/{uuid}` | Read | `routing_forms:read` |
| `list_routing_form_submissions` | `GET /routing_form_submissions` | Read | `routing_forms:read` |
| `list_routing_forms` | `GET /routing_forms` | Read | `routing_forms:read` |
| `cancel_event` | `POST /scheduled_events/{uuid}/cancellation` | Write, confirms | `scheduled_events:write` |
| `create_invitee` | `POST /invitees` | Write, confirms | `scheduled_events:write` |
| `create_no_show` | `POST /invitee_no_shows` | Write, confirms | `scheduled_events:write` |
| `delete_no_show` | `DELETE /invitee_no_shows/{uuid}` | Write, confirms | `scheduled_events:write` |
| `get_no_show` | `GET /invitee_no_shows/{uuid}` | Read | `scheduled_events:read` |
| `get_event` | `GET /scheduled_events/{uuid}` | Read | `scheduled_events:read` |
| `get_event_invitee` | `GET /scheduled_events/{event_uuid}/invitees/{invitee_uuid}` | Read | `scheduled_events:read` |
| `list_event_invitees` | `GET /scheduled_events/{uuid}/invitees` | Read | `scheduled_events:read` |
| `list_events` | `GET /scheduled_events` | Read | `scheduled_events:read` |
| `create_scheduling_link` | `POST /scheduling_links` | Write, confirms | `scheduling_links:write` |
| `create_share` | `POST /shares` | Write, confirms | `shares:write` |
| `get_current_user` | `GET /users/me` | Read | `users:read` |
| `get_user` | `GET /users/{uuid}` | Read | `users:read` |
| `create_webhook` | `POST /webhook_subscriptions` | Write, confirms | `scheduled_events:read`, `event_types:read`, `meeting_recaps:read`, `routing_forms:read`, `contacts:read`, `webhooks:write` |
| `list_webhooks` | `GET /webhook_subscriptions` | Read | `webhooks:read` |
| `delete_webhook` | `DELETE /webhook_subscriptions/{webhook_uuid}` | Write, confirms | `webhooks:write` |
| `get_webhook` | `GET /webhook_subscriptions/{webhook_uuid}` | Read | `webhooks:read` |
| `get_sample_webhook_data` | `GET /sample_webhook_data` | Read | `webhooks:read` |
| `list_accounts` | Local, no network | Read | None |

#### list_activity_log

`calendly-cli list-activity-log` · `GET /activity_log_entries`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `organization` | query `organization` | Yes | string | Return activity log entries from the organization associated with this URI format: `uri`. |
| `search_term` | query `search_term` | No | string | Filters entries based on the search term.  Supported operators:   - `/` - to allow filtering by one term or another. Example: `this / that`   - `+` - to allow filtering by one term and another. Example: `this + that`   - `"` - to allow filtering by an exact search term. Example: `"email@website.com"`   - `-` - to omit specific terms from results. Example: `Added -User`   - `()` - to allow specifying precedence during a search. Example: `(this + that) OR (person + place)`   - `*` - to allow prefix searching. Example `*@other-website.com` maxLength: `300`. |
| `actor` | query `actor` | No | array | Return entries from the user(s) associated with the provided URIs Array items: string. |
| `sort` | query `sort` | No | array | Order results by the specified field and direction. List of {field}:{direction} values. default: `['occurred_at:desc']`. Array items: string. |
| `min_occurred_at` | query `min_occurred_at` | No | string | Include entries that occurred after this time (sample time format: "2020-01-02T03:04:05.678Z"). This time should use the UTC timezone. format: `date-time`. |
| `max_occurred_at` | query `max_occurred_at` | No | string | Include entries that occurred prior to this time (sample time format: "2020-01-02T03:04:05.678Z"). This time should use the UTC timezone. format: `date-time`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `namespace` | query `namespace` | No | array | The categories of the entries Array items: string. |
| `action` | query `action` | No | array | The action(s) associated with the entries Array items: string. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### get_availability_schedule

`calendly-cli get-availability-schedule` · `GET /user_availability_schedules/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `schedule_uuid` | path `uuid` | Yes | string | The UUID of the availability schedule. minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### list_event_type_availability_schedules

`calendly-cli list-event-type-availability-schedules` · `GET /event_type_availability_schedules`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type` | query `event_type` | Yes | string | The URI associated with the event type format: `uri`. |
| `account` | Local | No | string | Named private credential label |

#### update_event_type_availability_schedules

`calendly-cli update-event-type-availability-schedules` · `PATCH /event_type_availability_schedules`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type` | query `event_type` | Yes | string | Event Type uri in which to update the availability schedule format: `uri`. |
| `availability_rule` | Body | Yes in body | object | Object requires: `timezone`. |
| `availability_rule.timezone` | Nested body | Yes in body | string | The timezone for which this Event Type Availability Schedule is originated in. |
| `availability_rule.rules` | Nested body | No | array | The rules for an availability schedule.  Warning: Updating rules will overwrite all existing rules for the event type. Use the GET endpoint to first retrieve the existing rules and then pass the modified rules to the rules object. Array items: object. |
| `availability_rule.rules[].type` | Nested body | Yes in body | string | The type of this Availability Rule; can be "wday" or a specific "date". Values: `wday`, `date`. |
| `availability_rule.rules[].intervals` | Nested body | Yes in body | array | The intervals to be applied to this Rule. Each interval represents when booking a meeting is allowed. If the interval array is empty, then there is no booking availability for that day. Time is in 24h format (i.e. "17:30") and local to the timezone in the Availability Schedule. Array items: object. |
| `availability_rule.rules[].intervals[].from` | Nested body | No | string | Format: `"hh:mm"` pattern: `(\d\d):(\d\d)`. |
| `availability_rule.rules[].intervals[].to` | Nested body | No | string | Format: `"hh:mm"` pattern: `(\d\d):(\d\d)`. |
| `availability_rule.rules[].wday` | Nested body | No | string | The day of the week for which this Rule should be applied to. Values: `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`. |
| `availability_rule.rules[].date` | Nested body | No | string | A specific date in the future that this should be applied to (i.e. "2030-12-31"). pattern: `^\d{4}-(0?[1-9]/1[012])-(0?[1-9]/[12][0-9]/3[01])$`. |
| `availability_rule.user` | Nested body | No | string | Required when an admin or org owner is making the call to update a specific users availability schedule format: `uri`. |
| `availability_setting` | Body | No | string | By default every host on the Event Type shares an identical schedule. default: `host`. Values: `host`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### list_availability_schedules

`calendly-cli list-availability-schedules` · `GET /user_availability_schedules`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `user` | query `user` | Yes | string | A URI reference to a user format: `uri`. |
| `account` | Local | No | string | Named private credential label |

#### list_user_busy_times

`calendly-cli list-user-busy-times` · `GET /user_busy_times`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `user` | query `user` | Yes | string | The uri associated with the user format: `uri`. |
| `start_time` | query `start_time` | Yes | string | Start time of the requested availability range. Date cannot be in the past. |
| `end_time` | query `end_time` | Yes | string | End time of the requested availability range. Date must be in the future of start_time. |
| `account` | Local | No | string | Named private credential label |

#### create_contact

`calendly-cli create-contact` · `POST /contacts`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `name` | Body | Yes in body | string | Current schema |
| `emails` | Body | Yes in body | array | The user's email addresses. Max 10. minItems: `1`. maxItems: `10`. Array items: object. |
| `emails[].email` | Nested body | Yes in body | string | Email address. format: `email`. |
| `emails[].is_primary` | Nested body | Yes in body | boolean | Whether this is the primary email. |
| `phone_numbers` | Body | No | array | The user's phone numbers. Max 10. maxItems: `10`. Array items: object. |
| `phone_numbers[].phone_number` | Nested body | Yes in body | string | Phone number. |
| `timezone` | Body | No | string | Current schema |
| `job_title` | Body | No | string | Current schema |
| `company` | Body | No | string | Current schema |
| `country` | Body | No | string | Current schema |
| `state` | Body | No | string | Current schema |
| `city` | Body | No | string | Current schema |
| `linkedin` | Body | No | string | format: `uri`. |
| `custom_fields` | Body | No | array | Custom field values to set on the contact. Each item requires a `uuid` (the custom field definition identifier) and a `value`; any other keys (such as `label`) are ignored. The entire request is rejected if any `uuid` is unknown, any `value` is the wrong type for its field (including an array for a scalar field or a scalar for an array field), or any `single_select` `value` is not one of the field definition's option `uuid`s. Array items: object. |
| `custom_fields[].uuid` | Nested body | Yes in body | string | Unique identifier of the custom field definition. |
| `custom_fields[].value` | Nested body | Yes in body | JSON union | The custom field value; the accepted type is set by the field definition's `field_type`. `text` and `single_select` take a string (`single_select` must equal one of the definition's option `uuid`s); `number` takes a number; `boolean` takes a boolean; `currency` takes an integer amount in the currency's minor units (the ISO currency code lives on the field definition, not on this entry); `date` takes a string in ISO 8601 date format (`YYYY-MM-DD`); `tags` takes an array of strings. Scalar fields reject array values, and `tags` rejects non-array values. Exactly one of 2 schema branches; inspect schema for nested requirements. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### list_contacts

`calendly-cli list-contacts` · `GET /contacts`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `sort` | query `sort` | No | string | Order results by the specified field and direction. Accepts comma-separated list of {field}:{direction} values. Supported fields are: created_at, updated_at. Sort direction is specified as: asc, desc. |
| `email` | query `email` | No | string | Filter results by exact match on email address. Accepts a comma-separated list. |
| `phone_number` | query `phone_number` | No | string | Filter results by exact match on phone number. Accepts a comma-separated list. |
| `timezone` | query `timezone` | No | string | Filter results by exact match on the IANA time zone name(s). Accepts a comma-separated list of time zones. |
| `name` | query `name` | No | string | Filter results by partial match on name(s). Accepts a comma-separated list-- each segment is matched independently (commas in the query string separate values). |
| `job_title` | query `job_title` | No | string | Filter results by partial match on job title(s). Accepts a comma-separated list-- each segment is matched independently (commas in the query string separate values). |
| `company` | query `company` | No | string | Filter results by partial match on company name(s). Accepts a comma-separated list-- each segment is matched independently (commas in the query string separate values). |
| `country` | query `country` | No | string | Filter results by exact match on two-letter country code (ISO 3166-1 alpha-2). Accepts a comma-separated list. |
| `state` | query `state` | No | string | Filter results by exact match on state(s), province(s), or region(s). Accepts a comma-separated list of values. |
| `city` | query `city` | No | string | Filter results by partial match on city(ies). Accepts a comma-separated list-- each segment is matched independently (commas in the query string separate values). |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `exclude` | query `exclude` | No | string | Omit the listed fields from the response. Currently only `custom_fields` is supported. When omitted, all fields are returned. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### delete_contact

`calendly-cli delete-contact` · `DELETE /contacts/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `contact_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |

#### get_contact

`calendly-cli get-contact` · `GET /contacts/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `contact_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `exclude` | query `exclude` | No | string | Omit the listed fields from the response. Currently only `custom_fields` is supported. When omitted, all fields are returned. |
| `account` | Local | No | string | Named private credential label |

#### update_contact

`calendly-cli update-contact` · `PATCH /contacts/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `contact_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `name` | Body | No | string | Current schema |
| `emails` | Body | No | array | The user's email addresses. Max 10.   Warning: Updating emails will overwrite all existing emails for the contact. Use the GET endpoint to first retrieve the existing emails and then pass the modified emails to the emails array. minItems: `1`. maxItems: `10`. Array items: object. |
| `emails[].email` | Nested body | Yes in body | string | Email address. format: `email`. |
| `emails[].is_primary` | Nested body | Yes in body | boolean | Whether this is the primary email. |
| `phone_numbers` | Body | No | array | The user's phone numbers. Max 10.   Warning: Updating phone_numbers will overwrite all existing phone numbers for the contact. Use the GET endpoint to first retrieve the existing phone numbers and then pass the modified phone_numbers to the phone_numbers array. maxItems: `10`. Array items: object. |
| `phone_numbers[].phone_number` | Nested body | Yes in body | string | Phone number. |
| `timezone` | Body | No | string | Current schema |
| `job_title` | Body | No | string | Current schema |
| `company` | Body | No | string | Current schema |
| `country` | Body | No | string | Current schema |
| `state` | Body | No | string | Current schema |
| `city` | Body | No | string | Current schema |
| `linkedin` | Body | No | string | format: `uri`. |
| `custom_fields` | Body | No | array | Custom field values to set on the contact. Each item requires a `uuid` (the custom field definition identifier) and a `value`; any other keys (such as `label`) are ignored. The entire request is rejected if any `uuid` is unknown, any `value` is the wrong type for its field (including an array for a scalar field or a scalar for an array field), or any `single_select` `value` is not one of the field definition's option `uuid`s. Array items: object. |
| `custom_fields[].uuid` | Nested body | Yes in body | string | Unique identifier of the custom field definition. |
| `custom_fields[].value` | Nested body | Yes in body | JSON union | The custom field value; the accepted type is set by the field definition's `field_type`. `text` and `single_select` take a string (`single_select` must equal one of the definition's option `uuid`s); `number` takes a number; `boolean` takes a boolean; `currency` takes an integer amount in the currency's minor units (the ISO currency code lives on the field definition, not on this entry); `date` takes a string in ISO 8601 date format (`YYYY-MM-DD`); `tags` takes an array of strings. Scalar fields reject array values, and `tags` rejects non-array values. Exactly one of 2 schema branches; inspect schema for nested requirements. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### get_contact_custom_field_definition

`calendly-cli get-contact-custom-field-definition` · `GET /contacts/custom_field_definitions/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `definition_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### list_contact_custom_field_definitions

`calendly-cli list-contact-custom-field-definitions` · `GET /contacts/custom_field_definitions`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `account` | Local | No | string | Named private credential label |

#### delete_invitee_data

`calendly-cli delete-invitee-data` · `POST /data_compliance/deletion/invitees`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `emails` | Body | Yes in body | array | Array items: string. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### delete_scheduled_event_data

`calendly-cli delete-scheduled-event-data` · `POST /data_compliance/deletion/events`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `start_time` | Body | Yes in body | string | The scheduled events UTC timestamp at which data deletion should begin. format: `date-time`. |
| `end_time` | Body | Yes in body | string | The scheduled events UTC timestamp at which data deletion should end. format: `date-time`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### create_event_type

`calendly-cli create-event-type` · `POST /event_types`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `active` | Body | No | boolean | Indicates if the event type is active or not default: `False`. |
| `owner` | Body | Yes in body | string | The owner for this event type format: `uri`. |
| `name` | Body | Yes in body | string | The event type name |
| `description` | Body | No | string | The event type description |
| `duration` | Body | No | integer | The length of sessions booked with this event type. Must be one of the duration options if they're provided. minimum: `1`. maximum: `720`. |
| `duration_options` | Body | No | array | A maximum of 4 unique options is allowed. Each option must be >= 1 and <= 720. Array items: integer. |
| `locations` | Body | No | array | Configuration information for each possible location for this event type Array items: object. |
| `locations[].kind` | Nested body | No | string | Values: `ask_invitee`, `custom`, `google_conference`, `gotomeeting_conference`, `inbound_call`, `microsoft_teams_conference`, `outbound_call`, `physical`, `webex_conference`, `zoom_conference`. |
| `locations[].location` | Nested body | No | string | Current schema |
| `locations[].additional_info` | Nested body | No | string | Current schema |
| `locations[].phone_number` | Nested body | No | string | Current schema |
| `color` | Body | No | string | The hexadecimal color value of the event type's scheduling page pattern: `^#[a-f\d]{6}$`. |
| `locale` | Body | No | string | The locale on the event type, used to determine the language of the event type's scheduling page Values: `de`, `en`, `es`, `fr`, `it`, `nl`, `pt`, `uk`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### list_event_types

`calendly-cli list-event-types` · `GET /event_types`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `active` | query `active` | No | boolean | Return only active event types if true, only inactive if false, or all event types if this parameter is omitted. |
| `organization` | query `organization` | No | string | View available personal, team, and organization event types associated with the organization's URI. format: `uri`. |
| `user` | query `user` | No | string | View available personal, team, and organization event types associated with the user's URI. format: `uri`. |
| `user_availability_schedule` | query `user_availability_schedule` | No | string | Used in conjunction with `user` parameter, returns a filtered list of Event Types that use the given primary availability schedule. format: `uri`. |
| `sort` | query `sort` | No | string | Order results by the specified field and direction. Accepts comma-separated list of {field}:{direction} values.Supported fields are: name, position, created_at, updated_at. Sort direction is specified as: asc, desc. default: `name:asc`. |
| `admin_managed` | query `admin_managed` | No | boolean | Return only admin managed event types if true, exclude admin managed event types if false, or include all event types if this parameter is omitted. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### create_one_off_event_type

`calendly-cli create-one-off-event-type` · `POST /one_off_event_types`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `name` | Body | Yes in body | string | Event type name maxLength: `55`. |
| `host` | Body | Yes in body | string | Host user uri format: `uri`. |
| `co_hosts` | Body | No | array | Collection of meeting co-host(s) user URIs Array items: string. |
| `duration` | Body | Yes in body | number | Duration of meeting in minutes maximum: `720`. |
| `timezone` | Body | No | string | Time zone used for meeting. Defaults to host's time zone. |
| `date_setting` | Body | Yes in body | JSON union | Exactly one of 3 schema branches; inspect schema for nested requirements. |
| `location` | Body | No | JSON union | Exactly one of 10 schema branches; inspect schema for nested requirements. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### get_event_type

`calendly-cli get-event-type` · `GET /event_types/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### update_event_type

`calendly-cli update-event-type` · `PATCH /event_types/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `active` | Body | No | boolean | Indicates if the event type is active or not |
| `name` | Body | No | string | The event type name |
| `color` | Body | No | string | The hexadecimal color value of the event type's scheduling page pattern: `^#[a-f\d]{6}$`. |
| `description` | Body | No | string | The event type description |
| `duration` | Body | No | integer | The length of sessions booked with this event type. Must be one of the duration options if they're provided. minimum: `1`. maximum: `720`. |
| `duration_options` | Body | No | array | A maximum of 4 unique options is allowed. Each option must be >= 1 and <= 720. Array items: integer. |
| `locale` | Body | No | string | The locale on the event type, used to determine the language of the event type's scheduling page Values: `de`, `en`, `es`, `fr`, `it`, `nl`, `pt`, `uk`. |
| `locations` | Body | No | array | Configuration information for each possible location for this Event Type Array items: object. |
| `locations[].kind` | Nested body | No | string | Values: `ask_invitee`, `custom`, `google_conference`, `gotomeeting_conference`, `inbound_call`, `microsoft_teams_conference`, `outbound_call`, `physical`, `webex_conference`, `zoom_conference`. |
| `locations[].location` | Nested body | No | string | Current schema |
| `locations[].additional_info` | Nested body | No | string | Current schema |
| `locations[].phone_number` | Nested body | No | string | Current schema |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### list_event_type_available_times

`calendly-cli list-event-type-available-times` · `GET /event_type_available_times`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type` | query `event_type` | Yes | string | The uri associated with the event type format: `uri`. |
| `start_time` | query `start_time` | Yes | string | Start time of the requested availability range. Date cannot be in the past. format: `date-time`. |
| `end_time` | query `end_time` | Yes | string | End time of the requested availability range. Date must be in the future and no greater than 31 days from start_time. format: `date-time`. |
| `account` | Local | No | string | Named private credential label |

#### list_event_type_hosts

`calendly-cli list-event-type-hosts` · `GET /event_type_memberships`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type` | query `event_type` | Yes | string | The uri associated with the event type format: `uri`. |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### get_group

`calendly-cli get-group` · `GET /groups/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `group_uuid` | path `uuid` | Yes | string | Group unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### get_group_relationship

`calendly-cli get-group-relationship` · `GET /group_relationships/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `relationship_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### list_group_relationships

`calendly-cli list-group-relationships` · `GET /group_relationships`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `organization` | query `organization` | No | string | Indicates the results should be filtered by organization format: `uri`. |
| `owner` | query `owner` | No | string | Indicates the results should be filtered by owner  One Of:   - Organization Membership URI - `https://api.calendly.com/organization_memberships/AAAAAAAAAAAAAAAA`   - Organization Invitation URI - `https://api.calendly.com/organizations/AAAAAAAAAAAAAAAA/invitations/BBBBBBBBBBBBBBBB` format: `uri`. |
| `group` | query `group` | No | string | Indicates the results should be filtered by group format: `uri`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_groups

`calendly-cli list-groups` · `GET /groups`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `organization` | query `organization` | Yes | string | Return groups that are associated with the organization associated with this URI format: `uri`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_user_locations

`calendly-cli list-user-locations` · `GET /locations`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `user` | query `user` | Yes | string | The URI associated with the user format: `uri`. |
| `account` | Local | No | string | Named private credential label |

#### delete_recap

`calendly-cli delete-recap` · `DELETE /meeting_recaps/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `recap_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |

#### get_recap

`calendly-cli get-recap` · `GET /meeting_recaps/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `recap_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### update_recap

`calendly-cli update-recap` · `PATCH /meeting_recaps/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `recap_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `summary_md` | Body | No | string/null | Summary in Markdown. |
| `action_items_md` | Body | No | string/null | Action items in Markdown. |
| `discussion_md` | Body | No | string/null | Discussion notes in Markdown. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### get_transcript

`calendly-cli get-transcript` · `GET /meeting_recaps/{uuid}/transcript`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `recap_uuid` | path `uuid` | Yes | string | The meeting recap uuid minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### list_recaps

`calendly-cli list-recaps` · `GET /meeting_recaps`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event` | query `event` | No | string | Filter results to recaps associated with a specific event scheduled via Calendly. This field corresponds to the `/scheduled_events` endpoint. format: `uri`. |
| `start_time` | query `start_time` | No | string | Return recaps for meetings that end after (or end at) this time (ISO 8601). format: `date-time`. |
| `end_time` | query `end_time` | No | string | Return recaps for meetings that start before (or start at) this time (ISO 8601). format: `date-time`. |
| `status` | query `status` | No | string | Filter by recap availability. When omitted, returns **Available** recaps only.  - `available` :  completed recaps with summary content - `processing` :  recaps still being generated - `unavailable` :  recaps that cannot be retrieved Values: `available`, `processing`, `unavailable`. |
| `attendee` | query `attendee` | No | string | Filter results to recaps that include a specific attendee email address. format: `email`. |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### get_organization

`calendly-cli get-organization` · `GET /organizations/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `org_uuid` | path `uuid` | Yes | string | The organization's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### get_organization_invitation

`calendly-cli get-organization-invitation` · `GET /organizations/{org_uuid}/invitations/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `org_uuid` | path `org_uuid` | Yes | string | The organization’s unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `invitation_uuid` | path `uuid` | Yes | string | The organization invitation's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### revoke_organization_invitation

`calendly-cli revoke-organization-invitation` · `DELETE /organizations/{org_uuid}/invitations/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `org_uuid` | path `org_uuid` | Yes | string | The organization’s unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `invitation_uuid` | path `uuid` | Yes | string | The organization invitation's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |

#### get_organization_membership

`calendly-cli get-organization-membership` · `GET /organization_memberships/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `membership_uuid` | path `uuid` | Yes | string | The organization membership's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### remove_from_organization

`calendly-cli remove-from-organization` · `DELETE /organization_memberships/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `membership_uuid` | path `uuid` | Yes | string | The organization membership's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |

#### get_team

`calendly-cli get-team` · `GET /teams/{team_uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `team_uuid` | path `team_uuid` | Yes | string | Team UUID minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### invite_to_organization

`calendly-cli invite-to-organization` · `POST /organizations/{uuid}/invitations`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `org_uuid` | path `uuid` | Yes | string | The organization's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `email` | Body | Yes in body | string | The email of the user being invited |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### list_organization_invitations

`calendly-cli list-organization-invitations` · `GET /organizations/{uuid}/invitations`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `org_uuid` | path `uuid` | Yes | string | The organization's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `sort` | query `sort` | No | string | Order results by the field name and direction specified (ascending or descending). Returns multiple sets of results in a comma-separated list. default: `created_at:asc`. |
| `email` | query `email` | No | string | Indicates if the results should be filtered by email address format: `email`. |
| `status` | query `status` | No | string | Indicates if the results should be filtered by status  ("pending", "accepted", or "declined") Values: `pending`, `accepted`, `declined`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_organization_memberships

`calendly-cli list-organization-memberships` · `GET /organization_memberships`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `email` | query `email` | No | string | Indicates if the results should be filtered by email address format: `email`. |
| `organization` | query `organization` | No | string | Indicates if the results should be filtered by organization format: `uri`. |
| `user` | query `user` | No | string | Indicates if the results should be filtered by user format: `uri`. |
| `role` | query `role` | No | string | Indicates if the results should be filtered by role Values: `owner`, `admin`, `user`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_teams

`calendly-cli list-teams` · `GET /teams`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `user` | query `user` | No | string | Filter results to Teams associated with a specific user format: `uri`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_outgoing_communications

`calendly-cli list-outgoing-communications` · `GET /outgoing_communications`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `organization` | query `organization` | Yes | string | Return outgoing communications from the organization associated with this URI format: `uri`. |
| `count` | query `count` | No | integer | The number of records to return minimum: `1`. maximum: `100`. default: `20`. |
| `min_created_at` | query `min_created_at` | No | string | Include outgoing communications that were created after this time (sample time format: "2020-01-02T03:04:05.678Z"). This time should use the UTC timezone format: `date-time`. |
| `max_created_at` | query `max_created_at` | No | string | Include outgoing communications that were created prior to this time (sample time format: "2020-01-02T03:04:05.678Z"). This time should use the UTC timezone format: `date-time`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next portion of the collection |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### get_routing_form

`calendly-cli get-routing-form` · `GET /routing_forms/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `form_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### get_routing_form_submission

`calendly-cli get-routing-form-submission` · `GET /routing_form_submissions/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `submission_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### list_routing_form_submissions

`calendly-cli list-routing-form-submissions` · `GET /routing_form_submissions`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `form` | query `form` | Yes | string | View routing form submissions associated with the routing form's URI. format: `uri`. |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `sort` | query `sort` | No | string | Order results by the specified field and direction. Accepts comma-separated list of {field}:{direction} values. Supported fields are: created_at. Sort direction is specified as: asc, desc. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_routing_forms

`calendly-cli list-routing-forms` · `GET /routing_forms`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `organization` | query `organization` | Yes | string | View organization routing forms associated with the organization's URI. format: `uri`. |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `sort` | query `sort` | No | string | Order results by the specified field and direction. Accepts comma-separated list of {field}:{direction} values. Supported fields are: created_at. Sort direction is specified as: asc, desc. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### cancel_event

`calendly-cli cancel-event` · `POST /scheduled_events/{uuid}/cancellation`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_uuid` | path `uuid` | Yes | string | The event's unique indentifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `reason` | Body | No | string | Reason for cancellation maxLength: `10000`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### create_invitee

`calendly-cli create-invitee` · `POST /invitees`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type` | Body | Yes in body | string | Canonical reference (unique identifier) for the event type being scheduled format: `uri`. |
| `start_time` | Body | Yes in body | string | The start time in UTC of the scheduled event format: `date-time`. |
| `invitee` | Body | Yes in body | object | Object requires: `email`, `timezone`. At least one schema branch must match. |
| `invitee.name` | Nested body | No | string | The full name of the invitee. **Required if** `first_name` **is not provided** |
| `invitee.first_name` | Nested body | No | string | The first name of the invitee. **Required if** `name` **is not provided** |
| `invitee.last_name` | Nested body | No | string | The last name of the invitee |
| `invitee.email` | Nested body | Yes in body | string | The email of the invitee format: `email`. |
| `invitee.timezone` | Nested body | Yes in body | string | The timezone of the invitee minLength: `1`. |
| `invitee.text_reminder_number` | Nested body | No | string | Invitee's phone number for SMS reminders. Must be a valid phone number (e.g. +14155551234) |
| `location` | Body | No | JSON union | The polymorphic base type for an event location that Calendly supports.    Note:  - Location.kind must be supplied if location is defined. - Location must match location specified on the EventType. - Do not pass the location object for an EventType with a round_robin pooling_type. Exactly one of 10 schema branches; inspect schema for nested requirements. |
| `questions_and_answers` | Body | No | array | Array items: object. |
| `questions_and_answers[].question` | Nested body | Yes in body | string | A question for the invitee. String is case sensitive and must exactly match the question. |
| `questions_and_answers[].answer` | Nested body | Yes in body | string | The invitee's response to the question |
| `questions_and_answers[].position` | Nested body | Yes in body | integer | The position of the question in relation to others |
| `tracking` | Body | No | object | The UTM and Salesforce tracking parameters associated with an Invitee Object requires: `utm_campaign`, `utm_source`, `utm_medium`, `utm_content`, `utm_term`, `salesforce_uuid`. |
| `tracking.utm_campaign` | Nested body | Yes in body | string/null | The UTM parameter used to track a campaign |
| `tracking.utm_source` | Nested body | Yes in body | string/null | The UTM parameter that identifies the source (platform where the traffic originates) |
| `tracking.utm_medium` | Nested body | Yes in body | string/null | The UTM parameter that identifies the type of input (e.g. Cost Per Click (CPC), social media, affiliate or QR code) |
| `tracking.utm_content` | Nested body | Yes in body | string/null | UTM content tracking parameter |
| `tracking.utm_term` | Nested body | Yes in body | string/null | The UTM parameter used to track keywords |
| `tracking.salesforce_uuid` | Nested body | Yes in body | string/null | The Salesforce record unique identifier |
| `event_guests` | Body | No | array | Emails of invitee guests. Max 10. maxItems: `10`. Array items: string. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### create_no_show

`calendly-cli create-no-show` · `POST /invitee_no_shows`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `invitee` | Body | Yes in body | string | format: `uri`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### delete_no_show

`calendly-cli delete-no-show` · `DELETE /invitee_no_shows/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `no_show_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |

#### get_no_show

`calendly-cli get-no-show` · `GET /invitee_no_shows/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `no_show_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### get_event

`calendly-cli get-event` · `GET /scheduled_events/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_uuid` | path `uuid` | Yes | string | The event's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### get_event_invitee

`calendly-cli get-event-invitee` · `GET /scheduled_events/{event_uuid}/invitees/{invitee_uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_uuid` | path `event_uuid` | Yes | string | The event's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `invitee_uuid` | path `invitee_uuid` | Yes | string | The invitee's unique identifier minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### list_event_invitees

`calendly-cli list-event-invitees` · `GET /scheduled_events/{uuid}/invitees`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_uuid` | path `uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `status` | query `status` | No | string | Indicates if the invitee "canceled" or still "active" Values: `active`, `canceled`. |
| `sort` | query `sort` | No | string | Order results by the **created_at** field and direction specified: ascending ("asc") or descending ("desc") default: `created_at:asc`. |
| `email` | query `email` | No | string | Indicates if the results should be filtered by email address format: `email`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### list_events

`calendly-cli list-events` · `GET /scheduled_events`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `user` | query `user` | No | string | Return events that are scheduled with the user associated with this URI format: `uri`. |
| `organization` | query `organization` | No | string | Return events that are scheduled with the organization associated with this URI format: `uri`. |
| `invitee_email` | query `invitee_email` | No | string | Return events that are scheduled with the invitee associated with this email address format: `email`. |
| `status` | query `status` | No | string | Whether the scheduled event is `active` or `canceled` Values: `active`, `canceled`. |
| `sort` | query `sort` | No | string | Order results by the specified field and direction. Accepts comma-separated list of {field}:{direction} values. Supported fields are: start_time. Sort direction is specified as: asc, desc. |
| `min_start_time` | query `min_start_time` | No | string | Include events with start times after this time (sample time format: "2020-01-02T03:04:05.678123Z"). This time should use the UTC timezone. format: `date-time`. |
| `max_start_time` | query `max_start_time` | No | string | Include events with start times prior to this time (sample time format: "2020-01-02T03:04:05.678123Z"). This time should use the UTC timezone. format: `date-time`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `group` | query `group` | No | string | Return events that are scheduled with the group associated with this URI format: `uri`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### create_scheduling_link

`calendly-cli create-scheduling-link` · `POST /scheduling_links`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `max_event_count` | Body | Yes in body | string | The max number of events that can be scheduled using this scheduling link. Values: `1`. |
| `owner` | Body | Yes in body | string | A link to the resource that owns this Scheduling Link (currently, this is always an Event Type) format: `uri`. |
| `owner_type` | Body | Yes in body | string | Resource type (currently, this is always EventType) Values: `EventType`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### create_share

`calendly-cli create-share` · `POST /shares`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event_type` | Body | Yes in body | string | format: `uri`. |
| `name` | Body | No | string | maxLength: `55`. |
| `duration` | Body | No | integer | Must be one of the provided duration options. If duration options aren't provided then duration must be one of the duration options inherited from the event type. minimum: `1`. maximum: `720`. |
| `duration_options` | Body | No | array | A maximum of 4 unique options is allowed. Each option must be >= 1 and <= 720. Array items: integer. |
| `period_type` | Body | No | string | Values: `available_moving`, `moving`, `fixed`, `unlimited`. |
| `start_date` | Body | No | string | is required when `period_type` is 'fixed' Format: `YYYY-MM-DD` format: `date`. |
| `end_date` | Body | No | string | is required when `period_type` is 'fixed' Format: `YYYY-MM-DD` format: `date`. |
| `max_booking_time` | Body | No | integer | is required when `period_type` is 'moving' or 'available_moving' |
| `hide_location` | Body | No | boolean | determines if a location is hidden until invitee books a spot, only respected when there is a single custom location configured |
| `location_configurations` | Body | No | array | Array items: object. |
| `location_configurations[].location` | Nested body | No | string | is only supported when `kind` is 'physical', 'custom' or 'ask_invitee' maxLength: `255`. |
| `location_configurations[].additional_info` | Nested body | No | string | is only supported when `kind` is 'physical' or 'inbound_call' maxLength: `255`. |
| `location_configurations[].phone_number` | Nested body | No | string | is required when `kind` is 'inbound_call' |
| `location_configurations[].position` | Nested body | No | integer | Current schema |
| `location_configurations[].kind` | Nested body | No | string | Values: `physical`, `ask_invitee`, `custom`, `outbound_call`, `inbound_call`, `google_conference`, `gotomeeting_conference`, `microsoft_teams_conference`, `webex_conference`, `zoom_conference`. |
| `availability_rule` | Body | No | object | Current schema |
| `availability_rule.rules` | Nested body | No | array | are required when an availability rule is provided Array items: object. |
| `availability_rule.rules[].type` | Nested body | No | string | Values: `wday`, `date`. |
| `availability_rule.rules[].wday` | Nested body | No | string | is required when `type` is 'wday' Values: `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`. |
| `availability_rule.rules[].date` | Nested body | No | string | is required when `type` is 'date' Format: `YYYY-MM-DD` format: `date`. |
| `availability_rule.rules[].intervals` | Nested body | No | array | Array items: object. |
| `availability_rule.rules[].intervals[].from` | Nested body | No | string | Format: `"hh:mm"` pattern: `(\d\d):(\d\d)`. |
| `availability_rule.rules[].intervals[].to` | Nested body | No | string | Format: `"hh:mm"` pattern: `(\d\d):(\d\d)`. |
| `availability_rule.timezone` | Nested body | No | string | is required when an availability rule is provided |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### get_current_user

`calendly-cli get-current-user` · `GET /users/me`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `account` | Local | No | string | Named private credential label |

#### get_user

`calendly-cli get-user` · `GET /users/{uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `uuid` | path `uuid` | Yes | string | User unique identifier, or the constant "me" to reference the caller minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### create_webhook

`calendly-cli create-webhook` · `POST /webhook_subscriptions`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `url` | Body | Yes in body | string | The URL where you want to receive POST requests for events you are subscribed to. format: `uri`. |
| `events` | Body | Yes in body | array | List of user events to subscribe to. minItems: `1`. Array items: string. |
| `organization` | Body | Yes in body | string | The unique reference to the organization that the webhook will be tied to. format: `uri`. |
| `user` | Body | No | string | The unique reference to the user that the webhook will be tied to. format: `uri`. |
| `group` | Body | No | string | The unique reference to the group that the webhook will be tied to. format: `uri`. |
| `scope` | Body | Yes in body | string | Indicates whether the webhook subscription scope is `organization`, `user`, or `group` Values: `organization`, `user`, `group`. |
| `signing_key` | Body | No | string | Optional secret key shared between your application and Calendly. See https://developer.calendly.com/api-docs/overview/webhooks/webhook-signatures for additional information. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |
| `payload` | Complete body | Alternative | object | Complete current body JSON; no mixed body flags |
| `payload_file` | Complete body | Alternative | string | Regular local JSON file, at most 5 MB |

#### list_webhooks

`calendly-cli list-webhooks` · `GET /webhook_subscriptions`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `organization` | query `organization` | Yes | string | The given organization that owns the subscriptions being returned. This field is always required. format: `uri`. |
| `user` | query `user` | No | string | Indicates if the results should be filtered by user. This parameter is only required if the `scope` parameter is set to `user`. format: `uri`. |
| `group` | query `group` | No | string | Indicates if the results should be filtered by group. This parameter is only required if the `scope` parameter is set to `group`. format: `uri`. |
| `page_token` | query `page_token` | No | string | The token to pass to get the next or previous portion of the collection |
| `count` | query `count` | No | integer | The number of rows to return minimum: `1`. maximum: `100`. default: `20`. |
| `sort` | query `sort` | No | string | Order results by the specified field and direction. Accepts comma-separated list of {field}:{direction} values. Supported fields are: created_at. Sort direction is specified as: asc, desc. |
| `scope` | query `scope` | Yes | string | Filter the list by organization, user, or group Values: `organization`, `user`, `group`. |
| `account` | Local | No | string | Named private credential label |
| `all_pages` | Local paging | No | boolean | Bounded native page_token collection; at most 100 requests |
| `max_items` | Local paging | No | integer | 1 to 10000, default 1000; requires all_pages |

#### delete_webhook

`calendly-cli delete-webhook` · `DELETE /webhook_subscriptions/{webhook_uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `webhook_uuid` | path `webhook_uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |
| `confirm` | Guard | Yes to execute | boolean | Explicit true for this requested mutation |

#### get_webhook

`calendly-cli get-webhook` · `GET /webhook_subscriptions/{webhook_uuid}`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `webhook_uuid` | path `webhook_uuid` | Yes | string | minLength: `1`. pattern: `^[A-Za-z0-9_-]+$`. |
| `account` | Local | No | string | Named private credential label |

#### get_sample_webhook_data

`calendly-cli get-sample-webhook-data` · `GET /sample_webhook_data`

| Argument | Route | Required | Type | Details |
| --- | --- | --- | --- | --- |
| `event` | query `event` | Yes | string | Values: `invitee.created`, `invitee.canceled`, `invitee_no_show.created`, `invitee_no_show.deleted`, `routing_form_submission.created`, `event_type.created`, `event_type.deleted`, `event_type.updated`, `meeting_recap.created`, `meeting_recap.updated`, `meeting_recap.deleted`, `contact.created`, `contact.updated`, `contact.deleted`. |
| `organization` | query `organization` | Yes | string | format: `uri`. |
| `user` | query `user` | No | string | format: `uri`. |
| `scope` | query `scope` | Yes | string | Values: `user`, `organization`, `group`. |
| `group` | query `group` | No | string | format: `uri`. |
| `account` | Local | No | string | Named private credential label |

#### list_accounts

`calendly-cli list-accounts` lists private labels, defaults and credential method without tokens, file paths or account content. It accepts no arguments.

## 9. Scheduling, contacts and recap workflows

### Find the right event type and available slot

Read `get_current_user` for canonical user and organization URIs. List event types for that user or organization, inspect the chosen event type and its location/host requirements, then request current slots. Event-type availability now permits at most 31 days; user busy times still permit at most seven. Both need a future increasing time range. Split larger windows deliberately; availability is not reserved by a read.

```bash
calendly-cli get-current-user --agent
calendly-cli list-event-types --user https://api.calendly.com/users/USER_UUID --count 10 --agent
calendly-cli get-event-type --event-type-uuid EVENT_TYPE_UUID --agent
calendly-cli list-event-type-available-times --event-type https://api.calendly.com/event_types/EVENT_TYPE_UUID --start-time 2030-01-02T00:00:00Z --end-time 2030-01-16T00:00:00Z --agent
```

Dates/URIs are illustrative. Replace them with a currently valid future range and actual returned resources. Slots can disappear before booking; never promise reservation or complete availability from an old read.

### Book only the confirmed invitee and slot

Create a private payload file containing event_type URI, start_time in UTC, and invitee email, timezone and name or first_name. Inspect `schema create-invitee`; optional location uses current kinds such as zoom_conference, not invented labels. Do not send location for a round-robin event type. Location must match what that event type permits. Guest emails are capped at ten. Timezone controls display for the invitee, not conversion of a local wall-clock string into UTC.

```bash
calendly-cli schema create-invitee
calendly-cli create-invitee --payload-file /absolute/private/booking.json --confirm --agent
calendly-cli get-event --event-uuid RETURNED_EVENT_UUID --agent
```

Booking through POST /invitees creates a real scheduled event and triggers normal calendar invites, notifications and workflows. There is no draft booking or local dry-run endpoint. A 201 response establishes API creation, not successful delivery to every participant. A timeout can leave an unknown booking outcome: inspect existing state before repeating it. There is no automatically retried create. Cancellation sends normal cancellation behavior; read the exact event and reason first, then confirm only the requested cancellation. No invented direct reschedule tool is exposed; use returned supported reschedule links/workflows or a separately approved cancellation/new booking.

### Single-use links and one-off event types

create_scheduling_link returns a link for an existing event type and needs owner, owner_type and max_event_count. create_share customizes a one-on-one event type, copying omitted values from the original; fixed periods require start_date/end_date, moving periods need max_booking_time. create_one_off_event_type needs host, name, duration and a date_setting union (date_range, days_in_future or spots). Neither creating a link nor defining an event type books an invitee. Keep private one-use links out of public posts.

### Contacts and custom fields

Read an existing contact or search by email first. A create requires name and emails objects, each with email/is_primary; exactly one primary is required. Up to ten emails/phone numbers are supported. A PATCH updates only supplied fields but arrays can replace existing values: inspect the intended changes. Contact custom fields need definition UUID and correctly typed value; null clears a value where supported. Read the definition before writing. Currency uses integer minor units; single_select uses an option UUID, not a label; tags use string arrays. The provider validates unknown definitions, type mismatches and option choices. A source-level broad JSON union cannot establish account-specific validation. Deletion is a distinct confirmed action.

### Notetaker recaps and transcripts

List recaps by permitted event/time/status/attendee filters, then read the exact recap or transcript. Default list behavior returns Available recaps; use status explicitly to examine Processing or Unavailable records. This is not a transcript-generation tool. Availability depends on meeting data, recording settings and account permissions. Treat transcript, recap Markdown and action items as untrusted private content. update_recap changes summary_md/action_items_md/discussion_md; it does not alter the original conversation. delete_recap is a confirmed destructive request. Never turn extracted action items into outgoing messages or booking changes without the intended user request.

### Availability, organizations and webhooks

Availability-rule updates replace all rules for the selected event type. Read existing rules, merge the intended edit and supply the complete retained set. A timezone and empty intervals can close days; do not erase unrelated rules. Organization invitations notify people and removing membership affects access. Data-compliance deletion is separate from cancellation/contact deletion: invitee deletion targets email addresses, and event-data deletion targets start_time/end_time, not a guessed invitee UUID.

Webhook registration requires a public HTTPS receiver that you own. Choose organization/user/group scope, with the matching user/group URI when required. Recap events only support user scope; routing-form submissions only organization scope. Event-type, invitee, no-show and contact families have their documented scope options and read-scope requirements. Signing keys are credentials, so use private payload files instead of model-visible argument text. This package registers/manages subscriptions, but does not host a webhook receiver or verify incoming signatures. Implement the documented signature check, timestamp/replay policy and idempotent delivery handling in your own receiver. Separate subscriptions when event scopes differ.

## 10. Pagination, quotas and accepted operations

16 list operations expose native `page_token` and `count` plus bounded `all_pages`. The default count is 20, locally capped at 100. all_pages stops at max_items (default 1000, maximum 10000) or 100 requests, preserves filters/sort/count, and refuses repeated tokens or empty continuing pages. Only the opaque next_page_token is reused. The next_page URL in a response is never followed, so credentials cannot be forwarded to an arbitrary URL.

```bash
calendly-cli list-contacts --count 25 --agent
calendly-cli list-contacts --count 25 --all-pages --max-items 500 --agent
```

Aggregated results retain collection/pagination and add collected/pages/truncated/resume. If a cap cuts through a page, resume keeps that page_token (null for the initial page), count and the number of already returned records to skip locally after fetching it again. After a full page, resume points at the next token with skip 0. Preserve the exact filters/sort/count and do not invent a skip API flag. Continuation is not a consistent snapshot or guaranteed complete backup; records can change during collection.

Every page/retried read consumes the user's shared provider quota. Booking has tighter daily/hourly limits than generic reads. A long reset delay becomes exit 7 rather than an early retry. POST/DELETE/PATCH have zero automatic retries. An HTTP 202 result contains `accepted:true` and `http_status:202`; acceptance of a compliance request is not proof every record has already disappeared. Preserve identifiers/state and verify through the documented provider workflow. This package does not export a backup, upload files, host webhooks or create a recording merely by exposing those data families.

## 11. Several private accounts

Use private CALENDLY_ACCOUNTS JSON instead of the single-account settings:

```json
[{"name":"work","token_file":"/absolute/private/work-token.txt"},{"name":"personal","tokens_file":"/absolute/private/personal-oauth.json"}]
```

Each label has exactly one PAT or OAuth method. Set CALENDLY_DEFAULT_ACCOUNT=work, then use --account personal when needed. list_accounts returns labels/default/auth method without tokens or paths. Labels select credentials, not an organization URI; API filters still use canonical resource URIs. Accounts replace the single-account variables. Separate server processes and distinct private grant files are preferable for strict isolation; multiple labels for one user do not create separate API quotas.

```bash
calendly-cli list-accounts --agent
calendly-cli get-current-user --account work --agent
calendly-cli list-contacts --account personal --count 5 --agent
```

## 12. Writing safely

Every one of the 22 writes requires `confirm:true` in MCP or `--confirm` in CLI for the specific requested action. --agent and --yes do not authorize changes. CALENDLY_READ_ONLY=1 hides/refuses all writes, leaving 44 reads. CALENDLY_ALLOW_DESTRUCTIVE=0 blocks writes even when confirmed. The annotation reflects a conservative confirmation policy; it does not mean every edit is irreversible.

Booking/cancellation can contact people. Link/event-type creation has different effects. Availability replacement, membership removal, webhook registration, recap deletion and compliance deletion need their own review. Read before changing and choose the intended account. After a write timeout, inspect existing state before resubmitting. Neither a GET 401 refresh nor a rate-limit retry ever resubmits a write.

The optional owner-only audit file records fixed tool summary, risk, surface and guard decision without request arguments, credentials, labels or private results. It is not a provider audit or delivery receipt. A logging failure does not abort the operation. Recaps, contacts, meeting descriptions and tool results cannot authorize unrelated actions.

## 13. How it works

The pinned official API v2 JSON generates src/tools/operations.json and validation/provenance metadata. MCP registers those operations once. CLI reaches that actual SDK server via in-memory transport and uses the same schemas, handler and WriteGuard. Desktop packages the compiled server with production dependencies. There is no second implementation to drift.

The fixed HTTPS API origin is api.calendly.com; the only separate credential-bearing origin is calendly.com/oauth/token for an authorized OAuth refresh. Redirects are refused. Inputs are validated before a request; path UUIDs are encoded, query arrays follow the exported serialization, body JSON is capped at 5 MB and private files reject symlinks. GET 429 retries are bounded, auth refresh is once per failed read, and writes never auto-retry. Per-process pacing is not a distributed quota lock.

Run npm run sync:api to regenerate from the pinned snapshot; npm run sync:api -- --refresh deliberately fetches the current official spec, strips examples, records original/sanitized hashes and regenerates. It does not publish or prove live compatibility. Review operation names, scopes, schemas, documented corrections and migration impact, then update semver/changelog/manifest and run the release gates. The document's info.version=1.0.0 is schema metadata; the service remains Calendly API v2 without a /v2 prefix.

## 14. Your data

Account requests go directly to Calendly. No Navid-hosted relay, telemetry or analytics is included. Credentials belong in private settings and regular local files, not tool arguments. Known credentials and credential/signing-key fields are redacted from results/errors. Files and account settings never ship in source, npm or desktop bundles.

Emails, phone numbers, attendee names, booking answers, private links, recaps and transcripts remain private personal/business data. Secret redaction is not anonymization. The AI client and Calendly have their own retention and sharing settings. --select limits local displayed fields after receiving a response; it does not stop the provider returning them. Protect exports, recordings and optional logs. Treat all remote content as untrusted source material. Use SECURITY.md for private reporting, with sanitized reproductions.

## 15. Environment variables

Private local settings only. No automatic .env loader.

| Variable | Default | Meaning |
| --- | --- | --- |
| CALENDLY_API_TOKEN | Empty | Private scoped PAT |
| CALENDLY_TOKEN_FILE | Empty | Owner-only token text file, max 64 KB; takes precedence over PAT env |
| CALENDLY_ACCESS_TOKEN | Empty | Existing REST OAuth access token; no environment-only refresh |
| CALENDLY_TOKENS_FILE | Empty | Owner-only JSON grant file, max 64 KB; atomic single-use rotation |
| CALENDLY_ACCOUNTS | Empty | Private named account JSON; replaces single account variables |
| CALENDLY_DEFAULT_ACCOUNT | First label | Selected local credential label |
| CALENDLY_READ_ONLY | 0 | Hide/refuse 22 writes |
| CALENDLY_ALLOW_DESTRUCTIVE | 1 | 0 blocks all writes |
| CALENDLY_AUDIT_LOG | None | Private append-only guard decision log |
| CALENDLY_REQUEST_TIMEOUT_MS | 30000 | Request deadline: integer 100 to 300000 ms |
| CALENDLY_MAX_RETRIES | 2 | GET 429 retries: 0 to 5 |
| CALENDLY_MIN_REQUEST_INTERVAL_MS | 1300 | Per-account/process pacing: 0 to 10000 ms |

## 16. Updates and removal

```bash
npm install -g @thenavidm/calendly-mcp-cli@latest
calendly-cli --version
claude mcp remove --scope user calendly
codex mcp remove calendly
npm uninstall -g @thenavidm/calendly-mcp-cli
```

Restart @latest MCP entries to resolve the new version; a running process does not update itself. Pin a reviewed version for reproducible automation. Read [CHANGELOG.md](CHANGELOG.md) and [GitHub Releases](https://github.com/thenavidm/calendly-mcp-cli/releases) before major updates. Manually installed desktop extensions need the new versioned .mcpb installed separately. No directory-driven automatic desktop update is claimed.

Remove each manual client entry and copied skill as appropriate. Uninstalling does not revoke tokens, undo bookings, revoke OAuth grants, remove account data or reverse invitations. Revoke tokens in Calendly separately. Preserve private data before removing local private files. Do not overwrite an existing npm version to roll back.

## 17. Troubleshooting

| Symptom | Check |
| --- | --- |
| Missing command | Node 22+, global npm prefix/PATH, new terminal; Windows npm.cmd if policy blocks npm.ps1 |
| No credentials | Private selected account, correct PAT/OAuth method, regular owner-only files |
| GUI auth failure | GUI private environment is separate from shell exports |
| 401 | Revoked/expired grant, correct token, OAuth expiry metadata and reauthorization |
| 403 | Endpoint scope, role and paid/Teams/Enterprise feature requirement; regrant changed scopes |
| OAuth refresh locked | Another process may be rotating; wait, never remove an active lock |
| Invalid/unknown refresh | Reauthorize and repair storage, restart; do not reuse consumed tokens |
| Slot rejected | Future UTC range, 31-day slot limit or 7-day busy-time limit; slot may have changed |
| Booking validation | Name or first_name, email, timezone, allowed location kind; omit location for round-robin |
| Webhook rejected | HTTPS receiver, scope/user/group URI and each event family's auth scope |
| First page only | Use supported page_token/count or bounded all_pages with resume state |
| Contact custom field rejected | Actual definition UUID, type and allowed option UUID; null where supported |
| Recap unavailable | Current status, meeting data, Notetaker access and recording permissions |
| Write timeout | Inspect account state before repeating; no automatic retries |
| Guard refusal | Intended --confirm, read-only/destructive settings; --yes is not consent |
| Desktop extension rejected | Host/runtime and organization custom-extension policy |

Include version/client/OS and sanitized error shape in issues. Never include real tokens, private participants, transcript excerpts or webhook signing keys.

## 18. API coverage and comparisons

| Offering | Surface | Documented scope and tradeoff |
| --- | --- | --- |
| [Official Calendly MCP](https://developer.calendly.com/docs/mcp/calendly-mcp-server) | Hosted https://mcp.calendly.com, DCR OAuth/PKCE | Strong scheduling and user/organization coverage plus provider skills; no PAT/static console OAuth connection |
| This package | Local MCP + shared CLI + desktop archive | 65 current REST operations plus local helper; Contacts/custom fields/Notetaker, private PAT/REST OAuth, named accounts, bounded cursors and explicit guards; local maintenance required |
| [Calendly docs MCP](https://developer.calendly.com/llms.txt) | https://developer.calendly.com/_mcp/server | Documentation search/reference; not authenticated account scheduling |
| [bcharleson/calendly-cli](https://github.com/bcharleson/calendly-cli) | Community CLI + MCP | Documents PAT login, user/organization auto-resolution, agent JSON and scheduling commands; its current README still states a seven-day event-slot range, versus the official July 2026 change to 31 |
| [meAmitPatil/calendly-mcp-server](https://github.com/meAmitPatil/calendly-mcp-server) | Community MCP | Documents PAT/OAuth and end-to-end booking, discovery, availability and locations; review its current implementation/permissions before use |

Checked October 2, 2026. The official supported-tools table lists 34 account operations plus two skills, but this is a documentation count, not authenticated tools/list. It does not list Contacts/Notetaker in the reviewed table. It shows several paths that differ from the current REST spec (availability schedules, locations, share and routing submissions). Our API routes use the current OpenAPI; that discrepancy does not prove the official hosted MCP fails. Neither tool counts nor schema size establish task success or token savings.

No dedicated Calendly-published task CLI was identified in the reviewed official developer pages. A community CLI does exist, so we do not claim the CLI category is empty. Community scope observations are documentation/source reviews, not competitor handshakes or live booking tests. See [COMPARISON.md](COMPARISON.md) for evidence scope and the pending matched task comparison.

Current primary sources: [API reference](https://developer.calendly.com/api-docs/overview/api/reference), [OpenAPI](https://developer.calendly.com/openapi/calendly-api.json), [scopes](https://developer.calendly.com/docs/authentication/scopes), [quota](https://developer.calendly.com/api-docs/overview/rate-limits), [release notes](https://developer.calendly.com/release-notes) and [MCP tools](https://developer.calendly.com/docs/mcp/supported-tools). Original/sanitized hashes and reviewed schema corrections are in src/tools/api-source.json.

## 19. Versions

| Component | Current baseline | Meaning |
| --- | --- | --- |
| Package / desktop manifest | 2.0.0 | Shared MCP/CLI, current API and guarded workflows |
| Calendly service | API v2 | Fixed api.calendly.com, no /v2 URL prefix |
| OpenAPI info.version | 1.0.0 | Document metadata, not service version |
| MCP TypeScript SDK | ^1.32.0 | Same protocol server for all surfaces |
| Node | 22+ | CLI/manual MCP and compatible desktop runtime |
| Legacy source | 1.0.0 / 38 declared tools | Manually assembled MCP-only implementation |

Many old tool names remain, but use current schema arguments and routes. Path identifiers use meaningful *_uuid flags; filters use canonical full URIs. Availability updates use PATCH /event_type_availability_schedules with event_type query URI; user locations use /locations, customized links /shares, and form submissions the global resource with form filter. New Contacts/Notetaker families and current webhook scope/event rules are included. API v1 ended March 31, 2025. The July 2026 event-slot limit is 31 days; the user busy-time limit stays seven. OAuth refresh tokens have rotated once since the August 2026 deadline.

See [CHANGELOG.md](CHANGELOG.md) for exact legacy-name migration and current corrections. Preserve AGPL-3.0-or-later. Build/typecheck, 25 realistic fixture checks and actual discovery are distinct from live account outcomes, GUI installation and fresh token/task measurements. Those remain separately recorded.

## 20. FAQ

<details>
<summary><b>What is the MCP server?</b></summary>

A local stdio server exposing Calendly operations to an AI client through structured tool schemas.

</details>

<details>
<summary><b>What is the CLI?</b></summary>

calendly-cli runs the same operations through the actual shared MCP implementation. Shell agents and scripts can use it.

</details>

<details>
<summary><b>Does Calendly have an official MCP?</b></summary>

Yes, hosted at https://mcp.calendly.com, using DCR OAuth 2.1 and PKCE. It is a strong scheduling option.

</details>

<details>
<summary><b>Why offer ours too?</b></summary>

Local CLI use, PAT/REST OAuth grants, named accounts, Contacts/Notetaker operations, bounded pagination and explicit guards. No overall superiority or efficiency percentage is claimed.

</details>

<details>
<summary><b>Is there already another CLI?</b></summary>

Yes. The reviewed bcharleson/calendly-cli repository offers a community CLI and MCP. No dedicated provider-published task CLI was identified in the official pages reviewed.

</details>

<details>
<summary><b>Is this free?</b></summary>

The wrapper preserves AGPL-3.0-or-later. Calendly plan charges, permissions and quotas remain separate.

</details>

<details>
<summary><b>Where do I get a PAT?</b></summary>

In your intended Calendly account, open Integrations > API and webhooks, generate a scoped token and store it privately.

</details>

<details>
<summary><b>Can I paste credentials into chat?</b></summary>

Use private local settings or owner-only files outside repositories. Never put tokens or signing keys in chats, issues or shared project configs.

</details>

<details>
<summary><b>Does login complete OAuth?</b></summary>

No, it prints setup instructions. Bring your own authorized REST grant; the official hosted MCP separately handles DCR OAuth in a compatible client.

</details>

<details>
<summary><b>How does OAuth refresh work?</b></summary>

A private JSON token file is required. Rotation is locked, single-use and atomically saved. Failed or unknown rotations require reauthorization/repair and restart, rather than repeated token use.

</details>

<details>
<summary><b>Is there a desktop version?</b></summary>

The versioned .mcpb bundles production dependencies and supports private sensitive PAT/file settings. Compatible host/runtime and custom-extension policy apply; GUI installation is separately unverified.

</details>

<details>
<summary><b>Can a browser-only client use this local package?</b></summary>

It needs local stdio. For remote URL clients, check the official hosted MCP and DCR compatibility.

</details>

<details>
<summary><b>Does create_invitee create a draft?</b></summary>

It creates a real booking with normal calendar invites, notifications and workflows. There is no draft booking; explicit confirmation is required.

</details>

<details>
<summary><b>Can it reschedule a meeting directly?</b></summary>

No invented reschedule endpoint is exposed. Use supported returned links/workflows or a separately approved cancellation/new booking.

</details>

<details>
<summary><b>Are availability windows still seven days?</b></summary>

Event-type available slots now allow up to 31 days; user busy-time queries remain capped at seven. Both need future increasing ranges.

</details>

<details>
<summary><b>Can I retrieve every page?</b></summary>

Supported native page_token lists have bounded all_pages, max_items and a 100-request cap. Every page uses quota, and continuation is not a snapshot.

</details>

<details>
<summary><b>What is resume.skip?</b></summary>

The result cap cut through a page. Fetch the same token with identical filters/count and skip that many records locally. There is no skip API flag.

</details>

<details>
<summary><b>Can it create a transcript?</b></summary>

It reads existing Notetaker transcript/recap data where your account provides it. It does not record a meeting or bypass access/consent requirements.

</details>

<details>
<summary><b>Will it retry a write?</b></summary>

No. Inspect state after an unknown booking or edit outcome before repeating it. GET retries and auth refresh do not resubmit writes.

</details>

<details>
<summary><b>Is the CLI more token efficient?</b></summary>

Fresh eager/deferred MCP, skill and matched task usage measurements are pending. No estimates or borrowed savings figures are substituted.

</details>

## Questions

Open a sanitized [issue](https://github.com/thenavidm/calendly-mcp-cli/issues) with version/client/OS. Use SECURITY.md for private reports.

## About the author

Navid Moazzez is a leading AI business strategist, and the host of the AI Creator Summit, watched by 100,000+ creators. He helps creators and founders master AI and build their own AI Operating System (AI OS) to automate their business and life. This Calendly MCP server and CLI is one piece of that system.

**Links**

- Personal website: [navid.me](https://navid.me)
- Link in bio: [navid.bio](https://navid.bio)
- Navid Media: [navid.media](https://navid.media)
- YouTube: [@thenavidm](https://youtube.com/@thenavidm?sub_confirmation=1) and [@thenavidai](https://youtube.com/@thenavidai?sub_confirmation=1)
- X: [@thenavidm](https://x.com/thenavidm)
- Instagram: [@thenavidm](https://instagram.com/thenavidm)
- LinkedIn: [thenavidm](https://linkedin.com/in/thenavidm)

## Dependencies

| Dependency | Version range | Used for |
| --- | --- | --- |
| `@modelcontextprotocol/sdk` | `^1.32.0` | MCP protocol and shared CLI bridge |
| `ajv` | `^8.17.1` | JSON Schema input validation |
| `ajv-formats` | `^3.0.1` | JSON Schema input validation |

Full third-party attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Development tooling and its audit limitations are documented in [SECURITY.md](SECURITY.md).

## License

AGPL-3.0-or-later, preserving the existing license. See [LICENSE](LICENSE), [full AGPL text](licenses/AGPL-3.0.txt) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Calendly service/documentation terms remain separate.

---

© 2026 [Navid Media](https://navid.media). Made with ❤️ by [Navid Moazzez](https://navid.me).
