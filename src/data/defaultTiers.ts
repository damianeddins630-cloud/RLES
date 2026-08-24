import type { LeagueTier, TierSalaryConfig } from "../types/leagueAdmin";

export const DEFAULT_TIERS: LeagueTier[] = [
  { id: "premier", name: "Premier", order: 0, logoUrl: null },
  { id: "master", name: "Master", order: 1, logoUrl: null },
  { id: "challenger", name: "Challenger", order: 2, logoUrl: null },
  { id: "open", name: "Open", order: 3, logoUrl: null },
];

export const DEFAULT_TIER_SALARY = {
  salaryMin: 1,
  salaryMax: 10,
  teamCap: 30,
};

export const DEFAULT_TIER_CONFIGS: TierSalaryConfig[] = [
  { tierId: "premier", salaryMin: 8, salaryMax: 12, teamCap: 48 },
  { tierId: "master", salaryMin: 5, salaryMax: 9, teamCap: 40 },
  { tierId: "challenger", salaryMin: 3, salaryMax: 6, teamCap: 32 },
  { tierId: "open", salaryMin: 1, salaryMax: 4, teamCap: 24 },
];
