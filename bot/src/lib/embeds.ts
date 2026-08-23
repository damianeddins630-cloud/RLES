import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import type { Team } from "@prisma/client";

interface MatchReportEmbedOptions {
  stage: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  ballchasingGroupUrl?: string | null;
}

export function buildMatchReportEmbed(options: MatchReportEmbedOptions) {
  const { stage, homeTeam, awayTeam, homeScore, awayScore, ballchasingGroupUrl } =
    options;

  const title = `${stage}: ${homeTeam.name} vs ${awayTeam.name}`;
  const summary = `**${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name}**`;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .addFields({ name: "Match Summary:", value: summary })
    .setColor(0x2563eb);

  const logoUrl = homeTeam.logoUrl ?? awayTeam.logoUrl;
  if (logoUrl) {
    embed.setThumbnail(logoUrl);
  }

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (ballchasingGroupUrl) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Ballchasing Group")
        .setStyle(ButtonStyle.Link)
        .setURL(ballchasingGroupUrl)
    );
    components.push(row);
  }

  return { embed, components };
}

export function buildLeaderboardEmbed(
  title: string,
  lines: string[],
  color = 0x3b82f6
) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(lines.length > 0 ? lines.join("\n") : "No data yet.")
    .setColor(color);

  return embed;
}
