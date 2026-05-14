'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EntranceOverlay() {
  const [phase, setPhase] = useState(0); 
  const [done, setDone] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('entrance-seen');
    if (visited) {
      setDone(true);
      return;
    }

    // Phase 1: Small intro text
    const t1 = setTimeout(() => setPhase(1), 300);
    // Phase 2: Main Logo with focus/blur effect
    const t2 = setTimeout(() => setPhase(2), 1600);
    // Phase 3: Fade out logo
    const t3 = setTimeout(() => setPhase(3), 3600);
    // Phase 4: Slide up the curtain
    const t4 = setTimeout(() => setPhase(4), 4400);
    // Done: Unmount
    const t5 = setTimeout(() => {
      setDone(true);
      sessionStorage.setItem('entrance-seen', '1');
    }, 5600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  if (done) return null;

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          className="fixed inset-0 z-[300] bg-[#050505] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Phase 1: Minimalist Intro */}
          <AnimatePresence>
            {phase === 1 && (
              <motion.p
                className="absolute font-mono text-[9px] text-[#666] tracking-[0.4em] uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Photography Portfolio
              </motion.p>
            )}
          </AnimatePresence>

          {/* Phase 2: Cinematic Focus Reveal */}
          <AnimatePresence>
            {phase === 2 && (
              <motion.div className="absolute flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.95 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.05 }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <svg viewBox="0 0 200 140" fill="none" className="w-[120px] h-auto text-white/90" xmlns="http://www.w3.org/2000/svg">
                    <g fill="currentColor">
                      <path d="M28 18 L28 122 L38 122 L38 74 L82 74 L82 122 L92 122 L92 18 L82 18 L82 66 L38 66 L38 18 Z" />
                      <path d="M18 18 L42 18 L40 22 L20 22 Z" />
                      <path d="M78 18 L102 18 L100 22 L80 22 Z" />
                      <path d="M18 118 L42 118 L40 122 L20 122 Z" />
                      <path d="M78 118 L102 118 L100 122 L80 122 Z" />
                      <path d="M82 66 L82 74 L158 74 L108 122 L162 122 L162 114 L124 114 L174 66 L174 58 L92 58 L92 66 Z" />
                      <path d="M80 58 L104 58 L102 62 L82 62 Z" />
                      <path d="M160 118 L184 118 L182 122 L162 122 Z" />
                    </g>
                  </svg>
                </motion.div>
                
                {/* Elegant subtle line */}
                <motion.div 
                  className="h-px bg-white/20 mt-6"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '40px', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
