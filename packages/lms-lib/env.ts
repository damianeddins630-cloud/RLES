export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Normalize host from Vercel/proxy headers (no port surprises on production). */
export function getRequestHost(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers["x-forwarded-host"];
  const hostHeader = forwarded
    ? String(Array.isArray(forwarded) ? forwarded[0] : forwarded)
    : String(req.headers.host ?? "localhost:3000");
  return hostHeader.split(",")[0].trim();
}

/**
 * OAuth redirect URI — must match Discord Developer Portal → OAuth2 → Redirects exactly.
 * Prefer the live request host so preview/custom domains work when registered in Discord.
 */
export function getRedirectUri(host: string): string {
  const primary = host.split(",")[0].trim();
  const protocol =
    primary.includes("localhost") || primary.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const fromHost = `${protocol}://${primary}/api/auth/callback`;

  const configured = process.env.DISCORD_REDIRECT_URI?.trim();
  if (!configured) return fromHost;

  const normalized = configured.replace(/\/$/, "");
  // If user is on the canonical site host, always use that host's callback URL.
  if (primary.includes("leaguemastersystem.vercel.app")) return fromHost;
  return normalized;
}
