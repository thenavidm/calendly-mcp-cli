# Calendly comparisons

Checked October 2, 2026.

| Offering | Surface | Documented scope and tradeoff |
| --- | --- | --- |
| [Official Calendly MCP](https://developer.calendly.com/docs/mcp/calendly-mcp-server) | Hosted https://mcp.calendly.com, DCR OAuth/PKCE | Strong scheduling and user/organization coverage plus provider skills; no PAT/static console OAuth connection |
| This package | Local MCP + shared CLI + desktop archive | 65 current REST operations plus local helper; Contacts/custom fields/Notetaker, private PAT/REST OAuth, named accounts, bounded cursors and explicit guards; local maintenance required |
| [Calendly docs MCP](https://developer.calendly.com/llms.txt) | https://developer.calendly.com/_mcp/server | Documentation search/reference; not authenticated account scheduling |
| [bcharleson/calendly-cli](https://github.com/bcharleson/calendly-cli) | Community CLI + MCP | Documents PAT login, user/organization auto-resolution, agent JSON and scheduling commands; its current README still states a seven-day event-slot range, versus the official July 2026 change to 31 |
| [meAmitPatil/calendly-mcp-server](https://github.com/meAmitPatil/calendly-mcp-server) | Community MCP | Documents PAT/OAuth and end-to-end booking, discovery, availability and locations; review its current implementation/permissions before use |

Checked October 2, 2026. The official supported-tools table lists 34 account operations plus two skills, but this is a documentation count, not authenticated tools/list. It does not list Contacts/Notetaker in the reviewed table. It shows several paths that differ from the current REST spec (availability schedules, locations, share and routing submissions). Our API routes use the current OpenAPI; that discrepancy does not prove the official hosted MCP fails. Neither tool counts nor schema size establish task success or token savings.

No dedicated Calendly-published task CLI was identified in the reviewed official developer pages. A community CLI does exist, so we do not claim the CLI category is empty. Community scope observations are documentation/source reviews, not competitor handshakes or live booking tests. See [COMPARISON.md](COMPARISON.md) for evidence scope and the pending matched task comparison.


MCP and CLI use the same SDK server, schemas, validation and HTTP handlers. The CLI talks to that server through the SDK's in-memory transport; there is no second API implementation.

| Measurement | What to include |
| --- | --- |
| Eager MCP loading | All tool schemas and instructions |
| Default/deferred tool search | Actual selected schemas and discovery overhead |
| Skill read once | Full SKILL.md and command discovery |
| Recurring skill discovery | The installed skill's listing text |
| Matched successful task | Help/schema, reasoning, calls/commands, results, errors and retries |

Fresh usage measurements are pending. Codex is the current measurement priority; neither interface requires Claude Code. Do not estimate tokens from characters, substitute another repo's results or declare zero CLI cost. Record model/client/package versions and date, loading settings, input/output usage, latency and equivalent outcomes. Compare a small user/event query and repeated focused scheduling across supported official/local surfaces, using the same authorized data and result fields. API quota and service costs remain separate. No measured superiority is claimed.



[Calendly's official MCP](https://developer.calendly.com/docs/mcp/calendly-mcp-server) is hosted at `https://mcp.calendly.com`. It uses OAuth 2.1, PKCE S256, resource discovery and Dynamic Client Registration. It does not accept a PAT or a manually provisioned console client_id/client_secret connection. A client prompting only for static OAuth credentials is incompatible with that documented flow. The documentation search MCP at `https://developer.calendly.com/_mcp/server` reads docs; it does not operate your account. Keep all three entries distinct.
