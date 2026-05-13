'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ImageReveal({
  children,
  className = '',
  delay = 0,
}: ImageRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      animate={
        isInView
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, scale: 1.05, filter: 'blur(8px)' }
      }
      transition={{
        duration: 1.2,
        delay,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
