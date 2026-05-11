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
    <main className="min-h-full px-8 py-10">
      <FadeIn delay={0}>
        <h1 className="text-sm font-bold tracking-tight text-black mb-12">
          All Series
        </h1>
      </FadeIn>

      <motion.div
        className="grid grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {seriesList.map((series) => (
          <motion.div key={series.slug} variants={itemVariants}>
            <Link href={`/series/${series.slug}`} className="group block">
              <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
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
                  <span className="text-white text-[10px] font-medium tracking-widest uppercase bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Explore
                  </span>
                </div>
              </div>
              <h2 className="text-[12px] font-medium text-black group-hover:text-gray-500 transition-colors duration-300">
                {series.title}
              </h2>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-[1.7] line-clamp-2">
                {series.description}
              </p>
              <p className="text-[10px] text-gray-300 mt-2 tracking-wide">
                {series.photos.length} photos{series.videos ? ` · ${series.videos.length} videos` : ''} · {series.year}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
