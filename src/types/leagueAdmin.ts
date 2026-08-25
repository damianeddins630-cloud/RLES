/** Competitive tier within a franchise league (e.g. Premier, Master). */
export interface LeagueTier {
  id: string;
  name: string;
  order: number;
  logoUrl?: string | null;
}

/** Salary band and team salary cap for one tier. */
export interface TierSalaryConfig {
  tierId: string;
  salaryMin: number;
  salaryMax: number;
  /** Maximum total salary for a team roster in this tier. */
  teamCap: number;
}

/** Franchise staff / roster role (Owner, GM, Player, etc.). */
export interface FranchiseRole {
  id: string;
  name: string;
  order: number;
}

export interface LeagueTeam {
  id: string;
  name: string;
  shortLabel: string;
  tierId: string;
  logoUrl?: string | null;
}

/**
 * Signed-up league member (same as player roster entry).
 * Populated from Discord registration + admin controls.
 */
export interface LeagueMember {
  id: string;
  displayName: string;
  discordUserId?: string;
  tierId: string;
  teamId?: string | null;
  franchiseRoleId?: string | null;
  trackerUrl: string;
  salary: number;
  /** When they signed up / were registered */
  signedUpAt?: string;
  /** From Discord registration — admin fields still editable */
  fromRegistration?: boolean;
}

export interface LeagueAdminData {
  tiers: LeagueTier[];
  tierConfigs: TierSalaryConfig[];
  franchiseRoles: FranchiseRole[];
  teams: LeagueTeam[];
  members: LeagueMember[];
}

export type AdminSection = "tiers" | "roles" | "teams" | "members";

export interface LeagueRegistration {
  discordUserId: string;
  displayName: string;
  signedUpAt: string;
}
