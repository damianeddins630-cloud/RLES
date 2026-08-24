import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEnv, getRedirectUri, getRequestHost } from "lms-lib/env";
import { getDiscordAuthUrl } from "lms-lib/discord-oauth";

/**
 * Returns the OAuth redirect URI you must register in Discord Developer Portal.
 * Visit /api/auth/oauth-info while debugging "Invalid OAuth2 redirect_uri".
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const host = getRequestHost(req);
  const redirectUri = getRedirectUri(host);
  const clientId = process.env.DISCORD_CLIENT_ID ?? null;

  return res.status(200).json({
    clientId,
    redirectUri,
    scope: "identify",
    loginUrl: "/api/auth/discord",
    discordPortalSteps: [
      "Open https://discord.com/developers/applications",
      "Select your LMS application (Application ID must match clientId above)",
      "OAuth2 → Redirects → Add Redirect",
      `Paste exactly: ${redirectUri}`,
      "Save Changes",
    ],
    note:
      "The redirect URI must match character-for-character (https, no trailing slash).",
  });
}
