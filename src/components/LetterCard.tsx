'use client';

import { motion } from 'framer-motion';

interface LetterCardProps {
  text: string;
  author: string;
  date: string;
  rotate: number;
  offsetY: number;
  index: number;
  onClick: () => void;
}

export default function LetterCard({
  text,
  author,
  date,
  rotate,
  offsetY,
  index,
  onClick,
}: LetterCardProps) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -40,
      rotate: rotate - 6,
      scale: 0.92,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: rotate,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        delay: index * 0.05,
      },
    },
  };

  const displayText =
    text.length > 80 ? text.slice(0, 80) + '...' : text;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -6,
        rotate: 0,
        scale: 1.03,
        transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
      }}
      onClick={onClick}
      className="relative cursor-pointer select-none will-change-transform"
      style={{
        marginTop: offsetY > 0 ? offsetY : 0,
        marginBottom: offsetY < 0 ? Math.abs(offsetY) : 0,
      }}
    >
      {/* Tape */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-5 bg-[rgba(232,220,190,0.75)] z-10"
        style={{ transform: `translateX(-50%) rotate(${-rotate * 0.5}deg)` }}
      />

      {/* Card */}
      <div className="relative bg-[#fdfcf9] p-5 md:p-6 shadow-[0_3px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-shadow duration-300">
        {/* Subtle warm edge */}
        <div className="absolute inset-0 pointer-events-none border border-[rgba(200,180,150,0.15)]" />

        {/* Content */}
        <div className="relative z-10">
          <p className="font-mono text-[12px] leading-[1.85] text-[#555] whitespace-pre-wrap break-words min-h-[60px]">
            {displayText}
          </p>

          <div className="mt-4 flex items-end justify-between">
            <span className="font-mono text-[10px] text-[#c9a96e] tracking-[0.1em]">
              {author}
            </span>
            <span className="font-mono text-[9px] text-[#ccc] tracking-[0.08em]">
              {date}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
