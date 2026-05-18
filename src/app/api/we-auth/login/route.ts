import { NextRequest, NextResponse } from 'next/server';
import {
  deriveWeSessionToken,
  getWeUserLabel,
  isValidWePassword,
  isWeAuthConfigured,
  normalizeWeNextPath,
  WE_AUTH_COOKIE,
} from '@/lib/we-auth';
import type { WeLetterParty } from '@/lib/we-letters';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 60_000;
const attempts = new Map<string, { count: number; expiresAt: number }>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function getAttemptState(key: string) {
  const current = attempts.get(key);
  if (!current) return null;
  if (current.expiresAt <= Date.now()) {
    attempts.delete(key);
    return null;
  }
  return current;
}

export async function POST(request: NextRequest) {
  if (!isWeAuthConfigured()) {
    return NextResponse.json(
      { error: 'WE_USER_HUI_PASSWORD / WE_USER_DUDU_PASSWORD 尚未在服务端配置。' },
      { status: 503 }
    );
  }

  const ipKey = getClientKey(request);
  const state = getAttemptState(ipKey);
  if (state && state.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      {
        error: 'Too many attempts. Please try again later.',
        lockedUntil: state.expiresAt,
      },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const user = body.user;
  const password = typeof body.password === 'string' ? body.password : '';
  const nextPath = normalizeWeNextPath(
    typeof body.next === 'string' ? body.next : undefined
  );
  const isKnownUser = user === 'hui' || user === 'dudu';

  if (!isKnownUser) {
    return NextResponse.json({ error: '请选择你的账号。' }, { status: 400 });
  }

  const isValid = await isValidWePassword(user as WeLetterParty, password);
  if (!isValid) {
    const nextCount = (state?.count || 0) + 1;
    attempts.set(ipKey, {
      count: nextCount,
      expiresAt: Date.now() + LOCK_WINDOW_MS,
    });
    return NextResponse.json(
      {
        error: nextCount >= MAX_ATTEMPTS
          ? '尝试次数过多，请在 60 秒后再试。'
          : `${getWeUserLabel(user as WeLetterParty)} 的密码不正确。`,
      },
      { status: nextCount >= MAX_ATTEMPTS ? 429 : 401 }
    );
  }

  attempts.delete(ipKey);

  const response = NextResponse.json({ ok: true, redirectTo: nextPath });
  response.cookies.set({
    name: WE_AUTH_COOKIE,
    value: await deriveWeSessionToken(user as WeLetterParty),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    priority: 'high',
  });

  return response;
}
