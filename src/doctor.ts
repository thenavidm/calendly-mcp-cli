import { loadConfig } from "./config.js";
import { CalendlyClient } from "./api/client.js";
import { exitCodeFor } from "./cli.js";
export async function runDoctor(network = false): Promise<number> {
  const config = loadConfig();
  const configured = config.accounts.length > 0;
  const result: Record<string, unknown> = {
    ok: configured,
    node: process.version,
    accountsConfigured: config.accounts.length,
    readOnly: config.readOnly,
    authenticationChecked: false,
    note: configured
      ? "Use doctor --network to read user details privately; no content is printed."
      : "Set CALENDLY_API_TOKEN or CALENDLY_TOKEN_FILE privately, then run login for instructions.",
  };
  if (!configured) {
    console.log(JSON.stringify(result, null, 2));
    return 10;
  }
  if (network)
    try {
      await new CalendlyClient(config).request("GET", "/users/me");
      result.authenticationChecked = true;
    } catch (e) {
      console.error(JSON.stringify({ error: (e as Error).message }));
      return exitCodeFor((e as Error).message);
    }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}
