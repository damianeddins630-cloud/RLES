import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { prisma } from "../lib/db.js";
import { buildLeaderboardEmbed } from "../lib/embeds.js";
import { requireGuild } from "../lib/guild.js";

export const leaguesCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("leagues")
    .setDescription("List all leagues registered on League Master System in this server"),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = requireGuild(interaction);
    if (!guildId) return;

    await interaction.deferReply();

    const leagues = await prisma.league.findMany({
      where: { discordGuildId: guildId },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { teams: true, players: true, matches: true } },
      },
    });

    if (leagues.length === 0) {
      await interaction.editReply({
        embeds: [
          buildLeaderboardEmbed(
            "League Master System — Leagues",
            [
              "No leagues registered in this server yet.",
              "",
              "Create a Discord role for each league, then use any command with that role to register it automatically.",
            ],
            0x2563eb
          ),
        ],
      });
      return;
    }

    const lines = leagues.map((league, i) => {
      const { teams, players, matches } = league._count;
      return `${i + 1}. **${league.name}** — ${teams} teams · ${players} players · ${matches} matches`;
    });

    const embed = buildLeaderboardEmbed(
      "League Master System — Leagues on this server",
      lines,
      0x2563eb
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
