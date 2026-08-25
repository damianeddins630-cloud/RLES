import type { League, Prisma } from "@prisma/client";
import { prisma } from "./db.js";
import {
  DEFAULT_FRANCHISE_ROLES,
  DEFAULT_LEAGUE_SETTINGS,
  DEFAULT_TIER_CONFIGS,
  DEFAULT_TIER_SALARY,
  DEFAULT_TIERS,
} from "./leagueDefaults.js";
import { findLeagueForWebId } from "./leagueWebLookup.js";

export interface LeagueSettingsPayload {
  name: string;
  visibility: string;
  description: string;
  timezone: string;
  serverRegion: string;
  logoUrl: string | null;
}

export interface WebMember {
  id: string;
  displayName: string;
  discordUserId?: string;
  tierId: string;
  teamId?: string | null;
  franchiseRoleId?: string | null;
  trackerUrl: string;
  salary: number;
  signedUpAt?: string;
  fromRegistration?: boolean;
}

export interface WebAdminConfig {
  tiers: typeof DEFAULT_TIERS;
  tierConfigs: typeof DEFAULT_TIER_CONFIGS;
  franchiseRoles: typeof DEFAULT_FRANCHISE_ROLES;
  teams: Array<{
    id: string;
    name: string;
    shortLabel: string;
    tierId: string;
    logoUrl?: string | null;
  }>;
  manualMembers: WebMember[];
}

function parseWebConfig(raw: unknown): Omit<WebAdminConfig, "manualMembers"> {
  const cfg = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const tiers = Array.isArray(cfg.tiers) ? cfg.tiers : DEFAULT_TIERS;
  const tierConfigs = Array.isArray(cfg.tierConfigs)
    ? cfg.tierConfigs
    : DEFAULT_TIER_CONFIGS;
  const franchiseRoles = Array.isArray(cfg.franchiseRoles)
    ? cfg.franchiseRoles
    : DEFAULT_FRANCHISE_ROLES;
  const teams = Array.isArray(cfg.teams) ? cfg.teams : [];

  return {
    tiers: tiers as WebAdminConfig["tiers"],
    tierConfigs: tierConfigs as WebAdminConfig["tierConfigs"],
    franchiseRoles: franchiseRoles as WebAdminConfig["franchiseRoles"],
    teams: teams as WebAdminConfig["teams"],
  };
}

export function leagueToSettings(league: League): LeagueSettingsPayload {
  return {
    name: league.name,
    visibility: league.visibility ?? DEFAULT_LEAGUE_SETTINGS.visibility,
    description: league.description ?? "",
    timezone: league.timezone ?? DEFAULT_LEAGUE_SETTINGS.timezone,
    serverRegion: league.serverRegion ?? DEFAULT_LEAGUE_SETTINGS.serverRegion,
    logoUrl: league.logoUrl ?? null,
  };
}

export async function getLeagueSettings(webLeagueId: string): Promise<LeagueSettingsPayload | null> {
  const league = await findLeagueForWebId(webLeagueId);
  if (!league) return null;
  return leagueToSettings(league);
}

export async function saveLeagueSettings(
  webLeagueId: string,
  settings: LeagueSettingsPayload
): Promise<LeagueSettingsPayload | null> {
  const league = await findLeagueForWebId(webLeagueId);
  if (!league) return null;

  const updated = await prisma.league.update({
    where: { id: league.id },
    data: {
      name: settings.name.trim() || league.name,
      visibility: settings.visibility,
      description: settings.description,
      timezone: settings.timezone,
      serverRegion: settings.serverRegion,
      logoUrl: settings.logoUrl,
    },
  });

  return leagueToSettings(updated);
}

export async function getLeagueAdmin(webLeagueId: string) {
  const league = await findLeagueForWebId(webLeagueId);
  if (!league) return null;

  const webPart = parseWebConfig(league.webConfig);
  const rawConfig = (league.webConfig as Record<string, unknown> | null) ?? {};
  const manualMembers = Array.isArray(rawConfig.manualMembers)
    ? (rawConfig.manualMembers as WebMember[])
    : Array.isArray(rawConfig.members)
      ? (rawConfig.members as WebMember[]).filter((m) => !m.fromRegistration)
      : [];

  const defaultTierId = webPart.tiers[0]?.id ?? "premier";
  const defaultRoleId =
    webPart.franchiseRoles.find((r) => r.id === "player")?.id ??
    webPart.franchiseRoles[0]?.id ??
    "player";

  const players = await prisma.player.findMany({
    where: { leagueId: league.id },
    orderBy: { createdAt: "asc" },
  });

  const registeredMembers: WebMember[] = players.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    discordUserId: p.discordUserId,
    tierId: p.tierId ?? defaultTierId,
    teamId: p.webTeamId ?? null,
    franchiseRoleId: p.franchiseRoleId ?? defaultRoleId,
    trackerUrl: p.trackerUrl ?? "",
    salary: p.salary ?? 0,
    signedUpAt: p.createdAt.toISOString(),
    fromRegistration: true,
  }));

  const discordIds = new Set(registeredMembers.map((m) => m.discordUserId));
  const manual = manualMembers.filter(
    (m) => !m.discordUserId || !discordIds.has(m.discordUserId)
  );

  return {
    tiers: webPart.tiers,
    tierConfigs: mergeTierConfigs(webPart.tiers, webPart.tierConfigs),
    franchiseRoles: webPart.franchiseRoles,
    teams: webPart.teams,
    members: [...registeredMembers, ...manual],
  };
}

function mergeTierConfigs(
  tiers: WebAdminConfig["tiers"],
  tierConfigs: WebAdminConfig["tierConfigs"]
) {
  return tiers.map((tier) => {
    const existing = tierConfigs.find((c) => c.tierId === tier.id);
    return existing ?? { tierId: tier.id, ...DEFAULT_TIER_SALARY };
  });
}

export async function saveLeagueAdmin(
  webLeagueId: string,
  data: {
    tiers: WebAdminConfig["tiers"];
    tierConfigs: WebAdminConfig["tierConfigs"];
    franchiseRoles: WebAdminConfig["franchiseRoles"];
    teams: WebAdminConfig["teams"];
    members: WebMember[];
  }
) {
  const league = await findLeagueForWebId(webLeagueId);
  if (!league) return null;

  const manualMembers = data.members.filter((m) => !m.fromRegistration);

  for (const member of data.members) {
    if (!member.fromRegistration && !member.discordUserId) continue;

    if (member.fromRegistration || member.discordUserId) {
      const discordUserId = member.discordUserId;
      if (!discordUserId) continue;

      await prisma.player.updateMany({
        where: { leagueId: league.id, discordUserId },
        data: {
          displayName: member.displayName,
          tierId: member.tierId,
          franchiseRoleId: member.franchiseRoleId ?? null,
          webTeamId: member.teamId ?? null,
          trackerUrl: member.trackerUrl ?? "",
          salary: member.salary ?? 0,
        },
      });
    }
  }

  await prisma.league.update({
    where: { id: league.id },
    data: {
      webConfig: JSON.parse(
        JSON.stringify({
          tiers: data.tiers,
          tierConfigs: data.tierConfigs,
          franchiseRoles: data.franchiseRoles,
          teams: data.teams,
          manualMembers,
        })
      ) as Prisma.InputJsonValue,
    },
  });

  return getLeagueAdmin(webLeagueId);
}
