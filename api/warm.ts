import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Keeps the interactions function warm — called by Vercel Cron every 5 minutes. */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, service: "league-master-system" });
}
