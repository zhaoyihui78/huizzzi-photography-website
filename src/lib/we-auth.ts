export const WE_AUTH_COOKIE = 'we_auth';
const DEFAULT_NEXT_PATH = '/we';

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getWePassword() {
  return process.env.WE_PASSWORD?.trim() || '';
}

function getWeSalt() {
  return process.env.WE_AUTH_SALT?.trim() || 'huizzzi-we-auth-v1';
}

export async function deriveWeSessionToken(password: string) {
  const source = `${password}:${getWeSalt()}`;
  const data = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

export async function isValidWePassword(password: string) {
  const expected = getWePassword();
  if (!expected || !password) return false;
  return password === expected;
}

export async function getExpectedWeSessionToken() {
  const password = getWePassword();
  if (!password) return '';
  return deriveWeSessionToken(password);
}

export async function hasValidWeSessionToken(token?: string | null) {
  if (!token) return false;
  const expected = await getExpectedWeSessionToken();
  if (!expected) return false;
  return token === expected;
}

export function normalizeWeNextPath(value?: string | null) {
  if (!value || !value.startsWith('/we')) return DEFAULT_NEXT_PATH;
  if (value.startsWith('/we/login')) return DEFAULT_NEXT_PATH;
  return value;
}

export function isWeAuthConfigured() {
  return Boolean(getWePassword());
}
