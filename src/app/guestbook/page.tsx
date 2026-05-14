'use client';

import { motion } from 'framer-motion';
import FadeIn from '@/components/FadeIn';
import GiscusComments from '@/components/GiscusComments';

export default function GuestbookPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <main className="min-h-full px-10 py-14 max-w-[1400px] mx-auto">
      <FadeIn delay={0}>
        <h1 className="font-heading text-[15px] font-normal tracking-tight text-[#111111] mb-4">
          Guestbook
        </h1>
        <p className="font-mono text-[9px] text-[#cccccc] tracking-[0.25em] uppercase mb-16">
          Leave a trace · 路过留痕
        </p>
      </FadeIn>

      <motion.div
        className="max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={itemVariants}
          className="text-[13px] text-[#888888] leading-[2] font-light mb-12"
        >
          如果你从这里路过，欢迎留下一句话。可以是对某张照片的感受，
          也可以只是打个招呼。这个角落像一本打开的笔记本，记录每一次偶然的相遇。
        </motion.p>

        <motion.div variants={itemVariants}>
          <GiscusComments />
        </motion.div>
      </motion.div>
    </main>
  );
}
