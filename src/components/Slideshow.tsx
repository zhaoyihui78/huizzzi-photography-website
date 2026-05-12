'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '@/data/series';

interface SlideshowProps {
  photos: Photo[];
  labels: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Slideshow({ photos, labels, initialIndex, isOpen, onClose }: SlideshowProps) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INTERVAL = 5000;

  // Sync index when reopening with a different initialIndex
  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex);
      setDirection(0);
      setProgress(0);
    }
  }, [isOpen, initialIndex]);

  const current = photos[index];
  const currentLabel = labels[index];

  const goTo = useCallback(
    (newIndex: number, dir: number) => {
      if (newIndex < 0 || newIndex >= photos.length) return;
      setDirection(dir);
      setIndex(newIndex);
      setProgress(0);
    },
    [photos.length]
  );

  const goNext = useCallback(() => {
    if (index < photos.length - 1) {
      goTo(index + 1, 1);
    } else {
      goTo(0, 1); // loop
    }
  }, [index, photos.length, goTo]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      goTo(index - 1, -1);
    } else {
      goTo(photos.length - 1, -1); // loop
    }
  }, [index, photos.length, goTo]);

  // Keyboard + wheel
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setAutoPlay((prev) => !prev);
      }
    };

    let wheelAccum = 0;
    const onWheel = (e: WheelEvent) => {
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) > 60) {
        if (wheelAccum > 0) goNext();
        else goPrev();
        wheelAccum = 0;
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('wheel', onWheel, { passive: true });
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('wheel', onWheel);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  // Auto play
  useEffect(() => {
    if (!isOpen || !autoPlay) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(0);
      return;
    }

    // Progress bar tick
    const tick = 50;
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + (tick / INTERVAL) * 100;
      });
    }, tick);

    timerRef.current = setTimeout(() => {
      goNext();
    }, INTERVAL);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isOpen, autoPlay, index, goNext]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
  }, [index]);

  if (!isOpen || !current) return null;

  const exifText = current.exif
    ? `${current.exif.camera} · ${current.exif.lens} · ${current.exif.aperture} · ${current.exif.shutter} · ${current.exif.iso}`
    : '';

  const imageVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: dir === 0 ? 1 : 0.96,
    }),
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: dir === 0 ? 1 : 0.96,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center"
          onClick={onClose}
        >
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-white/20 tracking-[0.2em] uppercase">
                Slide
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoPlay((p) => !p);
                }}
                className={`font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer ${
                  autoPlay ? 'text-[#c9a96e]' : 'text-white/20 hover:text-white/50'
                }`}
              >
                {autoPlay ? 'Pause' : 'Auto Play'}
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase hover:text-white/60 transition-colors duration-500 cursor-pointer"
            >
              Close
            </button>
          </motion.div>

          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5 z-20">
            <motion.div
              className="h-full bg-[#c9a96e]/40"
              style={{ width: `${((index) / photos.length) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
            {autoPlay && (
              <div
                className="h-full bg-[#c9a96e]/70 absolute top-0 left-0"
                style={{
                  width: `${((index + progress / 100) / photos.length) * 100}%`,
                  transition: 'width 0.05s linear',
                }}
              />
            )}
          </div>

          {/* Main image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[85vw] max-w-[1400px] h-[78vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left hit area */}
            <button
              className="absolute left-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            />
            {/* Right hit area */}
            <button
              className="absolute right-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={current.src}
                src={current.src}
                alt={current.alt}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                draggable={false}
              />
            </AnimatePresence>
          </motion.div>

          {/* Bottom film strip info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-12 bg-gradient-to-t from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-end justify-between max-w-[1400px] mx-auto">
              <div>
                {/* Film label */}
                <span className="inline-block font-mono text-[8px] tracking-[0.3em] uppercase text-[#c9a96e] bg-black/30 px-3 py-1 mb-3">
                  {currentLabel}
                </span>
                <p className="font-heading text-[14px] text-white/80 tracking-wide">
                  {current.alt}
                </p>
                {exifText && (
                  <p className="font-mono text-[8px] text-white/25 tracking-[0.15em] mt-2">
                    {exifText}
                  </p>
                )}
              </div>

              {/* Index counter */}
              <div className="text-right">
                <p className="font-mono text-[11px] text-white/40 tracking-[0.1em]">
                  {String(index + 1).padStart(2, '0')}
                  <span className="text-white/15 mx-2">/</span>
                  {String(photos.length).padStart(2, '0')}
                </p>
                <p className="font-mono text-[8px] text-white/10 tracking-[0.12em] mt-2 uppercase">
                  {autoPlay ? `Next in ${Math.ceil((INTERVAL - (progress / 100) * INTERVAL) / 1000)}s` : 'Use ← → to navigate'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
