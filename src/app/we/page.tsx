'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { photos, meetings, cnNumerals } from './data';

/* ---------- Portal ---------- */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ---------- Intro Sequence ---------- */
function IntroSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3800);
    const t4 = setTimeout(() => setPhase(4), 4800);
    const t5 = setTimeout(() => {
      setPhase(5);
      onDone();
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: '#050505',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Phase 1: small intro text */}
          <AnimatePresence>
            {phase === 1 && (
              <motion.p
                className="absolute font-mono text-[9px] text-[#666] tracking-[0.4em] uppercase"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Just for us
              </motion.p>
            )}
          </AnimatePresence>

          {/* Phase 2: main title with blur reveal */}
          <AnimatePresence>
            {phase === 2 && (
              <motion.div className="absolute flex flex-col items-center">
                <motion.h1
                  className="font-heading text-white/90 text-[28px] sm:text-[22px] tracking-tight whitespace-nowrap"
                  initial={{ opacity: 0, filter: 'blur(16px)', letterSpacing: '0em', scale: 0.9 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', letterSpacing: '0.3em', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.08 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Our Space
                </motion.h1>
                <motion.div
                  className="h-px bg-white/20 mt-5"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '48px', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Typewriter Text ---------- */
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        if (indexRef.current < text.length) {
          setDisplayed(text.slice(0, indexRef.current + 1));
          indexRef.current += 1;
        } else {
          clearInterval(interval);
        }
      }, 55);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span>
      {displayed}
      <span
        className="inline-block w-[1px] h-[1em] ml-[1px] align-middle transition-opacity duration-100"
        style={{
          background: '#a89888',
          opacity: showCursor ? 1 : 0,
        }}
      />
    </span>
  );
}

/* ---------- Dust Particles Canvas ---------- */
function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15 - 0.05,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    let anim: number;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 185, 165, ${p.alpha})`;
        ctx.fill();
      }
      anim = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[90]"
      style={{ mixBlendMode: 'screen', opacity: 0.6 }}
    />
  );
}

/* ---------- Mouse Following Light ---------- */
function LightCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[85] transition-opacity duration-1000"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(200, 180, 155, 0.04), transparent 60%)`,
      }}
    />
  );
}

/* ---------- Meeting Chronicle ---------- */
function MeetingChronicle({ openLightbox }: { openLightbox: (index: number) => void }) {
  return (
    <div className="space-y-0">
      {meetings.map((meeting, mi) => (
        <motion.section
          key={meeting.nth}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: mi * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="py-10 md:py-14 border-t border-stone-100 first:border-t-0"
        >
          <div className="flex flex-col md:flex-row md:gap-10 lg:gap-16">
            {/* Left: meeting info */}
            <div className="md:w-36 lg:w-40 flex-shrink-0 mb-5 md:mb-0 md:pt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                <h3
                  className="font-heading text-[17px] md:text-lg font-light tracking-wide"
                  style={{ color: '#5c4a3a' }}
                >
                  {meeting.name?.trim() || `第${cnNumerals[meeting.nth - 1]}次见面`}
                </h3>
              </div>
              <p className="text-[10px] text-stone-400 font-mono tracking-wide pl-3.5">
                {meeting.date}
              </p>
              <p className="text-[10px] text-stone-300 font-mono tracking-wide pl-3.5 mt-0.5">
                · {meeting.daysAgo}天前
              </p>
            </div>

            {/* Right: photos */}
            <div className="flex-1">
              {meeting.photoNums.length === 0 ? (
                <div className="flex items-center justify-center h-24 md:h-32 rounded-xl border border-dashed border-stone-200 bg-stone-50/50">
                  <p className="text-[11px] text-stone-300 italic tracking-wide">
                    这次没有留下照片
                  </p>
                </div>
              ) : (
                <div className="columns-2 md:columns-3 gap-3 space-y-3">
                  {meeting.photoNums.map((num) => {
                    const photo = photos.find((p) => p.num === num)!;
                    const globalIndex = parseInt(num) - 1;
                    return (
                      <div
                        key={num}
                        className="break-inside-avoid"
                      >
                        <div
                          className="relative overflow-hidden rounded-lg bg-stone-100 group cursor-pointer"
                          onClick={() => openLightbox(globalIndex)}
                        >
                          <Image
                            src={photo.thumb}
                            alt={`Moment ${num}`}
                            width={photo.width}
                            height={photo.height}
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      ))}
    </div>
  );
}

/* ---------- Lightbox ---------- */
function Lightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(false);
    const img = new window.Image();
    img.src = photo.src;
    img.onload = () => setLoaded(true);
    if (img.complete) setLoaded(true);
  }, [photo.src]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') { setIsStoryMode(false); onPrev(); }
      if (e.key === 'ArrowRight') { setIsStoryMode(false); onNext(); }
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (isStoryMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0);
      const interval = 5000;
      const tick = 50;
      let elapsed = 0;

      progressTimerRef.current = setInterval(() => {
        elapsed += tick;
        setProgress(Math.min((elapsed / interval) * 100, 100));
      }, tick);

      storyTimerRef.current = setInterval(() => {
        onNext();
        elapsed = 0;
        setProgress(0);
      }, interval);

      return () => {
        if (storyTimerRef.current) clearInterval(storyTimerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };
    } else {
      setProgress(0);
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
  }, [isStoryMode, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0c0a08' }}
      onClick={onClose}
    >
      {/* Paper grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Light leak effect */}
      <div
        className="fixed inset-0 pointer-events-none z-[55] opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(180, 120, 60, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(200, 160, 100, 0.1) 0%, transparent 40%)',
        }}
      />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-[70] flex items-center justify-between px-6 md:px-10 py-5"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(200,180,160,0.35)' }}>
            {String(index + 1).padStart(2, '0')} — {String(photos.length).padStart(2, '0')}
          </span>
          {isStoryMode && (
            <div className="w-24 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(200,180,160,0.15)' }}>
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: 'rgba(200,180,160,0.5)' }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); setIsStoryMode(!isStoryMode); }}
            className="font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 hover:opacity-80 cursor-pointer"
            style={{ color: isStoryMode ? 'rgba(200,180,160,0.6)' : 'rgba(200,180,160,0.3)' }}
          >
            {isStoryMode ? 'Pause Story' : 'Play Story'}
          </button>
          <button
            onClick={onClose}
            className="font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 hover:opacity-80 cursor-pointer"
            style={{ color: 'rgba(200,180,160,0.3)' }}
          >
            Close
          </button>
        </div>
      </motion.div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-16 relative z-[70]">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-5 md:left-10 top-1/2 -translate-y-1/2 w-12 h-24 flex items-center justify-center z-10 cursor-pointer group opacity-0 hover:opacity-100 transition-opacity duration-500"
        >
          <span className="font-heading text-[18px] tracking-[0.1em] transition-colors duration-300" style={{ color: 'rgba(200,180,160,0.2)' }}>
            ←
          </span>
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={photo.num}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isStoryMode ? 1.2 : 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="relative p-3 pb-16 md:p-4 md:pb-20 shadow-2xl"
              style={{ background: '#f5f3ef' }}
              initial={isStoryMode ? { opacity: 0, scale: 0.96, y: 10 } : { opacity: 0, scale: 0.92 }}
              animate={isStoryMode
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 1, scale: 1 }
              }
              exit={isStoryMode ? { opacity: 0, scale: 1.02, y: -8 } : { opacity: 0, scale: 0.96 }}
              transition={{
                duration: isStoryMode ? 1.0 : 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="overflow-hidden">
                {loaded ? (
                  <motion.img
                    src={photo.src}
                    alt={`Moment ${photo.num}`}
                    className="max-w-full max-h-[65vh] w-auto h-auto object-contain"
                    draggable={false}
                    initial={{ scale: 1 }}
                    animate={isStoryMode
                      ? { scale: 1.08 }
                      : { scale: 1 }
                    }
                    transition={isStoryMode
                      ? { duration: 5, ease: 'linear' }
                      : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    }
                  />
                ) : (
                  <div className="w-[60vw] h-[50vh] flex items-center justify-center" style={{ background: '#e8e4de' }}>
                    <div className="w-8 h-8 border border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center h-14 md:h-16">
                <p className="font-heading text-[13px] md:text-[15px] italic tracking-wide" style={{ color: '#8a7e72' }}>
                  Moment {photo.num}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 w-12 h-24 flex items-center justify-center z-10 cursor-pointer group opacity-0 hover:opacity-100 transition-opacity duration-500"
        >
          <span className="font-heading text-[18px] tracking-[0.1em] transition-colors duration-300" style={{ color: 'rgba(200,180,160,0.2)' }}>
            →
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-[70] flex items-center justify-center gap-8 py-5"
      >
        <span className="font-mono text-[9px] tracking-[0.15em]" style={{ color: 'rgba(200,180,160,0.2)' }}>
          ← → Navigate
        </span>
        <span className="font-mono text-[9px] tracking-[0.15em]" style={{ color: 'rgba(200,180,160,0.2)' }}>
          ·
        </span>
        <span className="font-mono text-[9px] tracking-[0.15em]" style={{ color: 'rgba(200,180,160,0.2)' }}>
          ESC to Close
        </span>
      </motion.div>
    </motion.div>
  );
}

function LettersPreview() {
  const router = useRouter();
  const [configured, setConfigured] = useState(true);
  const [currentUser, setCurrentUser] = useState<'hui' | 'dudu' | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnread = async () => {
      try {
        const response = await fetch('/api/we-letters/unread', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (payload.configured === false) {
          setConfigured(false);
          return;
        }

        if (payload.currentUser === 'hui' || payload.currentUser === 'dudu') {
          setCurrentUser(payload.currentUser);
        }

        if (typeof payload.unreadCount === 'number') {
          setUnreadCount(payload.unreadCount);
        }
      } catch {
        // Ignore preview errors.
      }
    };

    void loadUnread();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/we-auth/logout', { method: 'POST' });
    } finally {
      router.replace('/we/login');
      router.refresh();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#eadfce] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,247,241,0.98))] px-6 py-7 shadow-[0_24px_70px_rgba(96,73,48,0.05)] md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.08),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_48%)]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-[#bda58a]">
            Private Mailbox
          </p>
          <h3 className="text-[22px] md:text-[24px] font-light tracking-[0.05em] text-stone-700">
            给彼此留下可以慢慢拆开的信
          </h3>
          <p className="mt-3 text-[13px] leading-[1.95] text-[#8f7c69]">
            用各自的名字慢慢写信、回信，把想留住的话安静地折好，放进只属于彼此的信箱里。
          </p>
          <p className="mt-3 text-[12px] leading-[1.9] text-[#ab977f]">
            它不急着被读完，也不会像聊天记录一样很快沉下去。
          </p>
        </div>

        <div className="flex flex-col gap-3 md:min-w-[330px] md:max-w-[360px]">
          <div className="rounded-[22px] border border-[#efe2d3] bg-white/78 p-3 shadow-[0_12px_30px_rgba(96,73,48,0.05)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#bea991]">
                  Unread Letters
                </p>
                <p className="mt-2 text-[12px] text-[#8a7561]">
                  {currentUser
                    ? `${currentUser === 'hui' ? 'Hui' : 'DuDu'} 还有 ${unreadCount} 封未拆开的信`
                    : `还有 ${unreadCount} 封未拆开的信`}
                </p>
              </div>
              <div className="flex h-12 min-w-[54px] items-center justify-center rounded-[18px] border border-[#eadcc9] bg-[#fcf7ef] px-3 font-serif text-[21px] text-[#7b6249] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/we/letters"
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-[#6d5846] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#5b4939]"
            >
              Open Letters
              <span className="h-px w-6 bg-white/70" />
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white/78 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f7c69] transition-colors hover:border-[#d9c0a1] hover:text-[#4f4033]"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {!configured && (
        <p className="mt-5 text-[12px] leading-[1.8] text-[#b0765a]">
          当前服务端还没有配置 Gist 信箱环境变量，页面入口已经准备好，但需要补上
          `WE_LETTERS_GIST_ID` 和 `WE_LETTERS_GITHUB_TOKEN` 才能真正开始收发信。
        </p>
      )}
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function WePage() {
  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
    const seen = sessionStorage.getItem('we_intro_seen');
    if (!seen) {
      setShowIntro(true);
    } else {
      setIntroDone(true);
    }
  }, []);

  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem('we_intro_seen', '1');
    setShowIntro(false);
    setIntroDone(true);
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      return i === 0 ? photos.length - 1 : i - 1;
    });
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      return i === photos.length - 1 ? 0 : i + 1;
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!musicEnabled) {
      audio.pause();
      return;
    }

    if (showIntro && !introDone) return;

    audio.volume = 0.42;
    audio.loop = true;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => setMusicBlocked(false))
        .catch(() => setMusicBlocked(true));
    }
  }, [musicEnabled, showIntro, introDone]);

  if (!loaded) return null;

  return (
    <>
      <audio ref={audioRef} preload="none" loop playsInline>
        <source src="/works/audio/等你的季节.m4a" type="audio/mp4" />
        <source src="/works/audio/等你的季节.mp3" type="audio/mpeg" />
      </audio>

      <main className="min-h-screen bg-[#fdf9f3]">
        {introDone && (
          <>
            <DustParticles />
            <LightCursor />
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section id="moments" className="scroll-mt-24 md:scroll-mt-16">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4b39f] mb-4">
                Private Archive
              </p>
              <h1
                className="font-heading text-[1.75rem] md:text-[2.25rem] font-extralight tracking-[0.1em] text-stone-800 mb-3"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Our Moments
              </h1>
              <p
                className="text-[13px] text-stone-400 font-light tracking-[0.12em] italic mb-8"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <Typewriter text="Even if we can't meet You are the hope in my weary life" delay={introDone ? 800 : 0} />
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !musicEnabled;
                    setMusicEnabled(next);
                    if (next) setMusicBlocked(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${musicEnabled ? 'bg-[#b59a5b]' : 'bg-stone-300'}`} />
                  {musicEnabled ? 'Music On' : 'Music Off'}
                </button>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-stone-300">
                  low data audio
                </span>
              </div>

              {musicBlocked && (
                <p className="mt-3 text-[11px] text-stone-400">
                  浏览器拦截了自动播放，点一下上面的 `Music On` 就能恢复。
                </p>
              )}
            </motion.div>
          </section>

          <section id="timeline" className="scroll-mt-24 md:scroll-mt-16">
            <div className="mb-8 md:mb-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#c4b39f] mb-3">
                Timeline
              </p>
              <h2 className="font-heading text-[22px] md:text-[26px] font-light tracking-[0.06em] text-stone-700">
                Every Meeting We Kept
              </h2>
            </div>

            <MeetingChronicle openLightbox={openLightbox} />
          </section>

          <section className="scroll-mt-24 md:scroll-mt-16">
            <div className="mt-16 md:mt-20">
              <div className="mb-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#c4b39f] mb-3">
                  Letters
                </p>
                <h2 className="font-heading text-[22px] md:text-[26px] font-light tracking-[0.06em] text-stone-700">
                  Letters We Leave For Each Other
                </h2>
              </div>

              <LettersPreview />
            </div>
          </section>
        </div>
      </main>

      {/* IntroSequence — rendered via Portal to escape PageTransition transform */}
      {showIntro && (
        <Portal>
          <IntroSequence onDone={handleIntroDone} />
        </Portal>
      )}

      {/* Lightbox — rendered via Portal to escape PageTransition transform */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Portal>
            <Lightbox
              index={lightboxIndex}
              onClose={closeLightbox}
              onPrev={prevPhoto}
              onNext={nextPhoto}
            />
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
