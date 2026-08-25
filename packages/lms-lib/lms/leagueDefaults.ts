export const DEFAULT_TIERS = [
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

export const DEFAULT_TIER_CONFIGS = [
  { tierId: "premier", salaryMin: 8, salaryMax: 12, teamCap: 48 },
  { tierId: "master", salaryMin: 5, salaryMax: 9, teamCap: 40 },
  { tierId: "challenger", salaryMin: 3, salaryMax: 6, teamCap: 32 },
  { tierId: "open", salaryMin: 1, salaryMax: 4, teamCap: 24 },
];

export const DEFAULT_FRANCHISE_ROLES = [
  { id: "owner", name: "Franchise Owner", order: 0 },
  { id: "gm", name: "General Manager", order: 1 },
  { id: "manager", name: "Manager", order: 2 },
  { id: "player", name: "Player", order: 3 },
];

export const DEFAULT_LEAGUE_SETTINGS = {
  name: "Rocket League Elite Series",
  visibility: "public" as const,
  description: "",
  timezone: "unspecified",
  serverRegion: "unspecified",
  logoUrl: null as string | null,
};
