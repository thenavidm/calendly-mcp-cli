# Changelog

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
