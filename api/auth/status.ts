import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRedirectUri, getRequestHost } from "lms-lib/env";

const REQUIRED_REDIRECT =
  "https://leaguemastersystem.vercel.app/api/auth/callback";

async function fetchDiscordRedirectUris(): Promise<string[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return [];

  const res = await fetch("https://discord.com/api/v10/oauth2/applications/@me", {
    headers: { Authorization: `Bot ${botToken}` },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { redirect_uris?: string[] };
  return data.redirect_uris ?? [];
}

/** Login health check — shows whether Discord OAuth redirect is configured. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const host = getRequestHost(req);
  const redirectUri = getRedirectUri(host);
  const redirectUris = await fetchDiscordRedirectUris();
  const redirectConfigured =
    redirectUris.includes(REQUIRED_REDIRECT) ||
    redirectUris.includes(redirectUri);

  return res.status(200).json({
    ok: redirectConfigured,
    clientId: process.env.DISCORD_CLIENT_ID ?? null,
    expectedRedirectUri: REQUIRED_REDIRECT,
    currentRedirectUri: redirectUri,
    discordRedirectUris: redirectUris,
    redirectConfigured,
    fixRequired: !redirectConfigured,
    fixSteps: redirectConfigured
      ? []
      : [
          "Open https://discord.com/developers/applications",
          "Select app with ID 1541170292297310249 (League Master System)",
          "OAuth2 → Redirects → Add Redirect",
          `Paste exactly: ${REQUIRED_REDIRECT}`,
          "Click Save Changes",
          "Then use Continue with Discord on the website",
        ],
  });
}
