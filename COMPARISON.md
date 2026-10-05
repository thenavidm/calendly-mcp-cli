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


MCP and CLI are built by [Slipway](https://github.com/thenavidm/slipway) from each tool's one definition, so they share schemas, validation and HTTP handlers; there is no second API implementation.

README section 7 has this package's own costs, measured in Claude Code and Codex against 2.0.1 on 2026-10-05. Do not estimate tokens from characters or substitute another repo's results; no other offering was measured, and API quota and service costs remain separate.



[Calendly's official MCP](https://developer.calendly.com/docs/mcp/calendly-mcp-server) is hosted at `https://mcp.calendly.com`. It uses OAuth 2.1, PKCE S256, resource discovery and Dynamic Client Registration. It does not accept a PAT or a manually provisioned console client_id/client_secret connection. A client prompting only for static OAuth credentials is incompatible with that documented flow. The documentation search MCP at `https://developer.calendly.com/_mcp/server` reads docs; it does not operate your account. Keep all three entries distinct.
