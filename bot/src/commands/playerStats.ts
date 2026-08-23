import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { getOrCreateLeague, prisma } from "../lib/db.js";
import { buildLeaderboardEmbed } from "../lib/embeds.js";
import {
  STAT_CATEGORY_CHOICES,
  STAT_CATEGORIES,
  isStatCategory,
} from "../types/stats.js";

export const playerStatsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("player-stats")
    .setDescription("Show top 10 players for a stat category in a league")
    .addRoleOption((opt) =>
      opt
        .setName("league")
        .setDescription("League role")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("category")
        .setDescription("Stat category")
        .setRequired(true)
        .addChoices(...STAT_CATEGORY_CHOICES)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const leagueRole = interaction.options.getRole("league", true);
    const categoryRaw = interaction.options.getString("category", true);

    if (!isStatCategory(categoryRaw)) {
      await interaction.editReply("Invalid stat category.");
      return;
    }

    const league = await getOrCreateLeague(
      interaction.guildId!,
      leagueRole.id,
      leagueRole.name
    );
    const { label, field } = STAT_CATEGORIES[categoryRaw];

    const players = await prisma.player.findMany({
      where: { leagueId: league.id },
      orderBy: { [field]: "desc" },
      take: 10,
    });

    const lines = players.map((p, i) => {
      const rank = i + 1;
      const medal =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
      const value = p[field];
      return `${medal} **${p.displayName}** — ${value}`;
    });

    const embed = buildLeaderboardEmbed(
      `${league.name} — Top 10 ${label}`,
      lines,
      0x3b82f6
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
