import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Simple health check — visit /api/health to verify API routes are deployed. */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: "league-master-system",
    timestamp: new Date().toISOString(),
  });
}
