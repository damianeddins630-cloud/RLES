import type { DiscordInteraction } from "./types.js";

const DISCORD_API = "https://discord.com/api/v10";

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("Missing DISCORD_BOT_TOKEN");
  return token;
}

export interface ApiEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string }>;
  thumbnail?: { url: string };
}

export interface MessagePayload {
  content?: string;
  embeds?: ApiEmbed[];
  components?: unknown[];
}

export async function editDeferredInteraction(
  applicationId: string,
  interactionToken: string,
  payload: MessagePayload
): Promise<void> {
  const url = `${DISCORD_API}/webhooks/${applicationId}/${interactionToken}/messages/@original`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to edit interaction:", text);
  }
}

export async function sendChannelMessage(
  channelId: string,
  payload: MessagePayload
): Promise<{ id: string } | null> {
  const url = `${DISCORD_API}/channels/${channelId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${getBotToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to send channel message:", text);
    return null;
  }
  return res.json() as Promise<{ id: string }>;
}

export async function fetchGuildRoleName(
  guildId: string,
  roleId: string
): Promise<string | null> {
  const url = `${DISCORD_API}/guilds/${guildId}/roles`;
  const res = await fetch(url, {
    headers: { Authorization: `Bot ${getBotToken()}` },
  });
  if (!res.ok) return null;
  const roles = (await res.json()) as Array<{ id: string; name: string }>;
  const role = roles.find((r) => r.id === roleId);
  return role?.name ?? null;
}

export async function fetchGuildRoleNames(
  guildId: string,
  roleIds: string[]
): Promise<Map<string, string>> {
  const url = `${DISCORD_API}/guilds/${guildId}/roles`;
  const res = await fetch(url, {
    headers: { Authorization: `Bot ${getBotToken()}` },
  });
  const map = new Map<string, string>();
  if (!res.ok) return map;
  const roles = (await res.json()) as Array<{ id: string; name: string }>;
  for (const roleId of roleIds) {
    const role = roles.find((r) => r.id === roleId);
    if (role) map.set(roleId, role.name);
  }
  return map;
}

export interface InteractionContext {
  interaction: DiscordInteraction;
  applicationId: string;
  token: string;
  guildId: string | null;
  channelId: string | null;
  userId: string;
}

export function buildContext(interaction: DiscordInteraction): InteractionContext {
  const user = interaction.member?.user ?? interaction.user;
  if (!user) throw new Error("No user on interaction");

  return {
    interaction,
    applicationId: interaction.application_id,
    token: interaction.token,
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id ?? null,
    userId: user.id,
  };
}
