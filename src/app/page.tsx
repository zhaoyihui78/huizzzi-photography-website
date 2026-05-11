'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { seriesList, beijingPhotos, naturePhotos, architecturePhotos } from '@/data/series';
import FadeIn from '@/components/FadeIn';
import FilmFrame from '@/components/FilmFrame';
import Lightbox from '@/components/Lightbox';
import Link from 'next/link';

// Bento grid film wall — aligned grid with varied sizes
const filmWallItems = [
  { photo: naturePhotos[5],   gridClass: 'col-span-3', rotate: 0, label: 'KODAK PORTRA 400' },
  { photo: beijingPhotos[3],  gridClass: 'col-span-1', rotate: 0, label: 'KODAK EKTAR 100' },
  { photo: naturePhotos[0],   gridClass: 'col-span-1', rotate: 0, label: 'KODAK GOLD 200' },
  { photo: beijingPhotos[19], gridClass: 'col-span-2', rotate: 0, label: 'FUJIFILM PRO 400H' },
  { photo: beijingPhotos[16], gridClass: 'col-span-1', rotate: 0, label: 'ILFORD HP5 PLUS' },
  { photo: naturePhotos[4],   gridClass: 'col-span-2', rotate: 0, label: 'KODAK VISION3 500T' },
  { photo: architecturePhotos[0], gridClass: 'col-span-1', rotate: 0, label: 'CINESTILL 800T' },
  { photo: beijingPhotos[1],  gridClass: 'col-span-4', rotate: 0, label: 'KODAK VISION3 250D' },
];

export default function Home() {
  const [lightboxPhoto, setLightboxPhoto] = useState<typeof filmWallItems[0]['photo'] | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <main className="min-h-full px-10 py-14">
      {/* Hero — bento film frame wall */}
      <section className="mb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-10 items-start"
        >
          {filmWallItems.map((item) => (
            <motion.div
              key={item.photo.src}
              variants={itemVariants}
              className={item.gridClass}
            >
              <div className="hover:-translate-y-2 transition-transform duration-700">
                <FilmFrame
                  src={item.photo.src}
                  alt={item.photo.alt}
                  label={item.label}
                  rotation={item.rotate}
                  onClick={() => setLightboxPhoto(item.photo)}
                />
              </div>
            </motion.div>
          ))}
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
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {seriesList.map((series) => (
            <motion.div key={series.slug} variants={itemVariants}>
              <Link href={`/series/${series.slug}`} className="group block">
                <div className="relative overflow-hidden bg-[#f0f0f0] aspect-[4/3] mb-4">
                  <img
                    src={series.cover}
                    alt={series.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
                    loading="lazy"
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

      {/* Footer */}
      <FadeIn delay={0.2}>
        <footer className="mt-40 pt-10 border-t border-[#f0f0f0]">
          <p className="font-mono text-[9px] text-[#dddddd] tracking-[0.15em]">
            © {new Date().getFullYear()} HUI ZZZI. All rights reserved.
          </p>
        </footer>
      </FadeIn>

      <Lightbox
        photo={lightboxPhoto}
        isOpen={!!lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
      />
    </main>
  );
}
