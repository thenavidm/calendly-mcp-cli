# Changelog

## 3.0.1, 2026-10-05

- **A refusal and the approval form say what the call can do again.** 3.0.0 said every confirmed call "is public or cannot be undone", Slipway's words for a call it knows nothing more about. Both say again what 2.0.1 said, that the call may affect bookings, notifications, contacts, meeting recaps, availability or organization access, and a test holds them to it.
- **Built on Slipway 0.1.17**, which a fresh install of 3.0.0 already used. Since the Slipway 3.0.0 was measured on, `which` prints a title once where a description opens with it and reads an argument by its own words, and the general help counts the tuning settings instead of naming them, with `agent-context` describing each.

## 3.0.0, 2026-10-05

Built on [Slipway](https://github.com/thenavidm/slipway) 0.1.14. The 66 tools keep their names and arguments, and every difference below was measured against 2.0.1, the last version on npm, before release.

- **A smaller tool list.** Each write's body appeared twice, as its own fields and inside `payload`; 3.0.0 writes each repeated part once under `$defs`, and nothing is lost: Claude Code and Codex both read fields that appear only there, and validation still checks the full schema. Every tool loaded costs 39,979 tokens in Claude Code instead of 47,642; with tool search, its default, 1,169 as before.
- **A person approves each write over MCP.** All 22 writes still need confirmation. Claude Code (2.1.246 and later) shows its own prompt, and a client that can show forms asks with an approval form whose one box starts unticked. Approvals are signed, bound to the exact call and work once. Where a client can do neither, the model's `confirm: true` still counts, and `CALENDLY_CONFIRM=model` makes it enough everywhere. The audit log records who approved each write.
- **`CALENDLY_ALLOW_DESTRUCTIVE=0` still refuses every write**, confirmed or not, as 2.0 did.
- **Calendly's status picks the exit code.** A request Calendly rejects (400 or 422) exits 2 instead of 5, and a removed resource (410) 3 instead of 5. 401 and 403 still exit 4, 404 3, 429 7, a server error 5, and an unknown account or nothing configured 10. 1 now means an unexpected error.
- **`which <words>` finds a command**, and `agent-context` describes every command, flag and setting as JSON. In Codex 0.159.3, finding the command that cancels a scheduled event took a median of 83,073 input tokens over the CLI instead of 83,991 (five runs each), because Codex asked `which` instead of reading the full command list.
- **`install <client>`** adds the server to Claude Code, Codex, Claude Desktop, Cursor, VS Code or Gemini CLI in each one's own format, and **`calendly-mcp --http`** serves the same tools over Streamable HTTP, on 127.0.0.1:8787 unless told otherwise.
- **Less work to start.** Each input and body schema now compiles on its first use rather than at load, and the entry turns on Node's compile cache. The server spends 181 ms of CPU before its first answer where 2.0.1 spent 337, and answers in 124 ms of wall time instead of 198 (median of 21 runs, taking turns on one busy Mac). npx installs 10 dependencies instead of 94. A test still compiles every schema.
- **Docs.** README section 7 has the measured Claude Code and Codex costs, where 2.0 said they were pending; the settings table lists Slipway's own settings; and the version table says 3.0.0.

### Upgrading

Over MCP, expect an approval prompt or form before any write; a headless agent that should write with `confirm: true` alone needs `CALENDLY_CONFIRM=model`. A script that read exit 5 as a rejected request should read 2, and as a removed resource 3. An error's JSON keeps `error` and `status`; its `code` is now Slipway's (`usage`, `auth`, `not_found`, `rate_limited`, `api`, `not_configured`). Over MCP, an argument that fails the schema comes back as the MCP SDK's own message, "Input validation error: …", instead of JSON. With `CALENDLY_READ_ONLY=1`, a client that calls a hidden write gets "tool not found" instead of a refusal naming `CALENDLY_READ_ONLY`; the CLI still names it. Codex shows the argument descriptions of `create_contact` and `update_contact`, which 2.0.1's larger schemas lost in its rendering; its full listing is 1,296 tokens longer, and a discovery task over MCP read a median of 48,780 input tokens instead of 48,565. The audit log's lines gain `confirmed_by`, and each allowed write is followed by a `done` or `failed` line. A script that pipes JSON-RPC into the server must keep stdin open until it reads the answer: the server now stops when its input ends, as the MCP stdio binding asks. `--http` refuses a page from another site unless `CALENDLY_HTTP_ALLOWED_ORIGINS` lists it. Some terminal screens grew: the general help by 164 tokens, for `which`, `install`, the flags and the exit codes it now lists; the command list by 16; and the errors for a missing argument and an unknown command by 15 and 22, for their code and a hint. `SKILL.md` is 62 tokens longer in Claude Code, because it says how approval works over MCP and lists every exit code.

## 2.0.1, 2026-10-04

- **`npx -y @thenavidm/calendly-mcp-cli` always starts the MCP server.** npx starts whichever binary the npm registry lists first when they share one file, and the registry does not keep the published order, so an MCP client set up with this README's install line could get `calendly-cli` and its command list instead of a server. A third binary named after the package now always starts the server, and npx picks it by name.

Use the native terminal capture at 1040 source pixels with lossless GIF optimization, displayed at 520 pixels, matching the Bluesky/Substack reference. Original assets remain available.

## 2.0.0 - 2026-10-02

- Update to the current official API v2: 65 REST operations plus a local account helper; 66 tools, 44 reads and 22 confirmed writes.
- Add shared task CLI, current Contacts/custom fields/Notetaker, bounded opaque paging and correct scopes/routes.
- Implement single-use OAuth rotation with cross-process file locking, atomic private storage, no refresh retries and no mutation retries.
- Validate booking identities/location/guests, contact primary emails, webhook event/scope restrictions and 31-day versus 7-day availability windows.
- Add full house repo/client documentation, accordion FAQs, desktop packaging, comparison evidence, topics/keywords and release gates.
- Preserve original AGPL-3.0-or-later; no private credentials or legacy history are included in the public root.

### Migration from the 38 legacy tools

| Legacy tool | Current tool | Migration |
| --- | --- | --- |
| `get_current_user` | `get_current_user` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_user` | `get_user` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_event_types` | `list_event_types` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_event_type` | `get_event_type` | Use current UUID/URI flags and full body schema; every write confirms |
| `create_event_type` | `create_event_type` | Use current UUID/URI flags and full body schema; every write confirms |
| `update_event_type` | `update_event_type` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_event_type_available_times` | `list_event_type_available_times` | Use current UUID/URI flags and full body schema; every write confirms |
| `create_one_off_event_type` | `create_one_off_event_type` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_events` | `list_events` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_event` | `get_event` | Use current UUID/URI flags and full body schema; every write confirms |
| `cancel_event` | `cancel_event` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_event_invitees` | `list_event_invitees` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_event_invitee` | `get_event_invitee` | Use current UUID/URI flags and full body schema; every write confirms |
| `create_invitee` | `create_invitee` | Use current UUID/URI flags and full body schema; every write confirms |
| `create_no_show` | `create_no_show` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_no_show` | `get_no_show` | Use current UUID/URI flags and full body schema; every write confirms |
| `delete_no_show` | `delete_no_show` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_user_busy_times` | `list_user_busy_times` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_availability_schedules` | `list_availability_schedules` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_availability_schedule` | `get_availability_schedule` | Use current UUID/URI flags and full body schema; every write confirms |
| `create_scheduling_link` | `create_scheduling_link` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_organization` | `get_organization` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_organization_memberships` | `list_organization_memberships` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_organization_invitations` | `list_organization_invitations` | Use current UUID/URI flags and full body schema; every write confirms |
| `invite_to_organization` | `invite_to_organization` | Use current UUID/URI flags and full body schema; every write confirms |
| `revoke_organization_invitation` | `revoke_organization_invitation` | Use current UUID/URI flags and full body schema; every write confirms |
| `remove_from_organization` | `remove_from_organization` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_webhooks` | `list_webhooks` | Use current UUID/URI flags and full body schema; every write confirms |
| `create_webhook` | `create_webhook` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_webhook` | `get_webhook` | Use current UUID/URI flags and full body schema; every write confirms |
| `delete_webhook` | `delete_webhook` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_routing_forms` | `list_routing_forms` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_routing_form` | `get_routing_form` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_routing_form_submissions` | `list_routing_form_submissions` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_groups` | `list_groups` | Use current UUID/URI flags and full body schema; every write confirms |
| `get_group` | `get_group` | Use current UUID/URI flags and full body schema; every write confirms |
| `delete_invitee_data` | `delete_invitee_data` | Use current UUID/URI flags and full body schema; every write confirms |
| `list_activity_log` | `list_activity_log` | Use current UUID/URI flags and full body schema; every write confirms |

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

## 1.0.0 - legacy source

38 manually declared MCP-only tools. This records private source history, not a claim of an earlier public npm release.
