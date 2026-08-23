import type { ChatInputCommandInteraction } from "discord.js";

export function requireGuild(interaction: ChatInputCommandInteraction): string | null {
  if (!interaction.guildId) {
    interaction.reply({
      content: "This command can only be used inside a Discord server.",
      ephemeral: true,
    });
    return null;
  }
  return interaction.guildId;
}
