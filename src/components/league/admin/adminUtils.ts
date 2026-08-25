import type { FranchiseRole, LeagueTier } from "../../../types/leagueAdmin";

export function tierName(tiers: LeagueTier[], tierId: string): string {
  return tiers.find((t) => t.id === tierId)?.name ?? tierId;
}

export function franchiseRoleName(roles: FranchiseRole[], roleId: string | null | undefined): string {
  if (!roleId) return "—";
  return roles.find((r) => r.id === roleId)?.name ?? roleId;
}
