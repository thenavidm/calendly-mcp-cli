#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer, VERSION } from "./server.js";
import { runCli, exitCodeFor } from "./cli.js";
import { runDoctor } from "./doctor.js";
import { basename } from "node:path";
const HELP = `Calendly MCP server and CLI ${VERSION}

calendly-mcp                         Start local stdio MCP
calendly-cli                         List task commands
calendly-cli <command> --help        Current arguments
calendly-cli schema <command>        Full JSON input schema
calendly-cli doctor [--network]      Local configuration / user read
calendly-cli login                   Private token setup instructions
calendly-cli --version               Package version

CALENDLY_API_TOKEN                   Private Calendly Personal Access Token
CALENDLY_TOKEN_FILE                  Regular private token-only file, max 64 KB
CALENDLY_ACCESS_TOKEN              Private OAuth access token, without auto-refresh
CALENDLY_TOKENS_FILE               Owner-only rotating OAuth JSON file
CALENDLY_ACCOUNTS / _DEFAULT_ACCOUNT Named private credentials
CALENDLY_READ_ONLY=1                 Hide/refuse all writes
CALENDLY_ALLOW_DESTRUCTIVE=0         Block all writes
CALENDLY_AUDIT_LOG                   Private guard-decision log
CALENDLY_REQUEST_TIMEOUT_MS=30000; CALENDLY_MAX_RETRIES=2 (GET 429 only)
CALENDLY_MIN_REQUEST_INTERVAL_MS=1300 Conservative per-account process pacing

https://github.com/thenavidm/calendly-mcp-cli
`;
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  if (["--version", "-v"].includes(command ?? "")) {
    console.log(VERSION);
    return;
  }
  if (["--help", "-h", "help"].includes(command ?? "")) {
    process.stdout.write(HELP);
    return;
  }
  if (command === "doctor") {
    if (args.slice(1).some((a) => a !== "--network")) {
      process.exitCode = 2;
      console.error(JSON.stringify({ error: "doctor accepts only --network" }));
      return;
    }
    process.exitCode = await runDoctor(args.includes("--network"));
    return;
  }
  if (command === "login") {
    console.log(
      "In Calendly open Integrations > API and webhooks, generate a scoped Personal Access Token and save it privately as CALENDLY_API_TOKEN or an owner-only token-only file via CALENDLY_TOKEN_FILE. For an existing REST OAuth grant use CALENDLY_ACCESS_TOKEN, or a private rotating JSON file via CALENDLY_TOKENS_FILE. OAuth refresh requires persistent storage; no environment-only refresh occurs. login prints setup instructions and does not open a browser, exchange a code or save credentials. Official hosted MCP is a different DCR OAuth connection. Then run calendly-cli doctor --network. See INSTALL.md.",
    );
    return;
  }
  if (
    args.length ||
    basename(process.argv[1] ?? "").startsWith("calendly-cli")
  ) {
    process.exitCode = await runCli(args);
    return;
  }
  const server = buildServer();
  await server.connect(new StdioServerTransport());
  const close = async () => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void close());
  process.on("SIGINT", () => void close());
}
main().catch((e) => {
  console.error(JSON.stringify({ error: e.message }));
  process.exitCode = exitCodeFor(e.message);
});
