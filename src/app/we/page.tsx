'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { verifyPassword, photos, meetings, cnNumerals } from './data';

/* ---------- Portal ---------- */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ---------- Types ---------- */
interface Note {
  id: string;
  text: string;
  timestamp: number;
  author: 'me' | 'her';
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

/* ---------- Lock Screen ---------- */
function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number>(0);

  useEffect(() => {
    const raw = localStorage.getItem('we_lock');
    if (raw) setLockedUntil(parseInt(raw, 10));
  }, []);

  const isLocked = Date.now() < lockedUntil;
  const lockSeconds = isLocked ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isLocked) return;
      if (verifyPassword(password)) {
        localStorage.removeItem('we_attempts');
        localStorage.removeItem('we_lock');
        localStorage.setItem('we_unlocked', '1');
        onUnlock();
      } else {
        const attempts = (parseInt(localStorage.getItem('we_attempts') || '0', 10) + 1);
        localStorage.setItem('we_attempts', attempts.toString());
        if (attempts >= 5) {
          const until = Date.now() + 60000;
          localStorage.setItem('we_lock', until.toString());
          setLockedUntil(until);
        }
        setError(true);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    },
    [password, onUnlock, isLocked]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-sm px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-stone-400"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-light tracking-wide text-stone-800 mb-2">
            Our Space
          </h1>
          <p className="text-sm text-stone-400 font-light">
            This place is just for us.
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className={shaking ? 'animate-shake' : ''}
        >
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder={isLocked ? `Locked for ${lockSeconds}s` : 'Enter password'}
              disabled={isLocked}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors text-center tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && !isLocked && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-400 text-xs mt-3"
              >
                Incorrect password
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full mt-4 py-3 bg-stone-800 text-white rounded-lg text-sm tracking-wide hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocked ? `Retry in ${lockSeconds}s` : 'Unlock'}
          </button>
        </motion.form>
      </div>
    </motion.div>
  );
}

/* ---------- Lightbox ---------- */
function Lightbox({
  index,
  onClose,
  onPrev,
  onNext,
  audioRef,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const photo = photos[index];
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
      // Auto-play music when story starts
      audioRef.current?.play().catch(() => {
        // Browser may block autoplay
      });

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
  }, [isStoryMode, onNext, audioRef]);

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

/* ---------- Audio Player ---------- */
function AudioPlayer({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setError(true));
    }
    setPlaying(!playing);
  }, [playing, audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    const onError = () => setError(true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioRef]);

  const format = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-full px-4 py-2">
      <audio ref={audioRef} src="/works/audio/等你的季节.mp3" preload="metadata" />

      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-colors flex-shrink-0"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-500 truncate">等你的季节</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-stone-300 tabular-nums w-8 text-right">
            {format(currentTime)}
          </span>
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-400 rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-300 tabular-nums w-8">
            {format(duration)}
          </span>
        </div>
      </div>

      {error && (
        <span className="text-[10px] text-amber-500 whitespace-nowrap">
          请添加音频文件
        </span>
      )}
    </div>
  );
}

/* ---------- Notes ---------- */
function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState<'me' | 'her'>('me');
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncCode, setSyncCode] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('we_notes');
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(
    (next: Note[]) => {
      setNotes(next);
      localStorage.setItem('we_notes', JSON.stringify(next));
    },
    []
  );

  const add = useCallback(() => {
    if (!text.trim()) return;
    const note: Note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      timestamp: Date.now(),
      author,
    };
    save([...notes, note]);
    setText('');
  }, [text, author, notes, save]);

  const remove = useCallback(
    (id: string) => {
      save(notes.filter((n) => n.id !== id));
    },
    [notes, save]
  );

  const exportSync = useCallback(() => {
    const code = btoa(encodeURIComponent(JSON.stringify(notes)));
    setSyncCode(code);
  }, [notes]);

  const importSync = useCallback(() => {
    try {
      const decoded = decodeURIComponent(atob(syncCode));
      const imported: Note[] = JSON.parse(decoded);
      if (Array.isArray(imported)) {
        save(imported);
        setSyncCode('');
        setSyncOpen(false);
      }
    } catch {
      alert('同步码无效');
    }
  }, [syncCode, save]);

  return (
    <div className="mt-20 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-light text-stone-700 tracking-wide">便签</h2>
        <button
          onClick={() => setSyncOpen(!syncOpen)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          {syncOpen ? '关闭' : '同步'}
        </button>
      </div>

      <AnimatePresence>
        {syncOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value)}
                  placeholder="粘贴同步码..."
                  className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded text-sm focus:outline-none focus:border-stone-400"
                />
                <button
                  onClick={importSync}
                  className="px-4 py-2 bg-stone-800 text-white rounded text-sm hover:bg-stone-700 transition-colors"
                >
                  导入
                </button>
              </div>
              <button
                onClick={exportSync}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                生成同步码
              </button>
              {syncCode && (
                <p className="text-[10px] text-stone-300 break-all">{syncCode}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="写一段话..."
          rows={3}
          className="w-full bg-transparent resize-none focus:outline-none text-sm text-stone-700 placeholder:text-stone-300"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <button
              onClick={() => setAuthor('me')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                author === 'me'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-400 border border-stone-200'
              }`}
            >
              我
            </button>
            <button
              onClick={() => setAuthor('her')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                author === 'her'
                  ? 'bg-rose-400 text-white'
                  : 'bg-white text-stone-400 border border-stone-200'
              }`}
            >
              她
            </button>
          </div>
          <button
            onClick={add}
            disabled={!text.trim()}
            className="px-4 py-1.5 bg-stone-800 text-white rounded text-xs hover:bg-stone-700 transition-colors disabled:opacity-30"
          >
            发送
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.length === 0 && (
          <p className="text-center text-sm text-stone-300 py-8">还没有便签，写第一条吧</p>
        )}
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-4 rounded-lg border ${
              note.author === 'her'
                ? 'bg-rose-50/50 border-rose-100'
                : 'bg-white border-stone-100'
            }`}
          >
            <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{note.text}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-stone-300">
                {note.author === 'me' ? '我' : '她'} · {new Date(note.timestamp).toLocaleDateString()}
              </span>
              <button
                onClick={() => remove(note.id)}
                className="text-[10px] text-stone-300 hover:text-red-400 transition-colors"
              >
                删除
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function WePage() {
  const searchParams = useSearchParams();
  const [unlocked, setUnlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const forceAuth = searchParams.get('auth') === '1';

  useEffect(() => {
    if (forceAuth) {
      setUnlocked(false);
      setLoaded(true);
      setShowIntro(false);
      setIntroDone(false);
      return;
    }

    const isUnlocked = localStorage.getItem('we_unlocked') === '1';
    setUnlocked(isUnlocked);
    setLoaded(true);
    if (isUnlocked) {
      const seen = sessionStorage.getItem('we_intro_seen');
      if (!seen) setShowIntro(true);
      else setIntroDone(true);
    }
  }, [forceAuth]);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    const seen = sessionStorage.getItem('we_intro_seen');
    if (!seen) setShowIntro(true);
    else setIntroDone(true);
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

  if (!loaded) return null;

  if (!unlocked) {
    return (
      <Portal>
        <LockScreen onUnlock={handleUnlock} />
      </Portal>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        {introDone && (
          <>
            <DustParticles />
            <LightCursor />
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
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
            <div className="flex justify-center">
              <AudioPlayer audioRef={audioRef} />
            </div>
          </motion.div>

          {/* Meeting Chronicle */}
          <MeetingChronicle openLightbox={openLightbox} />

          {/* Notes */}
          <NotesSection />
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
              audioRef={audioRef}
            />
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
