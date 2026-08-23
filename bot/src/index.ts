import {
  Client,
  Events,
  GatewayIntentBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { config } from "./config.js";
import { commands } from "./commands/index.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandMap = new Map(
  commands.map((cmd) => [cmd.data.name, cmd])
);

client.once(Events.ClientReady, (c) => {
  console.log(`RLES bot online as ${c.user.tag}`);
  console.log(`Loaded commands: ${commands.map((c) => c.data.name).join(", ")}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction as ChatInputCommandInteraction);
  } catch (err) {
    console.error(`Error in /${interaction.commandName}:`, err);

    const reply = {
      content: "Something went wrong running that command.",
      ephemeral: true as const,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(config.token);
