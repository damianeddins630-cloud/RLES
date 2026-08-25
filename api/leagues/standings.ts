import type { VercelRequest, VercelResponse } from "@vercel/node";
import { findLeagueForWebId, LEAGUE_WEB_LOOKUP } from "lms-lib/lms/leagueWebLookup";
import { STAT_CATEGORIES, type StatCategory } from "lms-lib/lms/stats";
import { getSessionFromRequest } from "lms-lib/session";
import { prisma } from "lms-lib/lms/db";

function perMatch(total: number, matches: number): number {
  if (matches <= 0) return 0;
  return Math.round((total / matches) * 100) / 100;
}

function buildLeaderboard(
  players: Array<{
    id: string;
    displayName: string;
    matchesPlayed: number;
    goals: number;
    assists: number;
    saves: number;
    shots: number;
    demos: number;
    score: number;
  }>,
  field: StatCategory
) {
  const sorted = [...players].sort((a, b) => b[field] - a[field]);
  return sorted.map((p, i) => ({
    rank: i + 1,
    playerId: p.id,
    displayName: p.displayName,
    value: p[field],
    matchesPlayed: p.matchesPlayed,
  }));
}

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
      return res.status(200).json({
        leagueName: "",
        teams: [],
        conferences: [],
        players: [],
        leaderboards: {},
        updatedAt: new Date().toISOString(),
      });
    }

    const teams = await prisma.team.findMany({
      where: { leagueId: league.id },
      orderBy: [{ wins: "desc" }, { losses: "asc" }, { name: "asc" }],
    });

    const players = await prisma.player.findMany({
      where: { leagueId: league.id },
    });

    const overallSorted = [...players].sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return b.score - a.score;
    });

    const playerRows = overallSorted.map((p, index) => ({
      id: p.id,
      discordUserId: p.discordUserId,
      displayName: p.displayName,
      goals: p.goals,
      assists: p.assists,
      saves: p.saves,
      shots: p.shots,
      demos: p.demos,
      score: p.score,
      matchesPlayed: p.matchesPlayed,
      goalsPerMatch: perMatch(p.goals, p.matchesPlayed),
      assistsPerMatch: perMatch(p.assists, p.matchesPlayed),
      savesPerMatch: perMatch(p.saves, p.matchesPlayed),
      shotsPerMatch: perMatch(p.shots, p.matchesPlayed),
      demosPerMatch: perMatch(p.demos, p.matchesPlayed),
      scorePerMatch: perMatch(p.score, p.matchesPlayed),
      overallRank: index + 1,
    }));

    const teamRows = teams.map((t) => {
      const games = t.wins + t.losses;
      return {
        id: t.id,
        name: t.name,
        conference: t.conference,
        logoUrl: t.logoUrl,
        wins: t.wins,
        losses: t.losses,
        gamesPlayed: games,
        winPct: games > 0 ? Math.round((t.wins / games) * 1000) / 10 : 0,
      };
    });

    const conferences = [
      ...new Set(teamRows.map((t) => t.conference ?? "Overall")),
    ].sort((a, b) => {
      if (a === "Overall") return -1;
      if (b === "Overall") return 1;
      return a.localeCompare(b);
    });

    const leaderboards: Record<string, unknown> = {};
    for (const key of Object.keys(STAT_CATEGORIES) as StatCategory[]) {
      leaderboards[key] = buildLeaderboard(players, key);
    }

    return res.status(200).json({
      leagueName: league.name,
      teams: teamRows,
      conferences,
      players: playerRows,
      leaderboards,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Standings fetch error:", err);
    return res.status(500).json({ error: "Failed to load standings" });
  }
}
