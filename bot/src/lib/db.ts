import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getOrCreateLeague(
  discordGuildId: string,
  discordRoleId: string,
  name: string
) {
  return prisma.league.upsert({
    where: { discordRoleId },
    create: { discordGuildId, discordRoleId, name },
    update: { name, discordGuildId },
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
