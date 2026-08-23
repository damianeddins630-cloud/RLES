import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { getOrCreateLeague, prisma } from "../lib/db.js";
import { buildLeaderboardEmbed } from "../lib/embeds.js";

export const teamStandingsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("team-standings")
    .setDescription("Show team standings by conference for a league")
    .addRoleOption((opt) =>
      opt
        .setName("league")
        .setDescription("League role")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const leagueRole = interaction.options.getRole("league", true);
    const league = await getOrCreateLeague(leagueRole.id, leagueRole.name);

    const teams = await prisma.team.findMany({
      where: { leagueId: league.id },
      orderBy: [
        { wins: "desc" },
        { losses: "asc" },
        { name: "asc" },
      ],
    });

    if (teams.length === 0) {
      await interaction.editReply({
        embeds: [
          buildLeaderboardEmbed(
            `${league.name} — Team Standings`,
            ["No teams registered yet. Report matches to build standings."],
            0x22c55e
          ),
        ],
      });
      return;
    }

    const byConference = new Map<string, typeof teams>();

    for (const team of teams) {
      const conf = team.conference ?? "Overall";
      const list = byConference.get(conf) ?? [];
      list.push(team);
      byConference.set(conf, list);
    }

    const sections: string[] = [];

    for (const [conference, confTeams] of byConference) {
      sections.push(`**${conference}**`);
      confTeams.forEach((team, i) => {
        const rank = i + 1;
        sections.push(
          `${rank}. **${team.name}** — ${team.wins}W-${team.losses}L`
        );
      });
      sections.push("");
    }

    const embed = buildLeaderboardEmbed(
      `${league.name} — Team Standings`,
      sections,
      0x22c55e
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
