import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getLeagueSettings,
  saveLeagueSettings,
  type LeagueSettingsPayload,
} from "lms-lib/lms/leagueConfig";
import { LEAGUE_WEB_LOOKUP } from "lms-lib/lms/leagueWebLookup";
import { getSessionFromRequest } from "lms-lib/session";

function requireUser(req: VercelRequest, res: VercelResponse) {
  const sessionSecret =
    process.env.SESSION_SECRET ?? process.env.VERCEL_SESSION_SECRET;
  if (!sessionSecret) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  const user = getSessionFromRequest(req, sessionSecret);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireUser(req, res);
  if (!user) return;

  const leagueId = typeof req.query.leagueId === "string" ? req.query.leagueId : "";
  if (!LEAGUE_WEB_LOOKUP[leagueId]) {
    return res.status(404).json({ error: "League not found" });
  }

  try {
    if (req.method === "GET") {
      const settings = await getLeagueSettings(leagueId);
      if (!settings) {
        return res.status(200).json({ settings: null, persisted: false });
      }
      return res.status(200).json({ settings, persisted: true });
    }

    if (req.method === "PUT") {
      const body = req.body as LeagueSettingsPayload;
      if (!body || typeof body.name !== "string") {
        return res.status(400).json({ error: "Invalid settings payload" });
      }

      const saved = await saveLeagueSettings(leagueId, {
        name: body.name,
        visibility: body.visibility ?? "public",
        description: body.description ?? "",
        timezone: body.timezone ?? "unspecified",
        serverRegion: body.serverRegion ?? "unspecified",
        logoUrl: body.logoUrl ?? null,
      });

      if (!saved) {
        return res.status(404).json({ error: "League not found in database" });
      }

      return res.status(200).json({ settings: saved, persisted: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("League settings error:", err);
    return res.status(500).json({ error: "Failed to process league settings" });
  }
}
