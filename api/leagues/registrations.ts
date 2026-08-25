import type { VercelRequest, VercelResponse } from "@vercel/node";
import { findLeagueForWebId, LEAGUE_WEB_LOOKUP } from "lms-lib/lms/leagueWebLookup";
import { prisma } from "lms-lib/lms/db";
import { getSessionFromRequest } from "lms-lib/session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionSecret =
    process.env.SESSION_SECRET ?? process.env.VERCEL_SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = getSessionFromRequest(req, sessionSecret);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const leagueId = typeof req.query.leagueId === "string" ? req.query.leagueId : "";
  if (!LEAGUE_WEB_LOOKUP[leagueId]) {
    return res.status(404).json({ error: "League not found" });
  }

  try {
    const league = await findLeagueForWebId(leagueId);

    if (!league) {
      return res.status(200).json({ registrations: [] });
    }

    const players = await prisma.player.findMany({
      where: { leagueId: league.id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      registrations: players.map((p) => ({
        discordUserId: p.discordUserId,
        displayName: p.displayName,
        signedUpAt: p.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Registrations fetch error:", err);
    return res.status(500).json({ error: "Failed to load registrations" });
  }
}
