import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL
  );
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

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
