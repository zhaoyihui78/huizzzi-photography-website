import { NextRequest, NextResponse } from 'next/server';
import { getWeSessionUser, WE_AUTH_COOKIE } from '@/lib/we-auth';
import {
  createWeLetter,
  isWeLettersConfigured,
  isWeLettersPreviewMode,
  listWeLetters,
  markWeLetterRead,
  type WeLetterParty,
} from '@/lib/we-letters';

export const dynamic = 'force-dynamic';

const MAX_CONTENT_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_WRITES_PER_WINDOW = 12;
const writeAttempts = new Map<string, { count: number; expiresAt: number }>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function getWriteState(key: string) {
  const current = writeAttempts.get(key);
  if (!current) return null;
  if (current.expiresAt <= Date.now()) {
    writeAttempts.delete(key);
    return null;
  }
  return current;
}

async function getCurrentUser(request: NextRequest) {
  return getWeSessionUser(request.cookies.get(WE_AUTH_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWeLettersConfigured() && !isWeLettersPreviewMode()) {
    return NextResponse.json(
      { error: 'WE letters storage is not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const letters = await listWeLetters();
    return NextResponse.json({
      letters,
      currentUser,
      unreadCount: letters.filter((letter) => letter.to === currentUser && !letter.readAt).length,
      preview: isWeLettersPreviewMode(),
    });
  } catch (error) {
    console.error('Failed to load WE letters:', error);
    return NextResponse.json({ error: 'Failed to load letters.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWeLettersConfigured() && !isWeLettersPreviewMode()) {
    return NextResponse.json(
      { error: 'WE letters storage is not configured on the server.' },
      { status: 503 }
    );
  }

  const clientKey = getClientKey(request);
  const state = getWriteState(clientKey);
  if (state && state.count >= MAX_WRITES_PER_WINDOW) {
    return NextResponse.json(
      { error: 'Too many letters sent in a short time. Please wait a minute.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const replyToId = typeof body.replyToId === 'string' ? body.replyToId : undefined;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const deliverAt = typeof body.deliverAt === 'string' ? body.deliverAt : undefined;
  const attachment = body.attachment && body.attachment.type === 'photo' && typeof body.attachment.url === 'string'
    ? { type: 'photo' as const, url: body.attachment.url }
    : undefined;
  const paperStyle = body.paperStyle === 'handwritten' ? 'handwritten' : 'default';

  if (!title) {
    return NextResponse.json({ error: 'Letter title is required.' }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: 'Letter content is required.' }, { status: 400 });
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Letter is too long. Max ${MAX_CONTENT_LENGTH} characters.` },
      { status: 400 }
    );
  }

  writeAttempts.set(clientKey, {
    count: (state?.count || 0) + 1,
    expiresAt: Date.now() + RATE_LIMIT_WINDOW_MS,
  });

  try {
    const from: WeLetterParty = currentUser;
    const to: WeLetterParty = currentUser === 'hui' ? 'dudu' : 'hui';
    const letter = await createWeLetter({ from, to, title, content, replyToId, deliverAt, attachment, paperStyle });
    const letters = await listWeLetters();
    return NextResponse.json({
      ok: true,
      letter,
      currentUser,
      unreadCount: letters.filter((item) => item.to === currentUser && !item.readAt).length,
      preview: isWeLettersPreviewMode(),
    });
  } catch (error) {
    console.error('Failed to create WE letter:', error);
    return NextResponse.json({ error: 'Failed to send letter.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWeLettersConfigured() && !isWeLettersPreviewMode()) {
    return NextResponse.json(
      { error: 'WE letters storage is not configured on the server.' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';

  if (!id) {
    return NextResponse.json({ error: 'Invalid letter update payload.' }, { status: 400 });
  }

  try {
    const letter = await markWeLetterRead(id, currentUser);
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found.' }, { status: 404 });
    }

    const letters = await listWeLetters();
    return NextResponse.json({
      ok: true,
      letter,
      currentUser,
      unreadCount: letters.filter((item) => item.to === currentUser && !item.readAt).length,
      preview: isWeLettersPreviewMode(),
    });
  } catch (error) {
    console.error('Failed to update WE letter:', error);
    return NextResponse.json({ error: 'Failed to update letter.' }, { status: 500 });
  }
}
