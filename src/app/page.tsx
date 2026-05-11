'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { seriesList, getSelectedPhotos } from '@/data/series';
import FadeIn from '@/components/FadeIn';
import ImageReveal from '@/components/ImageReveal';

export default function Home() {
  const selectedPhotos = getSelectedPhotos(15);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <main className="min-h-full px-10 py-14">
      {/* Top section - Featured film strip */}
      <section className="mb-32">
        <motion.div
          className="flex gap-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        >
          <div className="flex-1">
            <div className="bg-[#1a1a1a] p-[10px] pb-[42px] relative group cursor-pointer overflow-hidden">
              <div className="overflow-hidden">
                <Image
                  src="/works/photos/nature05.jpg"
                  alt="Nature & Landscape 5"
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                  priority
                  unoptimized
                />
              </div>
              <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#c9a96e] tracking-[0.2em] opacity-60">
                KODAK PORTRA 400
              </div>
              <div className="absolute inset-[10px] bottom-[42px] bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
            </div>
          </div>
          <div className="w-[320px]">
            <div className="bg-[#1a1a1a] p-[10px] pb-[42px] relative group cursor-pointer overflow-hidden">
              <div className="overflow-hidden">
                <Image
                  src="/works/thumbs/beijing04.jpg"
                  alt="蜿蜒的巨龙"
                  width={537}
                  height={800}
                  className="w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                  priority
                  unoptimized
                />
              </div>
              <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#c9a96e] tracking-[0.2em] opacity-60">
                KODAK PORTRA 400
              </div>
              <div className="absolute inset-[10px] bottom-[42px] bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Series Grid */}
      <section className="mb-32">
        <FadeIn delay={0}>
          <h2 className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em] mb-10">
            All Works
          </h2>
        </FadeIn>
        <motion.div
          className="grid grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {seriesList.map((series) => (
            <motion.div key={series.slug} variants={itemVariants}>
              <Link href={`/series/${series.slug}`} className="group block">
                <div className="relative overflow-hidden bg-[#f0f0f0] aspect-[4/3] mb-4">
                  <Image
                    src={series.cover}
                    alt={series.title}
                    fill
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
                    loading="lazy"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="font-mono text-white text-[9px] tracking-[0.2em] uppercase bg-black/20 backdrop-blur-sm px-4 py-2">
                      View
                    </span>
                  </div>
                </div>
                <h3 className="font-heading text-[13px] font-normal text-[#111111] group-hover:text-[#888888] transition-colors duration-300">
                  {series.title}
                </h3>
                <p className="font-mono text-[9px] text-[#cccccc] mt-2 tracking-[0.15em]">
                  {series.category} · {series.year}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Selected Photos Grid */}
      <section className="mb-32">
        <FadeIn delay={0}>
          <h2 className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em] mb-10">
            Selected Photos
          </h2>
        </FadeIn>
        <div className="grid grid-cols-5 gap-3">
          {selectedPhotos.map((photo, i) => (
            <ImageReveal key={photo.src} delay={i * 0.08}>
              <div className="relative aspect-square bg-[#f0f0f0] overflow-hidden group cursor-pointer">
                <Image
                  src={photo.thumb}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:brightness-90"
                  loading="lazy"
                  unoptimized
                />
              </div>
            </ImageReveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <FadeIn delay={0.2}>
        <footer className="mt-40 pt-10 border-t border-[#f0f0f0]">
          <p className="font-mono text-[9px] text-[#dddddd] tracking-[0.15em]">
            © {new Date().getFullYear()} HUI ZZZI. All rights reserved.
          </p>
        </footer>
      </FadeIn>
    </main>
  );
}
