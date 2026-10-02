export type Account = {
  name: string;
  apiToken: string;
  tokenFile: string;
  accessToken: string;
  tokensFile: string;
};
export type Config = {
  accounts: Account[];
  defaultAccount: string;
  readOnly: boolean;
  allowDestructive: boolean;
  auditPath: string;
  timeoutMs: number;
  maxRetries: number;
  minIntervalMs: number;
};
function integer(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = value ? Number(value) : fallback;
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Error("Invalid timeout, retry or pacing setting.");
  return n;
}
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  let entries: Record<string, unknown>[] = [];
  if (env.CALENDLY_ACCOUNTS)
    try {
      const value = JSON.parse(env.CALENDLY_ACCOUNTS);
      if (!Array.isArray(value)) throw new Error();
      entries = value;
    } catch {
      throw new Error(
        "CALENDLY_ACCOUNTS must be a private JSON array of named accounts.",
      );
    }
  else if (
    env.CALENDLY_API_TOKEN ||
    env.CALENDLY_TOKEN_FILE ||
    env.CALENDLY_ACCESS_TOKEN ||
    env.CALENDLY_TOKENS_FILE
  )
    entries = [
      {
        name: "default",
        api_token: env.CALENDLY_API_TOKEN,
        token_file: env.CALENDLY_TOKEN_FILE,
        access_token: env.CALENDLY_ACCESS_TOKEN,
        tokens_file: env.CALENDLY_TOKENS_FILE,
      },
    ];
  const accounts = entries.map((x) => {
    if (
      !x ||
      typeof x !== "object" ||
      typeof x.name !== "string" ||
      !x.name.trim()
    )
      throw new Error("Each Calendly account needs a unique nonempty name.");
    const text = (k: string) =>
      typeof x[k] === "string" ? (x[k] as string) : "";
    const a = {
      name: x.name.trim(),
      apiToken: text("api_token"),
      tokenFile: text("token_file"),
      accessToken: text("access_token"),
      tokensFile: text("tokens_file"),
    };
    if ((a.apiToken || a.tokenFile) && (a.accessToken || a.tokensFile))
      throw new Error(
        "Choose PAT or OAuth credentials for each account, without mixing them.",
      );
    return a;
  });
  if (new Set(accounts.map((a) => a.name)).size !== accounts.length)
    throw new Error("Calendly account names must be unique.");
  return {
    accounts,
    defaultAccount: env.CALENDLY_DEFAULT_ACCOUNT ?? accounts[0]?.name ?? "",
    readOnly: /^(1|true)$/i.test(env.CALENDLY_READ_ONLY ?? ""),
    allowDestructive: !/^(0|false)$/i.test(
      env.CALENDLY_ALLOW_DESTRUCTIVE ?? "",
    ),
    auditPath: env.CALENDLY_AUDIT_LOG ?? "",
    timeoutMs: integer(env.CALENDLY_REQUEST_TIMEOUT_MS, 30000, 100, 300000),
    maxRetries: integer(env.CALENDLY_MAX_RETRIES, 2, 0, 5),
    minIntervalMs: integer(
      env.CALENDLY_MIN_REQUEST_INTERVAL_MS,
      1300,
      0,
      10000,
    ),
  };
}
export function selectAccount(config: Config, hint?: string): Account {
  const a = config.accounts.find(
    (a) => a.name === (hint ?? config.defaultAccount),
  );
  if (!a)
    throw new Error(
      config.accounts.length
        ? "Unknown account. Run list_accounts and use its exact name."
        : "No credentials configured. Run calendly-cli login and set private PAT or OAuth credentials.",
    );
  return a;
}
