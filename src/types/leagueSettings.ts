export type LeagueVisibility = "private" | "public";
export type LeagueTimezone = "unspecified" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Europe/London" | "Europe/Paris";
export type LeagueServerRegion = "unspecified" | "us-east" | "us-west" | "us-central" | "europe" | "asia";

export interface LeagueSettings {
  name: string;
  visibility: LeagueVisibility;
  description: string;
  timezone: LeagueTimezone;
  serverRegion: LeagueServerRegion;
  logoUrl: string | null;
}

export const DEFAULT_LEAGUE_SETTINGS: LeagueSettings = {
  name: "Rocket League Elite Series",
  visibility: "private",
  description: "",
  timezone: "unspecified",
  serverRegion: "unspecified",
  logoUrl: null,
};
