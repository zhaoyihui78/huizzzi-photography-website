'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type Location } from '@/data/locations';

interface MapLocationPanelProps {
  location: Location | null;
  onClose: () => void;
}

export default function MapLocationPanel({ location, onClose }: MapLocationPanelProps) {
  return (
    <AnimatePresence>
      {location && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/10 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-0 left-0 right-0 md:left-[220px] bg-[#fdfcf9] border-t border-[#d6c8b0] z-50 shadow-[0_-8px_40px_rgba(60,40,20,0.1)]"
          >
            <div className="max-w-[1100px] mx-auto px-6 py-6 md:py-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-4 font-mono text-[9px] text-[#a08060] tracking-[0.15em] uppercase hover:text-[#5c4a3a] transition-colors cursor-pointer"
              >
                Close
              </button>

              {/* Header */}
              <div className="flex items-baseline gap-3 mb-5">
                <h3 className="font-heading text-[16px] text-[#3a2a1a]">
                  {location.name}
                </h3>
                {location.subtitle && (
                  <span className="font-mono text-[9px] text-[#a08060] tracking-[0.15em]">
                    {location.subtitle}
                  </span>
                )}
              </div>

              {/* Photo strip - horizontal scroll */}
              {location.photos.length > 0 && (
                <div className="mb-6 overflow-x-auto pb-3 scrollbar-thin">
                  <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {location.photos.map((photo, i) => (
                      <div
                        key={i}
                        className="relative w-48 aspect-[4/3] shrink-0 overflow-hidden bg-[#e8e0d0] border border-[#d6c8b0] group"
                      >
                        <Image
                          src={photo}
                          alt={`${location.name} ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="192px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="font-mono text-[8px] text-[#a08060] tracking-[0.2em] uppercase mb-1">
                    Best Time
                  </p>
                  <p className="font-mono text-[11px] text-[#5c4a3a]">
                    {location.bestTime}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[8px] text-[#a08060] tracking-[0.2em] uppercase mb-1">
                    Transport
                  </p>
                  <p className="font-mono text-[11px] text-[#5c4a3a]">
                    {location.transport}
                  </p>
                </div>
                {location.exif && (
                  <div>
                    <p className="font-mono text-[8px] text-[#a08060] tracking-[0.2em] uppercase mb-1">
                      EXIF
                    </p>
                    <p className="font-mono text-[10px] text-[#7a6a5a]">
                      {location.exif.camera} · {location.exif.lens}
                    </p>
                    <p className="font-mono text-[10px] text-[#7a6a5a]">
                      {location.exif.aperture} · {location.exif.shutter} · ISO {location.exif.iso}
                    </p>
                  </div>
                )}
              </div>

              {location.quote && (
                <p className="font-mono text-[11px] text-[#a08060] leading-[1.8] italic mb-5 border-l-2 border-[#d6c8b0] pl-3 max-w-xl">
                  {location.quote}
                </p>
              )}

              <Link
                href={`/series/${location.seriesSlug}/${location.workAnchor ? `#${encodeURIComponent(location.workAnchor)}` : ''}`}
                className="inline-block px-5 py-2 border border-[#a08060] font-mono text-[9px] text-[#a08060] tracking-[0.15em] uppercase hover:bg-[#a08060] hover:text-[#fdfcf9] transition-colors duration-300"
              >
                查看该作品
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
