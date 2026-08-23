import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { getOrCreateLeague, prisma } from "../lib/db.js";

export const registerPlayerCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("register-player")
    .setDescription("Register a player in a league for stat tracking")
    .addRoleOption((opt) =>
      opt.setName("league").setDescription("League role").setRequired(true)
    )
    .addUserOption((opt) =>
      opt
        .setName("player")
        .setDescription("Discord user to register")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const leagueRole = interaction.options.getRole("league", true);
    const playerUser = interaction.options.getUser("player", true);

    const league = await getOrCreateLeague(
      interaction.guildId!,
      leagueRole.id,
      leagueRole.name
    );
    const displayName = playerUser.displayName ?? playerUser.username;

    await prisma.player.upsert({
      where: {
        leagueId_discordUserId: {
          leagueId: league.id,
          discordUserId: playerUser.id,
        },
      },
      create: {
        leagueId: league.id,
        discordUserId: playerUser.id,
        displayName,
      },
      update: { displayName },
    });

    await interaction.reply({
      content: `Registered **${displayName}** in **${league.name}**.`,
      ephemeral: true,
    });
  },
};
