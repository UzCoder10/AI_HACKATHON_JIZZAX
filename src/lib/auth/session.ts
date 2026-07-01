import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { PIN_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookies";

const COOKIE_NAME = SESSION_COOKIE;
const PIN_COOKIE_NAME = PIN_COOKIE;
const SESSION_DAYS = 7;
const PIN_HOURS = 2;

export interface SessionPayload {
  parentId: string;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET muhit o'zgaruvchisi sozlanmagan");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.parentId || !payload.email) return null;
    return { parentId: String(payload.parentId), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(PIN_COOKIE_NAME);
}

export async function signPinVerified(parentId: string): Promise<string> {
  return new SignJWT({ parentId, pin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PIN_HOURS}h`)
    .sign(getSecret());
}

export async function isPinVerified(parentId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PIN_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.parentId === parentId && payload.pin === true;
  } catch {
    return false;
  }
}

export async function setPinCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PIN_HOURS * 60 * 60,
  });
}

export { COOKIE_NAME, PIN_COOKIE_NAME };
