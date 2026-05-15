'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface GiscusComment {
  id: string;
  bodyHTML: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
    url: string;
  };
}

interface LetterModalProps {
  comment: GiscusComment;
  stripHtml: (html: string) => string;
  formatDate: (iso: string) => string;
  onClose: () => void;
}

export default function LetterModal({
  comment,
  stripHtml,
  formatDate,
  onClose,
}: LetterModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 z-[1] bg-[#0a0a0a]/40 backdrop-blur-sm" />

      {/* Letter */}
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-[2] w-full max-w-lg bg-[#fdfcf9] p-8 md:p-12 shadow-2xl"
      >
        {/* Tape */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-6 bg-[rgba(232,220,190,0.8)] rotate-[-1deg]" />

        {/* Paper texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        <div className="relative z-10">
          {/* Content */}
          <p className="font-mono text-[13px] leading-[2] text-[#444] whitespace-pre-wrap break-words">
            {stripHtml(comment.bodyHTML)}
          </p>

          {/* Divider */}
          <div className="mt-8 mb-4 w-8 h-px bg-[#e0d5c0]" />

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={comment.author.avatarUrl}
                alt={comment.author.login}
                className="w-7 h-7 rounded-full grayscale"
              />
              <span className="font-mono text-[11px] text-[#c9a96e] tracking-[0.1em]">
                {comment.author.login}
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#ccc] tracking-[0.08em]">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Close hint */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 font-mono text-[9px] text-[#ccc] tracking-[0.15em] uppercase hover:text-[#888] transition-colors cursor-pointer"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
