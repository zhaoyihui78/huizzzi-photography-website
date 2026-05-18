import { NextRequest, NextResponse } from 'next/server';
import { getWeSessionUser, WE_AUTH_COOKIE } from '@/lib/we-auth';

export const dynamic = 'force-dynamic';

function getLettersToken() {
  return (
    process.env.WE_LETTERS_GITHUB_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ''
  );
}

function getLettersGistId() {
  return process.env.WE_LETTERS_GIST_ID?.trim() || '';
}

export async function GET(request: NextRequest) {
  const currentUser = await getWeSessionUser(request.cookies.get(WE_AUTH_COOKIE)?.value);
  if (!currentUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('file');

  if (!filename) {
    return new NextResponse('Missing file parameter', { status: 400 });
  }

  const gistId = getLettersGistId();
  const token = getLettersToken();

  if (!gistId || !token) {
    return new NextResponse('Server configuration error', { status: 503 });
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'force-cache',
      next: { revalidate: 86400 } // Cache heavily for 24h since uploads are immutable
    });

    if (!response.ok) {
      return new NextResponse('Gist not found', { status: response.status });
    }

    const data = await response.json();
    const file = data.files[filename];

    if (!file || !file.content) {
      return new NextResponse('File not found in Gist', { status: 404 });
    }

    // content is a data URI like: data:image/jpeg;base64,/9j/4AAQ...
    const matches = file.content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse('Invalid file format', { status: 500 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy failed:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
