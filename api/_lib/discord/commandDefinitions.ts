/** Slash command definitions for Discord REST API registration */

const MANAGE_MESSAGES = "8192";
const MANAGE_GUILD = "32";

export const commandDefinitions = [
  {
    name: "leagues",
    description: "List all leagues registered on League Master System in this server",
    type: 1,
  },
  {
    name: "report",
    description: "Report a Rocket League match on League Master System",
    type: 1,
    default_member_permissions: MANAGE_MESSAGES,
    options: [
      {
        name: "league",
        description: "League role — each league on the platform has its own role",
        type: 8,
        required: true,
      },
      {
        name: "home_team",
        description: "Home team role",
        type: 8,
        required: true,
      },
      {
        name: "away_team",
        description: "Away team role",
        type: 8,
        required: true,
      },
      {
        name: "home_score",
        description: "Home team score",
        type: 4,
        required: true,
        min_value: 0,
      },
      {
        name: "away_score",
        description: "Away team score",
        type: 4,
        required: true,
        min_value: 0,
      },
      {
        name: "stage",
        description: "Match stage (e.g. Semifinals, Finals, Week 3)",
        type: 3,
        required: false,
      },
      {
        name: "replays",
        description: "Ballchasing replay URLs (space or comma separated)",
        type: 3,
        required: false,
      },
      {
        name: "ballchasing_group",
        description: "Ballchasing group URL for the match replays button",
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: "player-standings",
    description: "Show top 10 players overall in a league",
    type: 1,
    options: [
      {
        name: "league",
        description: "League role",
        type: 8,
        required: true,
      },
    ],
  },
  {
    name: "player-stats",
    description: "Show top 10 players for a stat category in a league",
    type: 1,
    options: [
      {
        name: "league",
        description: "League role",
        type: 8,
        required: true,
      },
      {
        name: "category",
        description: "Stat category",
        type: 3,
        required: true,
        choices: [
          { name: "Goals", value: "goals" },
          { name: "Assists", value: "assists" },
          { name: "Saves", value: "saves" },
          { name: "Shots", value: "shots" },
          { name: "Demos", value: "demos" },
          { name: "Score", value: "score" },
          { name: "Matches Played", value: "matches" },
        ],
      },
    ],
  },
  {
    name: "team-standings",
    description: "Show team standings by conference for a league",
    type: 1,
    options: [
      {
        name: "league",
        description: "League role",
        type: 8,
        required: true,
      },
    ],
  },
  {
    name: "set-team",
    description: "Configure team conference or logo (admin)",
    type: 1,
    default_member_permissions: MANAGE_GUILD,
    options: [
      { name: "league", description: "League role", type: 8, required: true },
      { name: "team", description: "Team role", type: 8, required: true },
      {
        name: "conference",
        description: "Conference name (e.g. East, West)",
        type: 3,
        required: false,
      },
      {
        name: "logo_url",
        description: "Direct URL to team logo image",
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: "register-player",
    description: "Register a player in a league for stat tracking",
    type: 1,
    options: [
      { name: "league", description: "League role", type: 8, required: true },
      {
        name: "player",
        description: "Discord user to register",
        type: 6,
        required: true,
      },
    ],
  },
];
