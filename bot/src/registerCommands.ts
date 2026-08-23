import { REST, Routes } from "discord.js";
import { config } from "./config.js";
import { commands } from "./commands/index.js";

const rest = new REST().setToken(config.token);

const body = commands.map((cmd) => cmd.data.toJSON());

async function main() {
  console.log(`Registering ${body.length} slash commands...`);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body,
    });
    console.log(`Registered guild commands for server ${config.guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log("Registered global commands (may take up to 1 hour to appear)");
  }
}

main().catch(console.error);
