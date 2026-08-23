import {
  buildContext,
  editDeferredInteraction,
  fetchGuildRoleNames,
  sendChannelMessage,
  type InteractionContext,
} from "../discord/api.js";
import {
  getOptionInt,
  getOptionRoleId,
  getOptionString,
  getOptionUserId,
  getInteractionUser,
} from "../discord/types.js";
import { getOrCreateLeague, getOrCreateTeam, prisma } from "../db.js";
import { buildLeaderboardEmbed, buildMatchReportPayload } from "../embeds.js";
import { isStatCategory, STAT_CATEGORIES } from "../stats.js";

function parseReplayUrls(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function resolveRoleName(
  guildId: string,
  roleId: string,
  roleNames: Map<string, string>
): Promise<string> {
  return roleNames.get(roleId) ?? roleId;
}

export async function handleReport(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId, channelId, userId } = ctx;

  if (!guildId || !channelId) {
    await editDeferredInteraction(applicationId, token, {
      content: "This command can only be used in a server channel.",
    });
    return;
  }

  const leagueRoleId = getOptionRoleId(ctx.interaction, "league");
  const homeRoleId = getOptionRoleId(ctx.interaction, "home_team");
  const awayRoleId = getOptionRoleId(ctx.interaction, "away_team");
  const homeScore = getOptionInt(ctx.interaction, "home_score");
  const awayScore = getOptionInt(ctx.interaction, "away_score");

  if (!leagueRoleId || !homeRoleId || !awayRoleId || homeScore === undefined || awayScore === undefined) {
    await editDeferredInteraction(applicationId, token, {
      content: "Missing required options.",
    });
    return;
  }

  if (homeRoleId === awayRoleId) {
    await editDeferredInteraction(applicationId, token, {
      content: "Home and away teams must be different.",
    });
    return;
  }

  const stage = getOptionString(ctx.interaction, "stage") ?? "Match";
  const replaysRaw = getOptionString(ctx.interaction, "replays") ?? "";
  const ballchasingGroup = getOptionString(ctx.interaction, "ballchasing_group") ?? null;

  const roleNames = await fetchGuildRoleNames(guildId, [
    leagueRoleId,
    homeRoleId,
    awayRoleId,
  ]);

  const leagueName = await resolveRoleName(guildId, leagueRoleId, roleNames);
  const homeName = await resolveRoleName(guildId, homeRoleId, roleNames);
  const awayName = await resolveRoleName(guildId, awayRoleId, roleNames);

  const league = await getOrCreateLeague(guildId, leagueRoleId, leagueName);
  const homeTeam = await getOrCreateTeam(league.id, homeRoleId, homeName);
  const awayTeam = await getOrCreateTeam(league.id, awayRoleId, awayName);
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
      reportedByUserId: userId,
    },
  });

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

  const channelPayload = buildMatchReportPayload({
    stage,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    ballchasingGroupUrl: ballchasingGroup,
  });

  const channelMsg = await sendChannelMessage(channelId, {
    content: `<@&${homeRoleId}> <@&${awayRoleId}>`,
    ...channelPayload,
  });

  if (channelMsg) {
    await prisma.match.update({
      where: { id: match.id },
      data: { discordMessageId: channelMsg.id },
    });
  }

  await editDeferredInteraction(applicationId, token, {
    content: "Match reported successfully.",
  });
}

export async function handleLeagues(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId } = ctx;

  if (!guildId) {
    await editDeferredInteraction(applicationId, token, {
      content: "This command can only be used in a server.",
    });
    return;
  }

  const leagues = await prisma.league.findMany({
    where: { discordGuildId: guildId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { teams: true, players: true, matches: true } },
    },
  });

  if (leagues.length === 0) {
    await editDeferredInteraction(applicationId, token, {
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

  await editDeferredInteraction(applicationId, token, {
    embeds: [
      buildLeaderboardEmbed(
        "League Master System — Leagues on this server",
        lines,
        0x2563eb
      ),
    ],
  });
}

export async function handlePlayerStandings(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId } = ctx;
  const leagueRoleId = getOptionRoleId(ctx.interaction, "league");

  if (!guildId || !leagueRoleId) {
    await editDeferredInteraction(applicationId, token, { content: "Missing league role." });
    return;
  }

  const roleNames = await fetchGuildRoleNames(guildId, [leagueRoleId]);
  const leagueName = await resolveRoleName(guildId, leagueRoleId, roleNames);
  const league = await getOrCreateLeague(guildId, leagueRoleId, leagueName);

  const players = await prisma.player.findMany({
    where: { leagueId: league.id },
    orderBy: [{ goals: "desc" }, { assists: "desc" }, { score: "desc" }],
    take: 10,
  });

  const lines = players.map((p, i) => {
    const rank = i + 1;
    const medal =
      rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
    return `${medal} **${p.displayName}** — ${p.goals}G ${p.assists}A ${p.saves}S (${p.matchesPlayed} matches)`;
  });

  await editDeferredInteraction(applicationId, token, {
    embeds: [
      buildLeaderboardEmbed(`${league.name} — Top 10 Players`, lines, 0x2563eb),
    ],
  });
}

export async function handlePlayerStats(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId } = ctx;
  const leagueRoleId = getOptionRoleId(ctx.interaction, "league");
  const categoryRaw = getOptionString(ctx.interaction, "category");

  if (!guildId || !leagueRoleId || !categoryRaw) {
    await editDeferredInteraction(applicationId, token, { content: "Missing options." });
    return;
  }

  if (!isStatCategory(categoryRaw)) {
    await editDeferredInteraction(applicationId, token, {
      content: "Invalid stat category.",
    });
    return;
  }

  const roleNames = await fetchGuildRoleNames(guildId, [leagueRoleId]);
  const leagueName = await resolveRoleName(guildId, leagueRoleId, roleNames);
  const league = await getOrCreateLeague(guildId, leagueRoleId, leagueName);
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
    return `${medal} **${p.displayName}** — ${p[field]}`;
  });

  await editDeferredInteraction(applicationId, token, {
    embeds: [
      buildLeaderboardEmbed(`${league.name} — Top 10 ${label}`, lines, 0x3b82f6),
    ],
  });
}

export async function handleTeamStandings(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId } = ctx;
  const leagueRoleId = getOptionRoleId(ctx.interaction, "league");

  if (!guildId || !leagueRoleId) {
    await editDeferredInteraction(applicationId, token, { content: "Missing league role." });
    return;
  }

  const roleNames = await fetchGuildRoleNames(guildId, [leagueRoleId]);
  const leagueName = await resolveRoleName(guildId, leagueRoleId, roleNames);
  const league = await getOrCreateLeague(guildId, leagueRoleId, leagueName);

  const teams = await prisma.team.findMany({
    where: { leagueId: league.id },
    orderBy: [{ wins: "desc" }, { losses: "asc" }, { name: "asc" }],
  });

  if (teams.length === 0) {
    await editDeferredInteraction(applicationId, token, {
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
      sections.push(`${i + 1}. **${team.name}** — ${team.wins}W-${team.losses}L`);
    });
    sections.push("");
  }

  await editDeferredInteraction(applicationId, token, {
    embeds: [
      buildLeaderboardEmbed(`${league.name} — Team Standings`, sections, 0x22c55e),
    ],
  });
}

export async function handleSetTeam(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId } = ctx;
  const leagueRoleId = getOptionRoleId(ctx.interaction, "league");
  const teamRoleId = getOptionRoleId(ctx.interaction, "team");
  const conference = getOptionString(ctx.interaction, "conference");
  const logoUrl = getOptionString(ctx.interaction, "logo_url");

  if (!guildId || !leagueRoleId || !teamRoleId) {
    await editDeferredInteraction(applicationId, token, { content: "Missing options." });
    return;
  }

  if (!conference && !logoUrl) {
    await editDeferredInteraction(applicationId, token, {
      content: "Provide at least one of: conference, logo_url",
    });
    return;
  }

  const roleNames = await fetchGuildRoleNames(guildId, [leagueRoleId, teamRoleId]);
  const leagueName = await resolveRoleName(guildId, leagueRoleId, roleNames);
  const teamName = await resolveRoleName(guildId, teamRoleId, roleNames);

  const league = await getOrCreateLeague(guildId, leagueRoleId, leagueName);
  const team = await getOrCreateTeam(league.id, teamRoleId, teamName);

  await prisma.team.update({
    where: { id: team.id },
    data: {
      conference: conference ?? team.conference,
      logoUrl: logoUrl ?? team.logoUrl,
    },
  });

  await editDeferredInteraction(applicationId, token, {
    content: `Updated **${team.name}**${conference ? ` — conference: ${conference}` : ""}${logoUrl ? " — logo set" : ""}`,
  });
}

export async function handleRegisterPlayer(ctx: InteractionContext): Promise<void> {
  const { applicationId, token, guildId } = ctx;
  const leagueRoleId = getOptionRoleId(ctx.interaction, "league");
  const playerUserId = getOptionUserId(ctx.interaction, "player");
  const playerUser = getInteractionUser(ctx.interaction);

  if (!guildId || !leagueRoleId || !playerUserId) {
    await editDeferredInteraction(applicationId, token, { content: "Missing options." });
    return;
  }

  const roleNames = await fetchGuildRoleNames(guildId, [leagueRoleId]);
  const leagueName = await resolveRoleName(guildId, leagueRoleId, roleNames);
  const league = await getOrCreateLeague(guildId, leagueRoleId, leagueName);

  const resolvedUser = ctx.interaction.resolved?.users?.[playerUserId];
  const displayName =
    resolvedUser?.global_name ??
    resolvedUser?.username ??
    playerUser?.global_name ??
    playerUser?.username ??
    "Player";

  await prisma.player.upsert({
    where: {
      leagueId_discordUserId: {
        leagueId: league.id,
        discordUserId: playerUserId,
      },
    },
    create: {
      leagueId: league.id,
      discordUserId: playerUserId,
      displayName,
    },
    update: { displayName },
  });

  await editDeferredInteraction(applicationId, token, {
    content: `Registered **${displayName}** in **${league.name}**.`,
  });
}

export async function routeCommand(ctx: InteractionContext): Promise<void> {
  const name = ctx.interaction.data?.name;

  switch (name) {
    case "report":
      await handleReport(ctx);
      break;
    case "leagues":
      await handleLeagues(ctx);
      break;
    case "player-standings":
      await handlePlayerStandings(ctx);
      break;
    case "player-stats":
      await handlePlayerStats(ctx);
      break;
    case "team-standings":
      await handleTeamStandings(ctx);
      break;
    case "set-team":
      await handleSetTeam(ctx);
      break;
    case "register-player":
      await handleRegisterPlayer(ctx);
      break;
    default:
      await editDeferredInteraction(ctx.applicationId, ctx.token, {
        content: "Unknown command.",
      });
  }
}

export async function processInteraction(
  interaction: import("../discord/types.js").DiscordInteraction
): Promise<void> {
  const ctx = buildContext(interaction);
  try {
    await routeCommand(ctx);
  } catch (err) {
    console.error("Command error:", err);
    await editDeferredInteraction(ctx.applicationId, ctx.token, {
      content: "Something went wrong. Please try again.",
    });
  }
}
