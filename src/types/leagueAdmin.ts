/** Competitive tier within a franchise league (e.g. Premier, Master). */
export interface LeagueTier {
  id: string;
  name: string;
  order: number;
}

/** Salary band and team salary cap for one tier. */
export interface TierSalaryConfig {
  tierId: string;
  salaryMin: number;
  salaryMax: number;
  /** Maximum total salary for a team roster in this tier. */
  teamCap: number;
}

export interface LeagueTeam {
  id: string;
  name: string;
  shortLabel: string;
  tierId: string;
  logoUrl?: string | null;
}

/** Anyone registered in the league — staff or roster. */
export interface LeagueMember {
  id: string;
  displayName: string;
  discordUserId?: string;
  tierId: string;
  teamId?: string | null;
  trackerUrl: string;
  /** Individual player salary for cap calculations. */
  salary: number;
}

/** Roster player on a team (linked member). */
export interface LeaguePlayer {
  id: string;
  memberId: string;
  teamId: string;
  tierId: string;
  trackerUrl: string;
  salary: number;
}

export interface LeagueAdminData {
  tiers: LeagueTier[];
  tierConfigs: TierSalaryConfig[];
  teams: LeagueTeam[];
  members: LeagueMember[];
  players: LeaguePlayer[];
}

export type AdminSection = "tiers" | "teams" | "members" | "players";
