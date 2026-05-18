'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { photos as WE_PHOTOS } from '../app/we/data';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function AttachmentModal({ isOpen, onClose, onSelect }: AttachmentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="flex w-full max-w-3xl flex-col overflow-hidden rounded-sm bg-[#fdfcf9] shadow-2xl"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#e5d8c8] p-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#4f4033]">
                  照片库 (Gallery)
                </p>
                <p className="mt-2 text-[12px] leading-[1.8] text-[#9d8a77]">
                  从你们已经存在的回忆里，挑一张夹进这封信。
                </p>
              </div>
              <button onClick={onClose} className="text-[#a89580] hover:text-[#4f4033] font-mono text-[10px] uppercase tracking-widest">
                Close ✕
              </button>
            </div>

            <div className="h-[440px] overflow-hidden bg-[#fdfcf9] p-6 md:h-[480px]">
              <div className="scrollbar-warm h-full overflow-y-scroll overscroll-contain pr-2" data-lenis-prevent>
                <div className="grid content-start grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {WE_PHOTOS.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSelect(photo.src);
                        onClose();
                      }}
                      className="group relative aspect-[3/2] overflow-hidden rounded-sm border border-[#e5d8c8] transition-colors hover:border-[#d9c0a1]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumb}
                        alt={`Moment ${i}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
