import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  exchangeCodeForToken,
  fetchDiscordUser,
} from "lms-lib/discord-oauth";
import { getEnv, getRedirectUri, getRequestHost } from "lms-lib/env";
import { setSessionCookie } from "lms-lib/session";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = req.query.code as string | undefined;
  const oauthError = req.query.error as string | undefined;

  if (oauthError) {
    return res.redirect(302, `/?error=${encodeURIComponent(oauthError)}`);
  }

  if (!code) {
    return res.redirect(302, "/?error=missing_code");
  }

  try {
    const clientId = getEnv("DISCORD_CLIENT_ID");
    const clientSecret = getEnv("DISCORD_CLIENT_SECRET");
    const sessionSecret = getEnv("SESSION_SECRET");
    const host = getRequestHost(req);
    const redirectUri = getRedirectUri(host);

    const accessToken = await exchangeCodeForToken(
      code,
      clientId,
      clientSecret,
      redirectUri
    );
    const user = await fetchDiscordUser(accessToken);

    setSessionCookie(res, user, sessionSecret);
    res.redirect(302, "/");
  } catch (err) {
    console.error("Discord callback error:", err);
    res.redirect(302, "/?error=auth_failed");
  }
}
