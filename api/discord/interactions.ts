import type { VercelRequest, VercelResponse } from "@vercel/node";
import { waitUntil } from "@vercel/functions";
import { verifyDiscordRequest } from "../../lib/discord/verify.js";
import { processInteraction } from "../../lib/lms/commands.js";
import {
  InteractionType,
  ResponseType,
  readRawBody,
  type DiscordInteraction,
} from "../../lib/discord/types.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    console.error("Missing DISCORD_PUBLIC_KEY");
    return res.status(500).end("Server not configured");
  }

  const signature = req.headers["x-signature-ed25519"] as string | undefined;
  const timestamp = req.headers["x-signature-timestamp"] as string | undefined;

  const rawBody = await readRawBody(req);

  if (!(await verifyDiscordRequest(rawBody, signature, timestamp, publicKey))) {
    return res.status(401).end("Invalid request signature");
  }

  const interaction = JSON.parse(rawBody.toString()) as DiscordInteraction;

  // Discord verification ping — respond immediately
  if (interaction.type === InteractionType.PING) {
    return res.status(200).json({ type: ResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Acknowledge within 3s: defer so Discord shows "Bot is thinking…"
    // Then finish work in background and edit the deferred response
    waitUntil(processInteraction(interaction));

    return res.status(200).json({ type: ResponseType.DEFERRED_CHANNEL_MESSAGE });
  }

  return res.status(400).end("Unknown interaction type");
}
