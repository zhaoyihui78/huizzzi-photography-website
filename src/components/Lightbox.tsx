'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '@/data/series';

interface LightboxProps {
  photo: Photo | null;
  seriesTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function Lightbox({ photo, seriesTitle, isOpen, onClose, onPrev, onNext }: LightboxProps) {
  const [loaded, setLoaded] = useState(false);
  const [direction, setDirection] = useState(0); // -1 prev, 1 next, 0 initial

  // Keep last photo for exit animation when photo becomes null
  const lastPhotoRef = useRef<Photo | null>(photo);
  if (photo) lastPhotoRef.current = photo;
  const displayPhoto = photo || lastPhotoRef.current;

  // Preload current + adjacent images
  useEffect(() => {
    if (!displayPhoto) return;
    setLoaded(false);
    const img = new window.Image();
    img.src = displayPhoto.src;
    img.onload = () => setLoaded(true);
    if (img.complete) setLoaded(true);
  }, [displayPhoto?.src]);

  useEffect(() => {
    if (!isOpen) setLoaded(false);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) {
        setDirection(-1);
        onPrev();
      }
      if (e.key === 'ArrowRight' && onNext) {
        setDirection(1);
        onNext();
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen && !displayPhoto) return null;

  // When open, displayPhoto is guaranteed to exist (from lastPhotoRef)
  const p = displayPhoto!;

  const exifText = p.exif
    ? `${p.exif.camera} · ${p.exif.lens} · ${p.exif.aperture} · ${p.exif.shutter} · ${p.exif.iso}`
    : '';

  const hasPrev = !!onPrev;
  const hasNext = !!onNext;

  // Slide variants for image change
  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/96 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Close button – highest z-index */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-8 right-8 font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase hover:text-white/60 transition-colors duration-500 z-30 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            Close
          </motion.button>

          {/* Left navigation arrow */}
          {hasPrev && (
            <button
              className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-32 flex items-center justify-center z-20 cursor-pointer group opacity-0 hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => { e.stopPropagation(); setDirection(-1); onPrev(); }}
            >
              <span className="font-mono text-[14px] text-white/25 tracking-[0.1em] group-hover:text-white/60 transition-colors duration-300">
                ←
              </span>
            </button>
          )}

          {/* Right navigation arrow */}
          {hasNext && (
            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-32 flex items-center justify-center z-20 cursor-pointer group opacity-0 hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => { e.stopPropagation(); setDirection(1); onNext(); }}
            >
              <span className="font-mono text-[14px] text-white/25 tracking-[0.1em] group-hover:text-white/60 transition-colors duration-300">
                →
              </span>
            </button>
          )}

          {/* Image container */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="relative max-w-[82vw] max-h-[75vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border border-white/10 border-t-white/30 rounded-full animate-spin" />
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={p.src}
                src={p.src}
                alt={p.alt}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className={`
                  max-w-full max-h-[75vh] w-auto h-auto object-contain
                  transition-all duration-700 ease-out
                  ${loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-[1.02]'}
                `}
                draggable={false}
              />
            </AnimatePresence>
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="mt-10 text-center max-w-xl px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-heading text-[13px] text-white/80 tracking-wide mb-2">
              {p.alt}
            </p>
            {seriesTitle && (
              <p className="font-mono text-[9px] text-white/25 tracking-[0.2em] uppercase mb-4">
                {seriesTitle}
              </p>
            )}
            {exifText && (
              <p className="font-mono text-[8px] text-white/20 tracking-[0.15em]">
                {exifText}
              </p>
            )}
            <p className="font-mono text-[8px] text-white/10 tracking-[0.12em] mt-6 uppercase">
              Press ESC to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
