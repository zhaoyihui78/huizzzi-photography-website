'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith('/we')) return '/we';
  if (value.startsWith('/we/login')) return '/we';
  return value;
}

export default function WeLoginPage() {
  const router = useRouter();
  const [nextPath] = useState(() => {
    if (typeof window === 'undefined') {
      return '/we';
    }

    return getSafeNextPath(new URLSearchParams(window.location.search).get('next'));
  });

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!password.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/we-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          next: nextPath,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || 'Unlock failed.');
        return;
      }

      router.replace(payload.redirectTo || nextPath);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fdf9f3] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-[28px] border border-[#ece2d3] bg-white/80 px-7 py-9 shadow-[0_25px_80px_rgba(96,73,48,0.08)] backdrop-blur-sm">
          <div className="text-center mb-9">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-[#ece2d3] bg-[#faf6f0] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[#b59a5b]"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#bfa889] mb-4">
              Private Archive
            </p>
            <h1 className="text-[24px] font-light tracking-[0.06em] text-[#5f4c3d] mb-2">
              Our Space
            </h1>
            <p className="text-sm text-[#a18c77] font-light">
              This place is only for us.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-[#fbf8f3] border border-[#ece2d3] rounded-xl text-[#6d5846] placeholder:text-[#c2b29f] focus:outline-none focus:border-[#cdb58f] transition-colors text-center tracking-[0.18em]"
              autoFocus
            />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[#c26753] text-xs mt-3"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className="w-full mt-5 py-3 rounded-xl bg-[#6d5846] text-white text-sm tracking-[0.16em] uppercase hover:bg-[#5b4939] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Unlocking' : 'Unlock'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
