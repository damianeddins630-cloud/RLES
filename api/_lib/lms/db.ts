import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

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
