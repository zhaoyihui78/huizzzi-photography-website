import { NextResponse } from 'next/server';
import { WE_AUTH_COOKIE } from '@/lib/we-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ ok: true, redirectTo: '/we/login' });
  response.cookies.set({
    name: WE_AUTH_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    priority: 'high',
  });

  return response;
}
