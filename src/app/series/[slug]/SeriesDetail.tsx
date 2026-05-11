'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Series } from '@/data/series';
import FilmFrame from '@/components/FilmFrame';
import FadeIn from '@/components/FadeIn';
import ImageReveal from '@/components/ImageReveal';

interface Props {
  series: Series;
}

export default function SeriesDetail({ series }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <main className="min-h-full px-8 py-10">
      {/* Header */}
      <FadeIn delay={0}>
        <header className="mb-16">
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="text-lg font-bold tracking-tight text-black">
              {series.title}
            </h1>
            <span className="text-[10px] text-gray-300 tracking-wider uppercase">
              {series.year}
            </span>
          </div>
          <p className="text-[12px] text-gray-400 leading-[1.8] max-w-2xl">
            {series.description}
          </p>
        </header>
      </FadeIn>

      {/* Videos if exists */}
      {series.videos && series.videos.length > 0 && (
        <FadeIn delay={0.15}>
          <section className="mb-20">
            <h2 className="text-[10px] font-medium text-gray-300 uppercase tracking-[0.2em] mb-6">
              Videos
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {series.videos.map((video, i) => (
                <div
                  key={i}
                  className="relative bg-black aspect-video overflow-hidden group"
                >
                  <video
                    controls
                    className="w-full h-full"
                    poster={video.poster}
                    preload="none"
                  >
                    <source src={video.src} type="video/mp4" />
                  </video>
                  <div className="absolute bottom-3 left-3 text-[10px] text-white/80 tracking-wide pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {video.title}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* Layout: Film */}
      {series.layout === 'film' && (
        <section className="flex flex-col gap-16 max-w-5xl">
          {series.photos.map((photo, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <FilmFrame
                src={photo.src}
                alt={photo.alt}
                className="max-w-3xl mx-auto"
              />
            </FadeIn>
          ))}
        </section>
      )}

      {/* Layout: Grid */}
      {series.layout === 'grid' && (
        <motion.section
          className="grid grid-cols-4 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {series.photos.map((photo, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="relative bg-gray-100 aspect-square overflow-hidden group cursor-pointer"
            >
              <Image
                src={photo.thumb}
                alt={photo.alt}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-90"
                loading={i < 8 ? 'eager' : 'lazy'}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3">
                <span className="text-white text-[10px] font-medium tracking-wide translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  {photo.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.section>
      )}

      {/* Layout: Masonry */}
      {series.layout === 'masonry' && (
        <section className="columns-2 gap-4">
          {series.photos.map((photo, i) => (
            <ImageReveal key={i} delay={i * 0.1}>
              <div className="relative bg-gray-100 mb-4 overflow-hidden group cursor-pointer break-inside-avoid">
                <Image
                  src={photo.thumb}
                  alt={photo.alt}
                  width={photo.width || 800}
                  height={photo.height || 600}
                  className="w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-95"
                  loading={i < 4 ? 'eager' : 'lazy'}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </ImageReveal>
          ))}
        </section>
      )}

      {/* Layout: Split */}
      {series.layout === 'split' && (
        <section className="flex flex-col gap-20">
          {series.photos.map((photo, i) => (
            <FadeIn key={i} delay={0} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div
                className={`flex gap-10 items-center ${
                  i % 2 === 1 ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 overflow-hidden group cursor-pointer">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={1000}
                    height={750}
                    className="w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
                    loading={i < 2 ? 'eager' : 'lazy'}
                    unoptimized
                  />
                </div>
                <div className="w-[240px]">
                  <p className="text-[11px] text-gray-400 leading-[1.8]">
                    {photo.alt}
                  </p>
                  <div className="mt-4 w-8 h-px bg-gray-200" />
                </div>
              </div>
            </FadeIn>
          ))}
        </section>
      )}

      {/* Layout: Polaroid */}
      {series.layout === 'polaroid' && (
        <motion.section
          className="grid grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {series.photos.map((photo, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white p-3 pb-12 shadow-sm hover:shadow-lg transition-shadow duration-500"
              style={{
                transform: `rotate(${((i % 3) - 1) * 3}deg)`,
              }}
              whileHover={{ scale: 1.03, rotate: 0 }}
            >
              <div className="relative bg-gray-100 aspect-square overflow-hidden">
                <Image
                  src={photo.thumb}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  loading="lazy"
                  unoptimized
                />
              </div>
              {photo.caption && (
                <p
                  className="text-center text-[12px] text-gray-600 mt-3"
                  style={{ fontFamily: "'Courier New', cursive" }}
                >
                  {photo.caption}
                </p>
              )}
            </motion.div>
          ))}
        </motion.section>
      )}
    </main>
  );
}
