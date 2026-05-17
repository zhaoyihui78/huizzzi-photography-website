'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#ece3cf]/70 z-[149]" />
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#b59a5b] origin-left z-[150] shadow-[0_0_10px_rgba(181,154,91,0.28)]"
        style={{ scaleX }}
      />
    </>
  );
}
