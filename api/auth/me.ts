import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAvatarUrl } from "../_lib/discord-oauth";
import { getSessionFromRequest } from "../_lib/session";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionSecret =
      process.env.SESSION_SECRET ??
      process.env.VERCEL_SESSION_SECRET;
    if (!sessionSecret) {
      return res.status(200).json({ user: null });
    }
    const user = getSessionFromRequest(req, sessionSecret);

    if (!user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        ...user,
        displayName: user.globalName ?? user.username,
        avatarUrl: getAvatarUrl(user),
      },
    });
  } catch (err) {
    console.error("Session check error:", err);
    return res.status(500).json({ error: "Server configuration error" });
  }
}
