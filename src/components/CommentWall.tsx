'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import LetterCard from './LetterCard';
import LetterModal from './LetterModal';

interface GiscusAuthor {
  login: string;
  avatarUrl: string;
  url: string;
}

interface GiscusComment {
  id: string;
  bodyHTML: string;
  createdAt: string;
  author: GiscusAuthor;
  replyCount: number;
}

const NEW_COMMENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

interface GiscusResponse {
  discussion: {
    comments: GiscusComment[];
    totalCommentCount: number;
  };
}

function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} ${time}`;
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function SkeletonCard({ index }: { index: number }) {
  const rotate = ((index * 37) % 80 - 40) / 10;
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-[#fdfcf9] p-6 shadow-sm h-[160px]"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="space-y-3">
        <div className="h-3 bg-[#f0ebe3] rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-[#f0ebe3] rounded w-full animate-pulse" />
        <div className="h-3 bg-[#f0ebe3] rounded w-5/6 animate-pulse" />
      </div>
      <div className="mt-5 flex justify-between">
        <div className="h-2 bg-[#f0ebe3] rounded w-16 animate-pulse" />
        <div className="h-2 bg-[#f0ebe3] rounded w-12 animate-pulse" />
      </div>
    </motion.div>
  );
}

const PAGE_SIZE = 12;

interface CommentWallProps {
  onCountChange?: (count: number) => void;
}

export default function CommentWall({ onCountChange }: CommentWallProps) {
  const [comments, setComments] = useState<GiscusComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<GiscusComment | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const lastFetchRef = useRef<number>(0);
  const clearNewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadComments = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 3000) return;
    lastFetchRef.current = now;

    // Use GitHub Discussions API directly — proper CORS (access-control-allow-origin: *)
    const url = `https://api.github.com/repos/zhaoyihui78/huizzzi-photography-website/discussions/1/comments?per_page=100&_=${Date.now()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: unknown) => {
        const items = Array.isArray(data) ? data : [];
        // Map GitHub API shape to our internal GiscusComment shape
        const fresh = items.map((c: any) => {
          const rawBody = c.body || '';
          // Extract embedded nickname from HTML comment (set by our API)
          const metaMatch = rawBody.match(/<!--guestbook-meta\|nickname:([^|]+)\|end-->/);
          const nickname = metaMatch ? metaMatch[1] : null;
          const cleanBody = rawBody.replace(/<!--guestbook-meta\|nickname:[^|]+\|end-->\n?/, '').trim();
          // Fallback for legacy comments without meta tag
          const displayName = nickname || (c.user?.login === 'zhaoyihui78' ? '访客' : c.user?.login) || '访客';

          return {
            id: String(c.id),
            bodyHTML: cleanBody,
            createdAt: c.created_at,
            author: {
              login: displayName,
              avatarUrl: c.user?.avatar_url || '',
              url: c.user?.html_url || '',
            },
            replyCount: c.child_comment_count || 0,
          };
        }).reverse();
        setComments(fresh);
      })
      .catch((err) => {
        console.error('CommentWall fetch failed:', err);
        setError(true);
        setComments((prev) => (prev.length === 0 ? [] : prev));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    onCountChange?.(comments.length);
  }, [comments.length, onCountChange]);

  // Highlight comments created within the last 24h
  useEffect(() => {
    const now = Date.now();
    const newlyCreated = comments.filter(
      (c) => now - new Date(c.createdAt).getTime() < NEW_COMMENT_WINDOW_MS
    );
    setNewIds(new Set(newlyCreated.map((c) => c.id)));
    if (clearNewTimeoutRef.current) clearTimeout(clearNewTimeoutRef.current);
    clearNewTimeoutRef.current = setTimeout(() => setNewIds(new Set()), 4000);
  }, [comments]);

  // Refresh on giscus iframe resize (fired after comment submission)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data?.giscus?.resizeHeight) {
        loadComments();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [loadComments]);

  // Poll every 60s as fallback (matches GitHub API cache TTL)
  useEffect(() => {
    const interval = setInterval(loadComments, 60000);
    return () => clearInterval(interval);
  }, [loadComments]);

  // Refresh when a new comment is posted via our custom form
  useEffect(() => {
    const onRefresh = () => loadComments();
    window.addEventListener('guestbook:refresh', onRefresh);
    return () => window.removeEventListener('guestbook:refresh', onRefresh);
  }, [loadComments]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.15 },
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1100px] mx-auto py-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[200px] flex items-center justify-center"
      >
        <div className="text-center">
          <p className="font-mono text-[11px] text-[#c9a96e] tracking-[0.15em] mb-2">
            留言暂时无法加载
          </p>
          <p className="font-mono text-[9px] text-[#ccc] tracking-[0.1em]">
            刷新页面或稍后再试
          </p>
        </div>
      </motion.div>
    );
  }

  if (comments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-[200px] flex items-center justify-center"
      >
        <div className="relative bg-[#fdfcf9] p-8 shadow-sm max-w-sm mx-auto"
          style={{ transform: 'rotate(1deg)' }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-5 bg-[rgba(232,220,190,0.7)] rotate-[-2deg]" />
          <p className="font-mono text-[12px] text-[#888] leading-[2] text-center">
            还没有人留言，<br />来做第一个访客吧。
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1100px] mx-auto py-4"
      >
        {comments.slice(0, displayCount).map((comment, index) => {
          const h = hashString(comment.id);
          const rotate = ((h % 80) - 40) / 10; // -4 to +4 deg
          const offsetY = (h % 24) - 8; // -8 to +16 px
          const text = stripHtml(comment.bodyHTML);

          return (
            <LetterCard
              key={comment.id}
              text={text}
              author={comment.author.login}
              date={formatDate(comment.createdAt)}
              rotate={rotate}
              offsetY={offsetY}
              index={index}
              isNew={newIds.has(comment.id)}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('guestbook:close-form'));
                setSelected(comment);
              }}
            />
          );
        })}
      </motion.div>

      {comments.length > displayCount && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}
          className="mx-auto mt-10 block px-10 py-3 border border-[#e0d5c0] bg-[#fdfcf9] font-mono text-[10px] text-[#999] tracking-[0.15em] uppercase hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors duration-300 cursor-pointer"
        >
          展开更多信件
        </motion.button>
      )}

      {selected && (
        <LetterModal
          comment={selected}
          stripHtml={stripHtml}
          formatDate={formatDate}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
