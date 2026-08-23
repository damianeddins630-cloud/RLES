import { verifyKey } from "discord-interactions";

export function verifyDiscordRequest(
  rawBody: Buffer,
  signature: string | undefined,
  timestamp: string | undefined,
  publicKey: string
): boolean {
  if (!signature || !timestamp) return false;
  return verifyKey(rawBody, signature, timestamp, publicKey);
}
