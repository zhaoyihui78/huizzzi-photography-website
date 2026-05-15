'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GuestbookFormProps {
  onPosted?: () => void;
}

const DRAFT_KEY_NICKNAME = 'guestbook-draft-nickname';
const DRAFT_KEY_CONTENT = 'guestbook-draft-content';

export default function GuestbookForm({ onPosted }: GuestbookFormProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const savedNick = localStorage.getItem(DRAFT_KEY_NICKNAME);
      const savedContent = localStorage.getItem(DRAFT_KEY_CONTENT);
      if (savedNick) setNickname(savedNick);
      if (savedContent) setContent(savedContent);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY_NICKNAME, nickname);
      localStorage.setItem(DRAFT_KEY_CONTENT, content);
    } catch {
      // ignore localStorage errors
    }
  }, [nickname, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/comment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || '匿名访客',
          content: content.trim(),
          website: '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '提交失败');
      }

      const optimisticComment = {
        id: `optimistic-${Date.now()}`,
        bodyHTML: content.trim(),
        createdAt: new Date().toISOString(),
        author: {
          login: nickname.trim() || '匿名访客',
          avatarUrl: '',
          url: '',
        },
        replyCount: 0,
      };
      window.dispatchEvent(new CustomEvent('guestbook:optimistic-comment', {
        detail: optimisticComment,
      }));

      setContent('');
      try {
        localStorage.removeItem(DRAFT_KEY_CONTENT);
        // Keep nickname for convenience
      } catch {
        // ignore
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      window.dispatchEvent(new CustomEvent('guestbook:letter-sent'));
      onPosted?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="font-mono text-[10px] text-red-500 tracking-wide">{error}</p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="font-mono text-[10px] text-[#c9a96e] tracking-wide"
        >
          发布成功！
        </motion.p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="昵称（可选）"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={30}
          className="flex-1 min-w-0 px-3 py-2 border border-[#e0d5c0] bg-white font-mono text-[12px] text-[#555] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a96e] transition-colors"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="shrink-0 px-6 py-2 border border-[#c9a96e] bg-transparent font-mono text-[10px] text-[#c9a96e] tracking-[0.15em] uppercase hover:bg-[#c9a96e] hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? '...' : '发布'}
        </button>
      </div>
      <div>
        <textarea
          placeholder="如果你从这里路过，欢迎留下一句话。可以是对某张照片的感受，也可以只是打个招呼。"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
          required
          className="w-full px-3 py-2 border border-[#e0d5c0] bg-white font-mono text-[12px] text-[#555] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a96e] transition-colors resize-none"
        />
      </div>
      <div className="flex justify-end">
        <span className={`font-mono text-[9px] tracking-wide transition-colors ${content.length >= 1900 ? 'text-red-400' : 'text-[#ccc]'}`}>
          {content.length}/2000
        </span>
      </div>
    </form>
  );
}
