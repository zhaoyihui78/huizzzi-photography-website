'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EntranceOverlay() {
  const [phase, setPhase] = useState(0); // 0: black, 1: ring, 2: dot, 3: logo, 4: exit
  const [done, setDone] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('entrance-seen');
    if (visited) {
      setDone(true);
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => setPhase(4), 2800);
    const t5 = setTimeout(() => {
      setDone(true);
      sessionStorage.setItem('entrance-seen', '1');
    }, 3600);

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
          className="fixed inset-0 z-[300] bg-[#050505] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Spinning ring */}
          <AnimatePresence>
            {phase >= 1 && phase < 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{
                  opacity: 1,
                  scale: phase === 2 ? 0.15 : 1,
                  rotate: phase === 1 ? 360 : 0,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: phase === 1 ? 0.9 : 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-16 h-16 rounded-full border border-white/30"
              />
            )}
          </AnimatePresence>

          {/* Logo text */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-[18px] text-white/90 tracking-[0.12em]"
              >
                HUI ZZZI
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
