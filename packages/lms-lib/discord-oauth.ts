import type { SessionUser } from "./session.js";

const DISCORD_API = "https://discord.com/api";

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
}

export function getDiscordAuthUrl(
  clientId: string,
  redirectUri: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
  });
  return `https://discord.com/api/oauth2/authorize?${params}`;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<string> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord token exchange failed: ${text}`);
  }

  const data = (await res.json()) as DiscordTokenResponse;
  return data.access_token;
}

export async function fetchDiscordUser(accessToken: string): Promise<SessionUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord user fetch failed: ${text}`);
  }

  const user = (await res.json()) as DiscordUser;
  return {
    id: user.id,
    username: user.username,
    globalName: user.global_name,
    avatar: user.avatar,
    discriminator: user.discriminator,
  };
}

export function getAvatarUrl(user: SessionUser): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  }
  const fallback = Number(user.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${fallback}.png`;
}
