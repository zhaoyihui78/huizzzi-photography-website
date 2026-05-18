import { NextRequest, NextResponse } from 'next/server';
import { getWeSessionUser, WE_AUTH_COOKIE } from '@/lib/we-auth';
import {
  getWeLetterUnreadCount,
  isWeLettersConfigured,
  isWeLettersPreviewMode,
  listWeLetters,
} from '@/lib/we-letters';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const currentUser = await getWeSessionUser(
    request.cookies.get(WE_AUTH_COOKIE)?.value
  );

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWeLettersConfigured() && !isWeLettersPreviewMode()) {
    return NextResponse.json(
      {
        unreadCount: 0,
        currentUser,
        configured: false,
      },
      { status: 200 }
    );
  }

  try {
    const letters = await listWeLetters();
    return NextResponse.json({
      unreadCount: getWeLetterUnreadCount(letters, currentUser),
      currentUser,
      configured: true,
      preview: isWeLettersPreviewMode(),
    });
  } catch (error) {
    console.error('Failed to load WE letter unread counts:', error);
    return NextResponse.json(
      { error: 'Failed to load unread counts.' },
      { status: 500 }
    );
  }
}
