import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDiscordAuthUrl } from "lms-lib/discord-oauth";
import { getEnv, getRedirectUri, getRequestHost } from "lms-lib/env";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const clientId = getEnv("DISCORD_CLIENT_ID");
    const host = getRequestHost(req);
    const redirectUri = getRedirectUri(host);
    const url = getDiscordAuthUrl(clientId, redirectUri);

    res.redirect(302, url);
  } catch (err) {
    console.error("Discord auth redirect error:", err);
    res.status(500).json({ error: "Server configuration error" });
  }
}
