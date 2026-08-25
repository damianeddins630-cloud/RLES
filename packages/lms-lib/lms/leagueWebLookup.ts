import { prisma } from "./db.js";

export const LEAGUE_WEB_LOOKUP: Record<
  string,
  { nameContains: string; roleEnv?: string }
> = {
  rles: { nameContains: "Rocket League Elite", roleEnv: "RLES_DISCORD_ROLE_ID" },
};

export async function findLeagueForWebId(leagueId: string) {
  const lookup = LEAGUE_WEB_LOOKUP[leagueId];
  if (!lookup) return null;

  const roleId = lookup.roleEnv ? process.env[lookup.roleEnv] : undefined;

  let league = roleId
    ? await prisma.league.findUnique({ where: { discordRoleId: roleId } })
    : null;

  if (!league) {
    league = await prisma.league.findFirst({
      where: { name: { contains: lookup.nameContains, mode: "insensitive" } },
    });
  }

  return league;
}
