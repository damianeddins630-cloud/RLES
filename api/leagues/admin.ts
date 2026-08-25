import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getLeagueAdmin, saveLeagueAdmin } from "lms-lib/lms/leagueConfig";
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
      const admin = await getLeagueAdmin(leagueId);
      if (!admin) {
        return res.status(200).json({ admin: null, persisted: false });
      }
      return res.status(200).json({ admin, persisted: true });
    }

    if (req.method === "PUT") {
      const body = req.body as {
        tiers?: unknown;
        tierConfigs?: unknown;
        franchiseRoles?: unknown;
        teams?: unknown;
        members?: unknown;
      };

      if (!body?.tiers || !body?.members) {
        return res.status(400).json({ error: "Invalid admin payload" });
      }

      const saved = await saveLeagueAdmin(leagueId, {
        tiers: body.tiers as Parameters<typeof saveLeagueAdmin>[1]["tiers"],
        tierConfigs: body.tierConfigs as Parameters<typeof saveLeagueAdmin>[1]["tierConfigs"],
        franchiseRoles: body.franchiseRoles as Parameters<typeof saveLeagueAdmin>[1]["franchiseRoles"],
        teams: body.teams as Parameters<typeof saveLeagueAdmin>[1]["teams"],
        members: body.members as Parameters<typeof saveLeagueAdmin>[1]["members"],
      });

      if (!saved) {
        return res.status(404).json({ error: "League not found in database" });
      }

      return res.status(200).json({ admin: saved, persisted: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("League admin error:", err);
    return res.status(500).json({ error: "Failed to process league admin data" });
  }
}
