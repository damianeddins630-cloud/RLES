import { leaguesCommand } from "./leagues.js";
import { reportCommand } from "./report.js";
import { playerStandingsCommand } from "./playerStandings.js";
import { playerStatsCommand } from "./playerStats.js";
import { teamStandingsCommand } from "./teamStandings.js";
import { setTeamCommand } from "./setTeam.js";
import { registerPlayerCommand } from "./registerPlayer.js";
import type { BotCommand } from "../types/command.js";

export const commands: BotCommand[] = [
  leaguesCommand,
  reportCommand,
  playerStandingsCommand,
  playerStatsCommand,
  teamStandingsCommand,
  setTeamCommand,
  registerPlayerCommand,
];
