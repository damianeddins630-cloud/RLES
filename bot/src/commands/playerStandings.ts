import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { getOrCreateLeague, prisma } from "../lib/db.js";
import { buildLeaderboardEmbed } from "../lib/embeds.js";

export const playerStandingsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("player-standings")
    .setDescription("Show top 10 players overall in a league")
    .addRoleOption((opt) =>
      opt
        .setName("league")
        .setDescription("League role")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const leagueRole = interaction.options.getRole("league", true);
    const league = await getOrCreateLeague(
      interaction.guildId!,
      leagueRole.id,
      leagueRole.name
    );

    const players = await prisma.player.findMany({
      where: { leagueId: league.id },
      orderBy: [
        { goals: "desc" },
        { assists: "desc" },
        { score: "desc" },
      ],
      take: 10,
    });

    const lines = players.map((p, i) => {
      const rank = i + 1;
      const medal =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
      return `${medal} **${p.displayName}** — ${p.goals}G ${p.assists}A ${p.saves}S (${p.matchesPlayed} matches)`;
    });

    const embed = buildLeaderboardEmbed(
      `${league.name} — Top 10 Players`,
      lines,
      0x2563eb
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
