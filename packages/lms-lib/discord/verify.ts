import { verifyKey } from "discord-interactions";

export async function verifyDiscordRequest(
  rawBody: Buffer,
  signature: string | undefined,
  timestamp: string | undefined,
  publicKey: string
): Promise<boolean> {
  if (!signature || !timestamp) return false;
  return verifyKey(rawBody, signature, timestamp, publicKey);
}
