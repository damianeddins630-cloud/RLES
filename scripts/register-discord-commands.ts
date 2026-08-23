import "dotenv/config";
import { commandDefinitions } from "../api/_lib/discord/commandDefinitions.js";

const DISCORD_API = "https://discord.com/api/v10";

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    throw new Error("DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID are required");
  }

  const url = guildId
    ? `${DISCORD_API}/applications/${clientId}/guilds/${guildId}/commands`
    : `${DISCORD_API}/applications/${clientId}/commands`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(commandDefinitions),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to register commands: ${text}`);
  }

  const data = await res.json();
  console.log(
    `Registered ${Array.isArray(data) ? data.length : 0} commands${guildId ? ` for guild ${guildId}` : " globally"}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
