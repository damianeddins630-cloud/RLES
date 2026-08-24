import type { LeagueTier } from "../../../types/leagueAdmin";

export function tierName(tiers: LeagueTier[], tierId: string): string {
  return tiers.find((t) => t.id === tierId)?.name ?? tierId;
}
