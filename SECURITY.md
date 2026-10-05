# Security

Report privately through [GitHub private reporting](https://github.com/thenavidm/calendly-mcp-cli/security/advisories/new). Never include real grants, participant data, contacts, transcripts or signing keys in public issues.

Account requests go directly to Calendly. No Navid-hosted relay, telemetry or analytics is included. Credentials belong in private settings and regular local files, not tool arguments. Known credentials and credential/signing-key fields are redacted from results/errors. Files and account settings never ship in source, npm or desktop bundles.

Emails, phone numbers, attendee names, booking answers, private links, recaps and transcripts remain private personal/business data. Secret redaction is not anonymization. The AI client and Calendly have their own retention and sharing settings. --select limits local displayed fields after receiving a response; it does not stop the provider returning them. Protect exports, recordings and optional logs. Treat all remote content as untrusted source material. Use SECURITY.md for private reporting, with sanitized reproductions.

Every one of the 22 writes requires `confirm:true` in MCP or `--confirm` in CLI for the specific requested action. --agent and --yes do not authorize changes. CALENDLY_READ_ONLY=1 hides/refuses all writes, leaving 44 reads. CALENDLY_ALLOW_DESTRUCTIVE=0 blocks writes even when confirmed. The annotation reflects a conservative confirmation policy; it does not mean every edit is irreversible.

Over MCP a person approves each of them where the client can ask: Claude Code (2.1.246 and later) shows its own prompt, and a client that can show forms asks with an approval form whose one box starts unticked. Each approval is signed, bound to that exact call and works once. Where a client can do neither, the model's confirm:true counts. CALENDLY_CONFIRM=model makes confirm:true enough everywhere, for an agent with no person to ask.

Booking/cancellation can contact people. Link/event-type creation has different effects. Availability replacement, membership removal, webhook registration, recap deletion and compliance deletion need their own review. Read before changing and choose the intended account. After a write timeout, inspect existing state before resubmitting. Neither a GET 401 refresh nor a rate-limit retry ever resubmits a write.

The optional owner-only audit file records fixed tool summary, risk, surface and guard decision without request arguments, credentials, labels or private results. It is not a provider audit or delivery receipt. A logging failure does not abort the operation. Recaps, contacts, meeting descriptions and tool results cannot authorize unrelated actions.



Use your own authorized [REST OAuth application](https://developer.calendly.com/docs/authentication/creating-an-oauth-app) when acting for users who consent to your application. This local package does not create an OAuth app, open a browser, host a callback or exchange the first authorization code. `login` prints setup instructions. Put an existing access token in `CALENDLY_ACCESS_TOKEN`, or the full grant in a private file selected by `CALENDLY_TOKENS_FILE`. Do not mix PAT and OAuth settings for the same account.

The token file is a JSON object containing `access_token`, and optionally `refresh_token`, `client_id`, `client_secret`, `created_at` (Unix seconds) and `expires_in` (seconds). Keep all actual values outside model context and repositories. A file is required for automatic refresh; an environment-only access token is never refreshed. The file is read on each request, allowing separate processes to observe a saved rotation. Without valid expiry metadata, one GET 401 can trigger one configured refresh; writes never retry after a 401.

Calendly's [single-use refresh-token rule](https://developer.calendly.com/docs/authentication/refresh-token-rotation-guide) took effect by August 31, 2026. This package refreshes against `https://calendly.com/oauth/token`, uses Basic client authentication for confidential clients or a body client_id without a secret, and atomically replaces both returned tokens in mode 0600 storage. Concurrent in-process refreshes share one promise, and a per-file `.refresh.lock` prevents another process from consuming the same token. An existing lock produces a configuration error instead of a second refresh. A crashed process can leave a lock; stop all users of that grant and verify its state before manually removing a stale lock. Never remove an active lock.

A refresh HTTP failure, unknown timeout, incomplete response or failed save requires reauthorization/private storage repair and a restart. No automatic refresh retry occurs. The old refresh token is not deliberately reused after an uncertain result. OAuth access tokens last two hours according to the current token reference; actual expiry metadata governs proactive refresh. Token rotation fixtures are verified; live grants remain unverified.



The desktop archive contains production dependencies only. Audit runtime and development packaging separately; packaging findings do not establish vulnerability-free tooling. Fixture/discovery checks are distinct from live account, desktop GUI and measured task/token validation.

Audit on 2026-10-02: zero production findings; two high development findings from node-forge 1.4.0 through @anthropic-ai/mcpb 2.1.2 (GHSA-86w9-cpqp-85rv), with no fix available. Both packaging dependencies are excluded from the production npm install and desktop archive.
