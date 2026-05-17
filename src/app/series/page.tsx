'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { seriesList } from '@/data/series';
import FadeIn from '@/components/FadeIn';

export default function SeriesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
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
    <main className="min-h-full px-6 md:px-10 py-10 md:py-14">
      <FadeIn delay={0}>
        <h1 className="font-heading text-[15px] font-normal tracking-tight text-[#111111] mb-16">
          All Series
        </h1>
      </FadeIn>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    Explore
                  </span>
                </div>
              </div>
              <h2 className="font-heading text-[13px] font-normal text-[#111111] group-hover:text-[#888888] transition-colors duration-300">
                {series.title}
              </h2>
              <p className="text-[11px] text-[#888888] mt-2 leading-[1.7] line-clamp-2 font-light">
                {series.description}
              </p>
              <p className="font-mono text-[9px] text-[#cccccc] mt-3 tracking-[0.15em]">
                {series.photos.length} photos{series.videos ? ` · ${series.videos.length} videos` : ''} · {series.year}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
