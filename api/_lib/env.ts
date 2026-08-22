export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getRedirectUri(host: string): string {
  const configured = process.env.DISCORD_REDIRECT_URI;
  if (configured) return configured;

  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}/api/auth/callback`;
}
