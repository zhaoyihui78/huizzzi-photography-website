'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/FadeIn';
import CommentWall from '@/components/CommentWall';
import GiscusComments from '@/components/GiscusComments';

export default function GuestbookPage() {
  const [writeOpen, setWriteOpen] = useState(false);

  return (
    <main className="min-h-full">
      {/* Header */}
      <section className="px-6 md:px-10 pt-14 pb-6">
        <FadeIn delay={0}>
          <h1 className="font-heading text-[15px] font-normal tracking-tight text-[#111111] mb-3">
            留言墙
          </h1>
          <p className="font-mono text-[9px] text-[#cccccc] tracking-[0.25em] uppercase">
            Guestbook Wall · 路过留痕
          </p>
        </FadeIn>
      </section>

      {/* Scattered Letters Wall */}
      <section className="relative px-4 md:px-10 py-10 md:py-16">
        {/* Desktop background */}
        <div className="absolute inset-0 bg-[#f0ebe3] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative z-10 max-w-[1200px] mx-auto">
          <FadeIn delay={0.1}>
            <p className="text-center font-mono text-[10px] text-[#b8a080] tracking-[0.2em] uppercase mb-10">
              Letters from visitors
            </p>
          </FadeIn>

          <CommentWall />
        </div>
      </section>

      {/* Write a letter — Envelope */}
      <section className="px-6 md:px-10 py-14 max-w-[1200px] mx-auto">
        <FadeIn delay={0}>
          <div className="max-w-2xl mx-auto">
            {/* Envelope closed state */}
            <AnimatePresence mode="wait">
              {!writeOpen && (
                <motion.button
                  key="closed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => setWriteOpen(true)}
                  className="group w-full cursor-pointer"
                >
                  <div className="relative bg-[#f4f1ea] border border-[#e8e4d9] p-8 md:p-12 text-center hover:bg-[#faf8f3] hover:border-[#d6ceb8] transition-colors duration-500">
                    {/* Envelope flap decoration */}
                    <div className="absolute top-0 left-0 right-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-[#e8e4d9] md:border-l-[30px] md:border-r-[30px] md:border-b-[30px]" />

                    <div className="relative z-10 pt-4">
                      <div className="w-10 h-10 mx-auto mb-4 border border-[#c9a96e]/40 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:border-[#c9a96e]/70 transition-all duration-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <p className="font-heading text-[13px] text-[#5c5549] tracking-wide mb-2">
                        写一封信
                      </p>
                      <p className="font-mono text-[9px] text-[#a6a092] tracking-[0.15em] uppercase">
                        Click to open envelope
                      </p>
                    </div>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Envelope open state — Giscus */}
            <AnimatePresence>
              {writeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative bg-[#fdfcf9] border border-[#e8e4d9] p-6 md:p-10 shadow-lg">
                    {/* Close button */}
                    <button
                      onClick={() => setWriteOpen(false)}
                      className="absolute top-4 right-4 font-mono text-[9px] text-[#ccc] tracking-[0.15em] uppercase hover:text-[#888] transition-colors cursor-pointer z-10"
                    >
                      Close
                    </button>

                    <p className="text-[13px] text-[#888888] leading-[2] font-light mb-8 text-center">
                      如果你从这里路过，欢迎留下一句话。可以是对某张照片的感受，也可以只是打个招呼。
                    </p>

                    <GiscusComments />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
