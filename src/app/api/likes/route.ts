import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Rate limiting in memory (for simplicity)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_LIKES_PER_IP = 30; // Max likes per minute per IP
const ipLikeCounts = new Map<string, { count: number; expiresAt: number }>();

function cleanExpiredRateLimits() {
  const now = Date.now();
  for (const [ip, data] of ipLikeCounts.entries()) {
    if (now > data.expiresAt) {
      ipLikeCounts.delete(ip);
    }
  }
}

// Clean up every minute
setInterval(cleanExpiredRateLimits, RATE_LIMIT_WINDOW);

// We will use GitHub Discussions to store likes as a JSON string in a specific discussion body.
// We'll create a single discussion titled "photo_likes" in the General category if it doesn't exist,
// or you can create one manually and provide its ID. For simplicity, we'll try to find it first,
// but since GraphQL queries can be slow, we can cache the discussion ID.

let cachedDiscussionId: string | null = null;
const REPO_ID = 'R_kgDOSaa2rQ'; // From CommentWall.tsx / README
const CATEGORY_ID = 'DIC_kwDOSaa2rc4C9CSF'; // From CommentWall.tsx / README

async function getLikesDiscussionId(token: string): Promise<string | null> {
  if (cachedDiscussionId) return cachedDiscussionId;

  const query = `
    query {
      repository(owner: "zhaoyihui78", name: "huizzzi-photography-website") {
        discussions(first: 10, categoryId: "${CATEGORY_ID}", orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            id
            title
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await res.json();
    const discussions = data.data?.repository?.discussions?.nodes || [];
    const likesDiscussion = discussions.find((d: any) => d.title === 'photo_likes_db');
    
    if (likesDiscussion) {
      cachedDiscussionId = likesDiscussion.id;
      return cachedDiscussionId;
    }
    
    // If not found, create it
    const createQuery = `
      mutation {
        createDiscussion(input: {
          repositoryId: "${REPO_ID}",
          categoryId: "${CATEGORY_ID}",
          title: "photo_likes_db",
          body: "{}"
        }) {
          discussion {
            id
          }
        }
      }
    `;
    
    const createRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createQuery }),
    });
    
    const createData = await createRes.json();
    cachedDiscussionId = createData.data?.createDiscussion?.discussion?.id || null;
    return cachedDiscussionId;
  } catch (e) {
    console.error('Failed to get/create likes discussion', e);
    return null;
  }
}

async function getLikesData(token: string, discussionId: string): Promise<Record<string, number>> {
  const query = `
    query {
      node(id: "${discussionId}") {
        ... on Discussion {
          body
        }
      }
    }
  `;
  
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });
    
    const data = await res.json();
    const body = data.data?.node?.body || '{}';
    return JSON.parse(body);
  } catch (e) {
    console.error('Failed to parse likes JSON from discussion', e);
    return {};
  }
}

async function updateLikesData(token: string, discussionId: string, likesData: Record<string, number>) {
  const bodyString = JSON.stringify(likesData).replace(/"/g, '\\"');
  const query = `
    mutation {
      updateDiscussion(input: {
        discussionId: "${discussionId}",
        body: "${bodyString}"
      }) {
        discussion {
          id
        }
      }
    }
  `;
  
  await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GITHUB_TOKEN is not configured. Returning mock likes.');
      return NextResponse.json({ likes: 0 });
    }

    const discussionId = await getLikesDiscussionId(token);
    if (!discussionId) {
      return NextResponse.json({ likes: 0 });
    }

    const likesData = await getLikesData(token, discussionId);
    return NextResponse.json({ likes: likesData[photoId] || 0 });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Internal Server Error', likes: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: photoId } = body;

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    // Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const rateData = ipLikeCounts.get(ip);

    if (rateData && now < rateData.expiresAt) {
      if (rateData.count >= MAX_LIKES_PER_IP) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
      rateData.count++;
    } else {
      ipLikeCounts.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GITHUB_TOKEN is not configured. Mocking like increment.');
      return NextResponse.json({ success: true, likes: 1 });
    }

    const discussionId = await getLikesDiscussionId(token);
    if (!discussionId) {
      return NextResponse.json({ error: 'Could not access database' }, { status: 500 });
    }

    const likesData = await getLikesData(token, discussionId);
    
    // Increment like count
    const currentLikes = likesData[photoId] || 0;
    const newLikes = currentLikes + 1;
    likesData[photoId] = newLikes;
    
    await updateLikesData(token, discussionId, likesData);

    return NextResponse.json({ success: true, likes: newLikes });
  } catch (error) {
    console.error('Error incrementing like:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
