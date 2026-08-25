export const STAT_CATEGORIES = [
  { key: "goals", label: "Goals", short: "G" },
  { key: "assists", label: "Assists", short: "A" },
  { key: "saves", label: "Saves", short: "SV" },
  { key: "shots", label: "Shots", short: "SH" },
  { key: "demos", label: "Demos", short: "DM" },
  { key: "score", label: "Score", short: "PTS" },
  { key: "matchesPlayed", label: "Matches", short: "GP" },
] as const;

export type StatKey = (typeof STAT_CATEGORIES)[number]["key"];

export interface TeamStandingRow {
  id: string;
  name: string;
  conference: string | null;
  logoUrl: string | null;
  wins: number;
  losses: number;
  winPct: number;
  gamesPlayed: number;
}

export interface PlayerStatRow {
  id: string;
  discordUserId: string;
  displayName: string;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
  demos: number;
  score: number;
  matchesPlayed: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  savesPerMatch: number;
  shotsPerMatch: number;
  demosPerMatch: number;
  scorePerMatch: number;
  overallRank: number;
}

export interface LeaderboardRow {
  rank: number;
  playerId: string;
  displayName: string;
  value: number;
  matchesPlayed: number;
}

export interface LeagueStandingsData {
  leagueName: string;
  teams: TeamStandingRow[];
  conferences: string[];
  players: PlayerStatRow[];
  leaderboards: Record<StatKey, LeaderboardRow[]>;
  updatedAt: string;
}
