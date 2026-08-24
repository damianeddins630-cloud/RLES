import type { Team } from "@prisma/client";
import type { ApiEmbed, MessagePayload } from "../discord/api.js";

interface MatchReportOptions {
  stage: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  ballchasingGroupUrl?: string | null;
}

export function buildLeaderboardEmbed(
  title: string,
  lines: string[],
  color = 0x2563eb
): ApiEmbed {
  return {
    title,
    description: lines.length > 0 ? lines.join("\n") : "No data yet.",
    color,
  };
}

export function buildMatchReportPayload(
  options: MatchReportOptions
): MessagePayload {
  const { stage, homeTeam, awayTeam, homeScore, awayScore, ballchasingGroupUrl } =
    options;

  const embed: ApiEmbed = {
    title: `${stage}: ${homeTeam.name} vs ${awayTeam.name}`,
    fields: [
      {
        name: "Match Summary:",
        value: `**${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name}**`,
      },
    ],
    color: 0x2563eb,
  };

  const logoUrl = homeTeam.logoUrl ?? awayTeam.logoUrl;
  if (logoUrl) {
    embed.thumbnail = { url: logoUrl };
  }

  const payload: MessagePayload = { embeds: [embed] };

  if (ballchasingGroupUrl) {
    payload.components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "Ballchasing Group",
            url: ballchasingGroupUrl,
          },
        ],
      },
    ];
  }

  return payload;
}
