# Install Calendly MCP Server & CLI

One npm package includes both binaries and all **66 tools**. Requires Node.js 22 or newer for CLI/manual MCP installs. Discovery works before account authentication. Account operations need eligible Calendly API access; Endpoint scopes and account permissions apply.

| Route | Program | Use |
| --- | --- | --- |
| Terminal | calendly-cli | Scripts and agents with a shell |
| Local MCP | calendly-mcp | AI clients supporting stdio |
| Desktop archive | calendly-2.0.0.mcpb | Compatible Claude Desktop custom extensions |
| Calendly-hosted alternative | https://mcp.calendly.com | Official remote OAuth, DCR OAuth / PKCE support |

## Contents

[Requirements](#requirements) · [CLI](#cli) · [Private account setup](#private-account-setup) · [Claude Code](#claude-code) · [Codex](#codex) · [Claude Desktop](#claude-desktop) · [Cursor](#cursor) · [VS Code and Copilot](#vs-code-and-copilot) · [Windsurf](#windsurf) · [Zed](#zed) · [Gemini CLI](#gemini-cli) · [Docker](#docker) · [Verify](#verify) · [Multiple accounts](#multiple-accounts) · [Updates and removal](#updates-and-removal) · [Troubleshooting](#troubleshooting) · [Development](#development)

## Requirements

Install Node from [nodejs.org](https://nodejs.org/en/download). Open a new terminal and check `node --version` and `npm --version`. The desktop host needs a compatible Node runtime; dependencies are bundled. A GUI app may not inherit your terminal's environment. Check your account's current API access with Calendly instead of assuming npm installation provides it.

## CLI

On macOS/Linux, use Terminal. On Windows, use PowerShell or Command Prompt:

```bash
npm install -g @thenavidm/calendly-mcp-cli@latest
calendly-cli --version
calendly-cli
calendly-cli list-contacts --help
calendly-cli schema create-invitee
calendly-cli login
```

If PowerShell blocks npm.ps1, use npm.cmd or Command Prompt according to your policy. If a binary is missing, check `npm prefix -g`, ensure its executable directory is on PATH and open a new terminal. Avoid sudo as a workaround for PATH problems.

For one command without a global install:

```bash
npx -y --package @thenavidm/calendly-mcp-cli@latest calendly-cli tools
```

Make [SKILL.md](./SKILL.md) available in your agent's supported skill location. The installed file is `<npm root -g>/@thenavidm/calendly-mcp-cli/SKILL.md`. npm does not automatically register client skills. Your agent should read the actual schema and use --agent/--select for compact output.

## Private account setup

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


Temporary private shell settings:

```bash
export CALENDLY_TOKEN_FILE='/absolute/private/calendly-token.txt'
calendly-cli doctor --network
```

PowerShell:

```powershell
$env:CALENDLY_TOKEN_FILE = 'C:\Users\YOUR_USER\Private\calendly-token.txt'
calendly-cli doctor --network
```

### Agent-guided installation

> Help me install Calendly MCP Server & CLI with INSTALL.md. Check Node and the binary, let me configure my account credentials privately, then run discovery and doctor --network. Do not send messages or change members during setup.

## Claude Code

For a user-scoped connection, after privately configuring credentials:

~~~bash
claude mcp add --scope user calendly -- npx -y @thenavidm/calendly-mcp-cli@latest
claude mcp list
~~~

Use the client's private local environment settings for the account variable if they are not inherited. Claude's `-e NAME=value` registration option writes values into its config; only use it locally through your secret manager, with no shared command transcript. Never place credentials in a project .mcp.json. Reconnect and ask Claude to verify credentials.

Alternatively install the CLI, make SKILL.md available to Claude, and use shell commands. Registering both surfaces is optional.

## Codex

Codex is a first-class client for both surfaces. The installed Codex CLI 0.159.3 accepts the local stdio command and private environment forwarding below. No Claude Code is required.

~~~bash
codex mcp add calendly -- npx -y @thenavidm/calendly-mcp-cli@latest
codex mcp list
~~~

Account credentials must reach the server through private environment settings. `codex mcp add --env NAME=value` stores values in your local config, so never commit that config or put secrets in a shared command. In TOML, the equivalent server is:

~~~toml
[mcp_servers.calendly]
command = "npx"
args = ["-y", "@thenavidm/calendly-mcp-cli@latest"]
env_vars = ["CALENDLY_API_TOKEN", "CALENDLY_TOKEN_FILE", "CALENDLY_ACCESS_TOKEN", "CALENDLY_TOKENS_FILE"]
~~~

`env_vars` forwards those names from the environment available to Codex. If that environment does not contain them, configure private env settings locally. Codex can also call the CLI directly with SKILL.md and `--agent` output.

## Claude Desktop

### Install the .mcpb extension

1. Download `calendly-2.0.0.mcpb` from [GitHub Releases](https://github.com/thenavidm/calendly-mcp-cli/releases/latest).
2. In a supported Claude Desktop build, open **Settings > Extensions > Advanced settings > Install Extension…** and select it.
3. Enter a private PAT in the sensitive setting, or an absolute private token-file path. Leave the unused credential routes empty. For OAuth select the separate private JSON grant-file path.
4. Enable read-only if you want only the 44 reads. Reconnect and ask for account verification.

The bundle includes production dependencies and no credentials. Use a regular private token-only file if you prefer file-based credentials. The manifest requires Node 22 or newer from a compatible host. Organization policy may restrict custom extensions. Manual bundle updates require installing the new version; no automatic directory updates are promised. GUI installation remains unverified separately from archive/protocol checks.

### Manual config

Open **Settings > Developer > Edit Config**, or use your platform's config file:

| OS | Typical config path |
| --- | --- |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json`; confirm the location through Edit Config in your installed build |

~~~json
{
  "mcpServers": {
    "calendly": {
      "command": "npx",
      "args": ["-y", "@thenavidm/calendly-mcp-cli@latest"],
      "env": {
        "CALENDLY_API_TOKEN": "YOUR_PRIVATE_PAT",
        "CALENDLY_TOKEN_FILE": "",
        "CALENDLY_ACCESS_TOKEN": "",
        "CALENDLY_TOKENS_FILE": ""
      }
    }
  }
}
~~~

Replace the placeholders only in your private file. Merge the server entry into an existing mcpServers object instead of replacing other integrations. Fully quit and reopen Claude Desktop. Do not enable an extension and a manual entry with the same name; choose one route.

If a Windows launcher cannot execute npx directly, use `"command": "cmd"` with `"args": ["/c", "npx", "-y", "@thenavidm/calendly-mcp-cli@latest"]`. An absolute node executable and installed `dist/index.js` path also avoids launcher/PATH problems.

## Cursor

Use private user settings at `~/.cursor/mcp.json`, or **Settings > Tools & MCP**. [Cursor documents environment interpolation and envFile support](https://cursor.com/docs/mcp).

~~~json
{
  "mcpServers": {
    "calendly": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/calendly-mcp-cli@latest"],
      "env": {
        "CALENDLY_API_TOKEN": "${env:CALENDLY_API_TOKEN}",
        "CALENDLY_TOKEN_FILE": "${env:CALENDLY_TOKEN_FILE}",
        "CALENDLY_ACCESS_TOKEN": "${env:CALENDLY_ACCESS_TOKEN}",
        "CALENDLY_TOKENS_FILE": "${env:CALENDLY_TOKENS_FILE}"
      }
    }
  }
}
~~~

The environment values must exist for the Cursor process. If you use envFile, keep that file private and outside version control. A project's .cursor/mcp.json must not contain actual credentials. Reconnect the server after saving.

## VS Code and Copilot

Use **MCP: Open User Configuration**. [VS Code uses servers and secure inputs](https://code.visualstudio.com/docs/agent-customization/mcp-servers), rather than a mcpServers root:

~~~json
{
  "inputs": [
    {"type": "promptString", "id": "calendly-api-key", "description": "Calendly PAT (leave empty for a private token file)", "password": true},
    {"type": "promptString", "id": "calendly-token-file", "description": "Optional private token-file path (leave empty for PAT)"}
  ],
  "servers": {
    "calendly": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/calendly-mcp-cli@latest"],
      "env": {
        "CALENDLY_API_TOKEN": "${input:calendly-api-key}",
        "CALENDLY_TOKEN_FILE": "${input:calendly-token-file}",
        "CALENDLY_ACCESS_TOKEN": "",
        "CALENDLY_TOKENS_FILE": ""
      }
    }
  }
}
~~~

Start Calendly through the MCP controls, approve trust if prompted, and enter credentials in the private input prompts. Workspace .vscode/mcp.json may contain this placeholder-only structure, but never resolved secret values. Remote development runs the server in the selected remote environment, so local file paths refer to that environment.

## Windsurf

Open Cascade's MCP settings or edit the private user file `~/.codeium/windsurf/mcp_config.json`. Use the Claude Desktop manual mcpServers block above with your locally configured env values. See [Windsurf's current MCP documentation](https://docs.devin.ai/desktop/cascade/mcp). Restart or reconnect Calendly in Cascade; project files must not contain secrets.

## Zed

Open **Settings > AI > MCP Servers > Add Server > Add Local Server**, or your user settings file. [Zed uses context_servers](https://zed.dev/docs/ai/mcp):

~~~json
{
  "context_servers": {
    "calendly": {
      "command": "npx",
      "args": ["-y", "@thenavidm/calendly-mcp-cli@latest"],
      "env": {
        "CALENDLY_API_TOKEN": "YOUR_PRIVATE_PAT",
        "CALENDLY_TOKEN_FILE": "",
        "CALENDLY_ACCESS_TOKEN": "",
        "CALENDLY_TOKENS_FILE": ""
      }
    }
  }
}
~~~

Enter actual values only in private user settings. Check the active-server indicator before prompting. Do not wrap command and args inside a nested command object from older Zed examples.

## Gemini CLI

Merge the Claude Desktop manual mcpServers block into your private `~/.gemini/settings.json`. Configure the private credential values locally, then restart Gemini CLI and inspect `/mcp`. See [Gemini CLI's MCP configuration](https://geminicli.com/docs/tools/mcp-server/). Its project settings must not contain real credentials. You can instead use the CLI from an agent shell.

Other local stdio clients use the same command and arguments, adapted to their config format. A client that only accepts a remote MCP URL cannot connect directly: this package does not ship a public HTTP listener. ChatGPT's remote connector setup is not a substitute for local stdio installation.

## Docker

Build locally from the reviewed source; no prebuilt registry image is claimed:

```bash
git clone https://github.com/thenavidm/calendly-mcp-cli.git
cd calendly-mcp-cli
docker build -t calendly-mcp-cli .
docker run --rm -i -e CALENDLY_API_TOKEN calendly-mcp-cli
```

`-e CALENDLY_API_TOKEN` forwards the shell's already configured private value. MCP needs `-i` and stdio. For file-based tokens, mount the private token file read-only and set the absolute in-container CALENDLY_TOKEN_FILE path. Host paths do not automatically exist inside a container. PAT files are read-only and cached until restart. For OAuth, mount the private grant directory with narrowly scoped read/write access so atomic replacement and lock creation work; a read-only mount cannot rotate credentials. Do not mount a whole home directory.

## Cline and other local MCP clients

Use the client's **Add MCP server** flow with command `npx`, arguments `-y` and `@thenavidm/calendly-mcp-cli@latest`, stdio transport, and private local PAT or OAuth credential settings. UI names depend on the installed client. Reconnect and discover tools before an account call. Browser-only clients need a remote HTTPS connector; use Calendly's official server rather than this local stdio command.

## Verify

```bash
calendly-cli doctor
calendly-cli doctor --network
calendly-cli tools
calendly-cli schema list-events
calendly-cli list-accounts --agent
```

The full server discovers 66 tools; read-only discovers 44. Help/schemas/list_accounts are local. The network doctor reads user details without returning private account content. A successful account read does not prove every endpoint's scopes, roles or plan eligibility.

To try read-only, privately set CALENDLY_READ_ONLY=1, restart/reconnect and inspect discovery. All 22 writes must disappear and direct write calls must refuse. Remove/disable the setting and reconnect only when you need writes. `CALENDLY_ALLOW_DESTRUCTIVE=0` separately blocks all 22 writes even when confirmed.

## Multiple accounts

Set private CALENDLY_ACCOUNTS JSON, which replaces the single-account variables:

```json
[{"name":"work","api_token":"YOUR_PRIVATE_WORK_PAT"},{"name":"personal","token_file":"/absolute/private/path/personal-calendly.txt"}]
```

Set CALENDLY_DEFAULT_ACCOUNT=work. `calendly-cli list-accounts --agent` lists labels and auth methods; `--account personal` selects another account. Keep the JSON out of public project configs. Separate server instances can provide stronger process-level isolation if needed.

## Updates and removal

```bash
npm install -g @thenavidm/calendly-mcp-cli@latest
calendly-cli --version
claude mcp remove --scope user calendly
codex mcp remove calendly
npm uninstall -g @thenavidm/calendly-mcp-cli
```

Reinstall a newer desktop archive separately and restart affected clients. Remove manual client entries using its own settings. Uninstalling the package does not revoke Calendly credentials, remove private token files or undo bookings, invitations, contact edits or recap changes. Revoke the PAT or OAuth grant in Calendly when appropriate. Inspect and remove your private settings and files separately.

Pin a reviewed version instead of @latest if your automation requires reproducibility. Check [CHANGELOG.md](./CHANGELOG.md) and [GitHub Releases](https://github.com/thenavidm/calendly-mcp-cli/releases) before a major update. Do not roll back by blindly publishing an older version over an existing npm version.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Missing command | Node 22+, global prefix and PATH |
| No configured account | Private CALENDLY_API_TOKEN or regular CALENDLY_TOKEN_FILE |
| GUI authentication fails | Actual private GUI environment; shell env is separate |
| OAuth expiry/rotation | Private grant file, current refresh token, owner-only storage and no active competing lock |
| 401/403 | scoped PAT/OAuth grant, role and current endpoint scopes |
| Invalid/null body | schema; use payload/payload_file for null and nested data |
| First page only | Native page_token/count and bounded all_pages with continuation metadata |
| Guard refusal | User-requested --confirm, read-only and destructive settings |
| Write timeout | Inspect account before repeating; no automatic write retries |
| Desktop host rejects extension | Compatible host/runtime and organization custom-extension policy |

See the README for the complete argument table, safety, 20 FAQs and API snapshot corrections. Secrets must never appear in a troubleshooting transcript.

## Development

```bash
git clone https://github.com/thenavidm/calendly-mcp-cli.git
cd calendly-mcp-cli
npm ci
npm run typecheck
npm run build
npm test
npm run check:counts
npm run build:mcpb
```

Source mode: configure private env, then register `node /absolute/path/calendly-mcp-cli/dist/index.js` as the MCP command. Build before registration and after source changes. No local credentials are packaged. [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) cover contributions, disclosures and licensing.
