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
                <motion.h1
                  className="font-heading text-white/90 text-[22px] tracking-tight whitespace-nowrap"
                  initial={{ opacity: 0, filter: 'blur(12px)', letterSpacing: '0em', scale: 0.95 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', letterSpacing: '0.25em', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.05 }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  HUI ZZZI
                </motion.h1>
                
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
