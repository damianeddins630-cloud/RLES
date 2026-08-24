import { createHmac, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const SESSION_COOKIE = "lms_session";

export interface SessionUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  discriminator: string;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser, secret: string): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function parseSessionToken(
  token: string | undefined,
  secret: string
): SessionUser | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(
    sigBuf as unknown as Uint8Array,
    expectedBuf as unknown as Uint8Array
  )) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(
  req: VercelRequest,
  secret: string
): SessionUser | null {
  const cookie = req.cookies?.[SESSION_COOKIE];
  return parseSessionToken(cookie, secret);
}

export function setSessionCookie(
  res: VercelResponse,
  user: SessionUser,
  secret: string
): void {
  const token = createSessionToken(user, secret);
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`,
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res: VercelResponse): void {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}
