import type { LeagueTier, TierSalaryConfig } from "../types/leagueAdmin";

export const DEFAULT_TIERS: LeagueTier[] = [
  { id: "premier", name: "Premier", order: 0 },
  { id: "master", name: "Master", order: 1 },
  { id: "challenger", name: "Challenger", order: 2 },
  { id: "open", name: "Open", order: 3 },
];

export const DEFAULT_TIER_CONFIGS: TierSalaryConfig[] = [
  { tierId: "premier", salaryMin: 8, salaryMax: 12, teamCap: 48 },
  { tierId: "master", salaryMin: 5, salaryMax: 9, teamCap: 40 },
  { tierId: "challenger", salaryMin: 3, salaryMax: 6, teamCap: 32 },
  { tierId: "open", salaryMin: 1, salaryMax: 4, teamCap: 24 },
];
