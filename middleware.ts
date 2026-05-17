import { NextRequest, NextResponse } from 'next/server';
import {
  hasValidWeSessionToken,
  normalizeWeNextPath,
  WE_AUTH_COOKIE,
} from '@/lib/we-auth';

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function buildRedirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/we/login';
  loginUrl.searchParams.set(
    'next',
    normalizeWeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`)
  );
  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const normalizedPathname = normalizePathname(pathname);

  if (!normalizedPathname.startsWith('/we')) {
    return NextResponse.next();
  }

  const hasAuth = await hasValidWeSessionToken(
    request.cookies.get(WE_AUTH_COOKIE)?.value
  );
  const isLoginPage = normalizedPathname === '/we/login';

  if (isLoginPage) {
    if (hasAuth) {
      const target = normalizeWeNextPath(searchParams.get('next') || '/we');
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (!hasAuth) {
    return NextResponse.redirect(buildRedirectToLogin(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/we/:path*'],
};
