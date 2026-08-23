import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getOrCreateLeague(discordRoleId: string, name: string) {
  return prisma.league.upsert({
    where: { discordRoleId },
    create: { discordRoleId, name },
    update: { name },
  });
}

export async function getOrCreateTeam(
  leagueId: string,
  discordRoleId: string,
  name: string
) {
  return prisma.team.upsert({
    where: { discordRoleId },
    create: { leagueId, discordRoleId, name },
    update: { name, leagueId },
  });
}
