import type { VercelRequest } from "@vercel/node";

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
}

export interface DiscordMember {
  user?: DiscordUser;
}

export interface DiscordOption {
  name: string;
  type: number;
  value: string | number;
}

export interface DiscordInteraction {
  type: number;
  id: string;
  application_id: string;
  token: string;
  guild_id?: string;
  channel_id?: string;
  member?: DiscordMember;
  user?: DiscordUser;
  data?: {
    id: string;
    name: string;
    options?: DiscordOption[];
  };
  resolved?: {
    users?: Record<string, DiscordUser>;
  };
}

export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
} as const;

export const OptionType = {
  STRING: 3,
  INTEGER: 4,
  USER: 6,
  ROLE: 8,
} as const;

export const ResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
  DEFERRED_CHANNEL_MESSAGE: 5,
} as const;

export const MessageFlags = {
  EPHEMERAL: 64,
} as const;

export function getInteractionUser(interaction: DiscordInteraction): DiscordUser | null {
  return interaction.member?.user ?? interaction.user ?? null;
}

export function getOptionString(
  interaction: DiscordInteraction,
  name: string
): string | undefined {
  const opt = interaction.data?.options?.find((o) => o.name === name);
  if (!opt || typeof opt.value !== "string") return undefined;
  return opt.value;
}

export function getOptionRoleId(
  interaction: DiscordInteraction,
  name: string
): string | undefined {
  const opt = interaction.data?.options?.find((o) => o.name === name);
  if (!opt || opt.type !== OptionType.ROLE) return undefined;
  return String(opt.value);
}

export function getOptionInt(
  interaction: DiscordInteraction,
  name: string
): number | undefined {
  const opt = interaction.data?.options?.find((o) => o.name === name);
  if (!opt || typeof opt.value !== "number") return undefined;
  return opt.value;
}

export function getOptionUserId(
  interaction: DiscordInteraction,
  name: string
): string | undefined {
  const opt = interaction.data?.options?.find((o) => o.name === name);
  if (!opt || opt.type !== OptionType.USER) return undefined;
  return String(opt.value);
}

export async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const stream = req as unknown as AsyncIterable<Buffer | string>;
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
