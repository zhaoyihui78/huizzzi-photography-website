'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoLightboxProps {
  src: string;
  poster: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoLightbox({ src, poster, title, isOpen, onClose }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
    },
    [onClose, togglePlay]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setIsPlaying(false);
      setProgress(0);
      setShowControls(true);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(p);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleCanPlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/98 backdrop-blur-xl"
          onClick={onClose}
          onMouseMove={handleMouseMove}
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="absolute top-8 right-8 font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase hover:text-white/60 transition-colors duration-500 z-30 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            Close
          </motion.button>

          {/* Video container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="relative w-[85vw] max-w-[1400px] aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleCanPlay}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              playsInline
              autoPlay
            />

            {/* Center play / pause button overlay */}
            <AnimatePresence>
              {(!isPlaying || showControls) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {!isPlaying && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center hover:border-white/60 hover:bg-white/5 transition-all duration-300 pointer-events-auto cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5 opacity-80">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom controls bar */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.35 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-12"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Progress bar */}
                  <div
                    className="w-full h-[2px] bg-white/15 cursor-pointer group mb-4"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full bg-white/60 group-hover:bg-white/80 transition-colors duration-300 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Play / pause */}
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="text-white/50 hover:text-white/80 transition-colors duration-300 cursor-pointer"
                      >
                        {isPlaying ? (
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

                      {/* Time */}
                      <span className="font-mono text-[9px] text-white/30 tracking-wider">
                        {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="font-mono text-[9px] text-white/25 tracking-[0.15em] uppercase">
                      {title}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
