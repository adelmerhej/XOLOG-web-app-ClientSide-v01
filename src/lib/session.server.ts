import { randomBytes, createHmac } from "node:crypto";
//import { usersCollection } from "@/lib/dbUtils";
import type { ObjectId } from "mongodb";

const SESSION_COOKIE = "__xolog_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
//const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

type Session = {
  userId: string; // hex string
  token: string;
  createdAt: number;
};

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function createSessionCookie(session: Session) {
  const payload = JSON.stringify(session);
  const b64 = Buffer.from(payload).toString("base64url");
  const signature = sign(b64);
  const cookieValue = `${b64}.${signature}`;
  const cookie = `${SESSION_COOKIE}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
  return cookie;
}

export function destroySessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function parseSessionCookie(cookieHeader: string | null): Session | null {
  if (!cookieHeader) return null;
  const cookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const value = cookie.split("=")[1];
  const [b64, signature] = value.split(".");
  if (!b64 || !signature) return null;
  const expected = sign(b64);
  if (expected !== signature) return null;
  try {
    const json = Buffer.from(b64, "base64url").toString();
    return JSON.parse(json) as Session;
  } catch {
    return null;
  }
}

export function newSession(userId: ObjectId): Session {
  return {
    userId: userId.toHexString(),
    token: randomBytes(16).toString("hex"),
    createdAt: Date.now(),
  };
}

export async function getUserFromRequest(request: Request) {
  const session = parseSessionCookie(request.headers.get("cookie"));
  if (!session) return null;
  return null;
  
//   try {
//     const users = await usersCollection();
//     const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(session.userId) });
//     if (!user) return null;
//     return { id: user._id.toHexString(), name: user.name, email: user.email, role: user.role };
//   } catch {
//     return null;
//   }
}

export function requireUser(request: Request) {
  return getUserFromRequest(request).then((user) => {
    if (!user) {
      const url = new URL(request.url);
      const to = `/login?redirectTo=${encodeURIComponent(url.pathname)}`;
      throw new Response(null, { status: 302, headers: { Location: to } });
    }
    return user;
  });
}
