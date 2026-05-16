import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'tjt_admin';
const ALG = 'HS256';

function secretKey(): Uint8Array {
  const s = process.env.JWT_SECRET || 'a90d69bf76e2dc5c940c8b06e99458e0dec958db780a76149d2c6d11b475cb85';
  return new TextEncoder().encode(s);
}

export const ADMIN_USERNAME = 'admin';

// Hardcoded fallback password — works even if env var is missing after redeploy
const HARDCODED_PASSWORD = 'joni2026';

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  // Check env var first, then hardcoded fallback
  const plain = process.env.ADMIN_PASSWORD || HARDCODED_PASSWORD;
  if (password === plain) return true;
  return false;
}

export async function mintSession(): Promise<string> {
  const jwt = await new SignJWT({ u: ADMIN_USERNAME })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
  return jwt;
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function readSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
