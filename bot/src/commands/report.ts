import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { getOrCreateLeague, getOrCreateTeam, prisma } from "../lib/db.js";
import { buildMatchReportEmbed } from "../lib/embeds.js";

function parseReplayUrls(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const reportCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Report a Rocket League match on League Master System")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addRoleOption((opt) =>
      opt
        .setName("league")
        .setDescription("League role — each league on the platform has its own role")
        .setRequired(true)
    )
    .addRoleOption((opt) =>
      opt
        .setName("home_team")
        .setDescription("Home team role")
        .setRequired(true)
    )
    .addRoleOption((opt) =>
      opt
        .setName("away_team")
        .setDescription("Away team role")
        .setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("home_score")
        .setDescription("Home team score")
        .setRequired(true)
        .setMinValue(0)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("away_score")
        .setDescription("Away team score")
        .setRequired(true)
        .setMinValue(0)
    )
    .addStringOption((opt) =>
      opt
        .setName("stage")
        .setDescription("Match stage (e.g. Semifinals, Finals, Week 3)")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("replays")
        .setDescription("Ballchasing replay URLs (space or comma separated)")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("ballchasing_group")
        .setDescription("Ballchasing group URL for the match replays button")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.editReply("This command can only be used in a server.");
      return;
    }

    const leagueRole = interaction.options.getRole("league", true);
    const homeRole = interaction.options.getRole("home_team", true);
    const awayRole = interaction.options.getRole("away_team", true);
    const homeScore = interaction.options.getInteger("home_score", true);
    const awayScore = interaction.options.getInteger("away_score", true);
    const stage =
      interaction.options.getString("stage") ?? "Match";
    const replaysRaw = interaction.options.getString("replays") ?? "";
    const ballchasingGroup =
      interaction.options.getString("ballchasing_group") ?? null;

    if (homeRole.id === awayRole.id) {
      await interaction.editReply("Home and away teams must be different.");
      return;
    }

    const league = await getOrCreateLeague(
      guildId,
      leagueRole.id,
      leagueRole.name
    );
    const homeTeam = await getOrCreateTeam(league.id, homeRole.id, homeRole.name);
    const awayTeam = await getOrCreateTeam(league.id, awayRole.id, awayRole.name);

    const replayUrls = parseReplayUrls(replaysRaw);

    const match = await prisma.match.create({
      data: {
        leagueId: league.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore,
        awayScore,
        stage,
        replayUrls: JSON.stringify(replayUrls),
        ballchasingGroupUrl: ballchasingGroup,
        reportedByUserId: interaction.user.id,
      },
    });

    // Update team W/L records
    if (homeScore > awayScore) {
      await prisma.team.update({
        where: { id: homeTeam.id },
        data: { wins: { increment: 1 } },
      });
      await prisma.team.update({
        where: { id: awayTeam.id },
        data: { losses: { increment: 1 } },
      });
    } else if (awayScore > homeScore) {
      await prisma.team.update({
        where: { id: awayTeam.id },
        data: { wins: { increment: 1 } },
      });
      await prisma.team.update({
        where: { id: homeTeam.id },
        data: { losses: { increment: 1 } },
      });
    }

    const { embed, components } = buildMatchReportEmbed({
      stage,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      ballchasingGroupUrl: ballchasingGroup,
    });

    const mentionLine = `<@&${homeRole.id}> <@&${awayRole.id}>`;

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased() || channel.isDMBased()) {
      await interaction.editReply({
        content: "Match saved, but could not post to this channel type.",
      });
      return;
    }

    const channelMessage = await channel.send({
      content: mentionLine,
      embeds: [embed],
      components,
    });

    if (channelMessage) {
      await prisma.match.update({
        where: { id: match.id },
        data: { discordMessageId: channelMessage.id },
      });
    }

    await interaction.editReply({
      content: "Match reported successfully.",
    });
  },
};
