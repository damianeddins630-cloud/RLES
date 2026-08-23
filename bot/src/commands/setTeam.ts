import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { getOrCreateLeague, getOrCreateTeam } from "../lib/db.js";
import { prisma } from "../lib/db.js";

export const setTeamCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("set-team")
    .setDescription("Configure team conference or logo (admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption((opt) =>
      opt.setName("league").setDescription("League role").setRequired(true)
    )
    .addRoleOption((opt) =>
      opt.setName("team").setDescription("Team role").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("conference")
        .setDescription("Conference name (e.g. East, West)")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("logo_url")
        .setDescription("Direct URL to team logo image")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const leagueRole = interaction.options.getRole("league", true);
    const teamRole = interaction.options.getRole("team", true);
    const conference = interaction.options.getString("conference");
    const logoUrl = interaction.options.getString("logo_url");

    if (!conference && !logoUrl) {
      await interaction.reply({
        content: "Provide at least one of: conference, logo_url",
        ephemeral: true,
      });
      return;
    }

    const league = await getOrCreateLeague(leagueRole.id, leagueRole.name);
    const team = await getOrCreateTeam(league.id, teamRole.id, teamRole.name);

    await prisma.team.update({
      where: { id: team.id },
      data: {
        conference: conference ?? team.conference,
        logoUrl: logoUrl ?? team.logoUrl,
      },
    });

    await interaction.reply({
      content: `Updated **${team.name}**${conference ? ` — conference: ${conference}` : ""}${logoUrl ? ` — logo set` : ""}`,
      ephemeral: true,
    });
  },
};
