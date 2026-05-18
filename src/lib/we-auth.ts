import type { WeLetterParty } from '@/lib/we-letters';

export const WE_AUTH_COOKIE = 'we_auth';
const DEFAULT_NEXT_PATH = '/we';

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isParty(value: string): value is WeLetterParty {
  return value === 'hui' || value === 'dudu';
}

function getWeAuthSecret() {
  return (
    process.env.WE_AUTH_SECRET?.trim() ||
    process.env.WE_AUTH_SALT?.trim() ||
    'huizzzi-we-auth-v2'
  );
}

function getWeUserPassword(user: WeLetterParty) {
  if (user === 'hui') return process.env.WE_USER_HUI_PASSWORD?.trim() || '';
  if (user === 'dudu') return process.env.WE_USER_DUDU_PASSWORD?.trim() || '';
  return '';
}

export function getWeUserLabel(user: WeLetterParty) {
  return user === 'hui' ? 'Hui' : 'DuDu';
}

export function getWeAuthUsers() {
  return (['hui', 'dudu'] as WeLetterParty[]).filter((user) => Boolean(getWeUserPassword(user)));
}

export async function deriveWeSessionToken(user: WeLetterParty, password?: string) {
  const actualPassword = password ?? getWeUserPassword(user);
  if (!actualPassword) return '';
  const source = `${user}:${actualPassword}:${getWeAuthSecret()}`;
  const data = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return `${user}.${toHex(digest)}`;
}

export async function isValidWePassword(user: WeLetterParty, password: string) {
  const expected = getWeUserPassword(user);
  if (!expected || !password) return false;
  return password === expected;
}

export async function getWeSessionUser(token?: string | null) {
  if (!token) return null;
  const [user] = token.split('.');
  if (!user || !isParty(user)) return null;
  const expected = await deriveWeSessionToken(user);
  if (!expected) return null;
  return token === expected ? user : null;
}

export async function hasValidWeSessionToken(token?: string | null) {
  return Boolean(await getWeSessionUser(token));
}

export function normalizeWeNextPath(value?: string | null) {
  if (!value || !value.startsWith('/we')) return DEFAULT_NEXT_PATH;
  if (value.startsWith('/we/login')) return DEFAULT_NEXT_PATH;
  return value;
}

export function isWeAuthConfigured() {
  return getWeAuthUsers().length === 2;
}
