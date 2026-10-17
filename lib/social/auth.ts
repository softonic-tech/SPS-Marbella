import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { adminPassword, sessionSecret } from './env';

const COOKIE = 'sps_admin_session';
const MAX_AGE_SEC = 60 * 60 * 12;

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex').slice(0, 48);
}

function encodeSession(expiresAt: number) {
  const payload = `${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function decodeSession(raw: string | undefined) {
  if (!raw) return false;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = sign(payload);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminPassword(password: string) {
  const expected = adminPassword();
  const a = Buffer.from(createHmac('sha256', 'sps').update(password).digest('hex'));
  const b = Buffer.from(createHmac('sha256', 'sps').update(expected).digest('hex'));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}

export async function setAdminSession() {
  const jar = await cookies();
  const value = encodeSession(Date.now() + MAX_AGE_SEC * 1000);
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
