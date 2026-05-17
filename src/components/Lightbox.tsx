'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '@/data/series';

import LikeButton from './LikeButton';

interface LightboxProps {
  photo: Photo | null;
  seriesTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function Lightbox({ photo, isOpen, onClose, onPrev, onNext }: LightboxProps) {
  const [loaded, setLoaded] = useState(false);
  const [direction, setDirection] = useState(0); // -1 prev, 1 next, 0 initial
  const [isStoryMode, setIsStoryMode] = useState(false);

  // Keep last photo for exit animation when photo becomes null
  const lastPhotoRef = useRef<Photo | null>(photo);
  if (photo) lastPhotoRef.current = photo;
  const displayPhoto = photo || lastPhotoRef.current;

  // Auto Play / Story Mode
  useEffect(() => {
    if (isStoryMode && isOpen) {
      const timer = setInterval(() => {
        if (onNext) {
          setDirection(1);
          onNext();
        } else {
          setIsStoryMode(false);
        }
      }, 5000); // 5 seconds per slide
      return () => clearInterval(timer);
    }
  }, [isStoryMode, isOpen, onNext]);

  // Preload current + adjacent images
  useEffect(() => {
    if (!displayPhoto) return;
    setLoaded(false);

    const img = new window.Image();
    img.src = displayPhoto.src;
    img.onload = () => setLoaded(true);
    if (img.complete) setLoaded(true);
  }, [displayPhoto?.src, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLoaded(false);
      setIsStoryMode(false);
      setDirection(0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) {
        setDirection(-1);
        setIsStoryMode(false);
        onPrev();
      }
      if (e.key === 'ArrowRight' && onNext) {
        setDirection(1);
        setIsStoryMode(false);
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
  const imageVariants: any = {
    enter: () => ({
      scale: isStoryMode ? 1 : 1.05,
      filter: isStoryMode ? 'blur(0px)' : 'blur(10px)',
      opacity: 0,
    }),
    center: {
      scale: 1,
      filter: 'blur(0px)',
      opacity: 1,
      transition: {
        duration: isStoryMode ? 0.4 : 0.8,
        ease: isStoryMode ? [0.25, 0.1, 0.25, 1] : [0.25, 0.1, 0.25, 1],
      }
    },
    exit: () => ({
      scale: isStoryMode ? 1 : 0.95,
      filter: isStoryMode ? 'blur(0px)' : 'blur(10px)',
      opacity: 0,
      transition: { duration: isStoryMode ? 0.3 : 0.8, ease: [0.25, 0.1, 0.25, 1] }
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
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/96 backdrop-blur-xl ${
            isStoryMode ? 'cursor-none' : ''
          }`}
          onClick={onClose}
        >
          {/* Top UI Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isStoryMode ? 0 : 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-30 pointer-events-none"
          >
            {/* Story Mode Toggle */}
            <button
              className="pointer-events-auto flex items-center gap-3 group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsStoryMode(!isStoryMode);
              }}
            >
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors duration-300">
                {isStoryMode ? (
                  <div className="w-2.5 h-2.5 bg-white/70" />
                ) : (
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white/70 border-b-[5px] border-b-transparent ml-1" />
                )}
              </div>
              <span className="font-mono text-[9px] text-white/40 tracking-[0.2em] uppercase group-hover:text-white/80 transition-colors duration-300">
                {isStoryMode ? 'Stop Story' : 'Play Story'}
              </span>
            </button>

            {/* Close button */}
            <button
              className="pointer-events-auto font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase hover:text-white/60 transition-colors duration-500 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
              Close
            </button>
          </motion.div>

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
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="relative w-[90vw] h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border border-white/10 border-t-white/30 rounded-full animate-spin" />
              </div>
            )}

            {isStoryMode ? (
              <AnimatePresence mode="wait">
                {loaded && (
                  <motion.img
                    key={p.src}
                    src={p.src}
                    alt={p.caption || p.alt}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0, scale: 1.02, transition: { opacity: { duration: 0.25 }, scale: { duration: 0.25 } } }}
                    transition={{
                      opacity: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                      scale: { duration: 5.5, ease: 'linear' },
                    }}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    draggable={false}
                  />
                )}
              </AnimatePresence>
            ) : (
              <AnimatePresence mode="wait" custom={direction}>
                {loaded && (
                  <motion.img
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    draggable={false}
                  />
                )}
              </AnimatePresence>
            )}
            </motion.div>

            {/* Cinematic EXIF info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-6 left-8 flex items-center gap-6 z-30 pointer-events-none"
            >
              {exifText && (
                <span className="font-mono text-[9px] text-white/30 tracking-[0.2em]">
                  {exifText}
                </span>
              )}
            </motion.div>
            
            {/* Like Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isStoryMode ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-5 right-8 z-[110]"
              onClick={(e) => e.stopPropagation()}
            >
              <LikeButton photoId={p.src.split('/').pop()?.split('.')[0] || 'unknown'} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
