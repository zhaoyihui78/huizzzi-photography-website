import { NextResponse } from 'next/server';

const ipMap = new Map<string, number[]>();
let requestCount = 0;

function cleanExpiredEntries() {
  const cutoff = Date.now() - 60000;
  for (const [ip, entries] of ipMap) {
    const filtered = entries.filter((t) => t > cutoff);
    if (filtered.length === 0) ipMap.delete(ip);
    else ipMap.set(ip, filtered);
  }
  requestCount = 0;
}

const BLOCKED_PATTERNS = [
  /(博彩|赌球|彩票|投注|刷单|兼职.*日结|高价.*收购|代开.*发票|裸聊|约炮|办证|贷款.*秒批)/i,
  /(casino|porn|viagra|crypto.*invest|make money fast|click here to win)/i,
  /(<script|javascript:|onerror=|onload=)/i,
];

function containsBlockedContent(text: string) {
  return BLOCKED_PATTERNS.some((p) => p.test(text));
}

export async function POST(request: Request) {
  const { nickname, content, website } = await request.json().catch(() => ({}));

  if (website) {
    return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
  }

  const text = content?.trim();
  if (!text || text.length < 2) {
    return NextResponse.json({ error: 'Content too short' }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: 'Content too long (max 2000 chars)' }, { status: 400 });
  }

  if (containsBlockedContent(text) || containsBlockedContent(nickname || '')) {
    return NextResponse.json({ error: 'Content contains inappropriate material' }, { status: 400 });
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const windowStart = now - 60000;

  requestCount++;
  if (requestCount > 100 || ipMap.size > 500) cleanExpiredEntries();

  const entries = ipMap.get(ip) || [];
  const recent = entries.filter((t) => t > windowStart);
  if (recent.length >= 3) {
    return NextResponse.json({ error: 'Too many comments, please wait a minute' }, { status: 429 });
  }
  recent.push(now);
  ipMap.set(ip, recent);

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Server not configured (missing GITHUB_TOKEN)' }, { status: 500 });
  }

  const displayName = nickname?.trim() || '匿名访客';
  const body = `<!--guestbook-meta|nickname:${displayName}|end-->\n${text}`;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation($discussionId: ID!, $body: String!) {
            addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
              comment {
                id
                body
                createdAt
                author {
                  login
                  avatarUrl
                }
              }
            }
          }
        `,
        variables: {
          discussionId: 'D_kwDOSaa2rc4AmZPQ',
          body,
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('GitHub GraphQL errors:', JSON.stringify(data.errors));
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comment: data.data?.addDiscussionComment?.comment,
    });
  } catch (err) {
    console.error('Error posting comment:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
