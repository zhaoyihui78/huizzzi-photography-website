// Vercel Serverless Function — posts comments to GitHub Discussions via GraphQL
const ipMap = new Map();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nickname, content, website } = req.body;

  if (website) return res.status(400).json({ error: 'Spam detected' });

  const text = content?.trim();
  if (!text || text.length < 2) {
    return res.status(400).json({ error: 'Content too short' });
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: 'Content too long (max 2000 chars)' });
  }

  // Rate limit: 3 per minute per IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - 60000;
  const entries = ipMap.get(ip) || [];
  const recent = entries.filter((t) => t > windowStart);
  if (recent.length >= 3) {
    return res.status(429).json({ error: 'Too many comments, please wait a minute' });
  }
  recent.push(now);
  ipMap.set(ip, recent);

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Server not configured (missing GITHUB_TOKEN)' });
  }

  const displayName = nickname?.trim() || '匿名访客';
  // Embed nickname in an HTML comment so the frontend can extract it later.
  // The comment is invisible on GitHub but readable by our parser.
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
      return res.status(500).json({ error: 'Failed to post comment' });
    }

    return res.status(200).json({
      success: true,
      comment: data.data?.addDiscussionComment?.comment,
    });
  } catch (err) {
    console.error('Error posting comment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
