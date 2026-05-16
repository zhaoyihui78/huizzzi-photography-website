'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Series, Photo, FILM_BRANDS } from '@/data/series';
import FadeIn from '@/components/FadeIn';
import Lightbox from '@/components/Lightbox';
import VideoLightbox from '@/components/VideoLightbox';
import TextReveal from '@/components/TextReveal';
import FilmFrame from '@/components/FilmFrame';
import { getSrcSet, SIZES } from '@/utils/images';

interface Props {
  series: Series;
}

function ContactSheetGallery({
  photos,
  onPhotoClick,
}: {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}) {
  const [columnCount, setColumnCount] = useState(3);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => setColumnCount(window.innerWidth < 768 ? 1 : 3);
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const columns = useMemo(() => {
    const cols: Photo[][] = Array.from({ length: columnCount }, () => []);
    const heights = Array.from({ length: columnCount }, () => 0);
    for (const photo of photos) {
      const ratio = (photo.height || 600) / (photo.width || 800);
      const minCol = heights.indexOf(Math.min(...heights));
      cols[minCol].push(photo);
      heights[minCol] += ratio;
    }
    return cols;
  }, [photos, columnCount]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  let globalIndex = 0;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="relative -mx-4 md:-mx-10 px-4 md:px-10 py-10 md:py-16 bg-[#0a0a0a] text-white"
    >
      {/* Background grain & gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#0a0a0a] pointer-events-none" />

      {/* Developer liquid ripple — darkroom amber glow drifting in tray */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -inset-[50%] animate-liquid-drift opacity-70">
          <div className="absolute top-1/4 left-1/4 w-[70%] h-[50%] rounded-full bg-[radial-gradient(ellipse,rgba(220,120,40,0.06)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[60%] h-[60%] rounded-full bg-[radial-gradient(ellipse,rgba(200,90,30,0.04)_0%,transparent_70%)] blur-3xl" />
        </div>
      </div>

      {/* Giant drifting film strips — darkroom atmosphere */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute top-[18%] left-[-5%] w-[110%] opacity-[0.06]">
          <div className="relative h-[100px] md:h-[140px] border-y border-white/[0.12]">
            <div className="absolute top-2 md:top-3 left-0 right-0 flex justify-between px-4 md:px-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={`t1-${i}`} className="w-[10px] md:w-[14px] h-[7px] md:h-[10px] bg-white/[0.25] rounded-[1px]" />
              ))}
            </div>
            <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-between px-4 md:px-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={`b1-${i}`} className="w-[10px] md:w-[14px] h-[7px] md:h-[10px] bg-white/[0.25] rounded-[1px]" />
              ))}
            </div>
            <div className="absolute inset-y-5 md:inset-y-6 left-0 right-0 flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`d1-${i}`} className="flex-1 mx-2 md:mx-4 border-x border-dashed border-white/[0.1]" />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-[55%] left-[-8%] w-[116%] opacity-[0.04]">
          <div className="relative h-[80px] md:h-[120px] border-y border-white/[0.08]">
            <div className="absolute top-2 md:top-3 left-0 right-0 flex justify-between px-6 md:px-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`t2-${i}`} className="w-[10px] md:w-[14px] h-[7px] md:h-[10px] bg-white/[0.2] rounded-[1px]" />
              ))}
            </div>
            <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-between px-6 md:px-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`b2-${i}`} className="w-[10px] md:w-[14px] h-[7px] md:h-[10px] bg-white/[0.2] rounded-[1px]" />
              ))}
            </div>
            <div className="absolute inset-y-5 md:inset-y-6 left-0 right-0 flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`d2-${i}`} className="flex-1 mx-3 md:mx-5 border-x border-dashed border-white/[0.08]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Header for the Gallery */}
      <div className="relative mb-12 flex items-end justify-between border-b border-white/10 pb-8">
        <div>
          <motion.p
            variants={itemVariants}
            className="font-mono text-[9px] text-[#888] tracking-[0.3em] uppercase mb-4"
          >
            Darkroom
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl text-white tracking-tight"
          >
            Contact Sheet
          </motion.h2>
        </div>
        <motion.div variants={itemVariants} className="text-right">
          <p className="font-mono text-[10px] text-[#666] tracking-[0.2em]">ISO 400 · 35MM</p>
          <p className="font-mono text-[9px] text-[#444] tracking-[0.15em] mt-2">
            {photos.length} EXPOSURES
          </p>
        </motion.div>
      </div>

      <div className="relative flex gap-8 md:gap-16">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-16 md:gap-24">
            {col.map((photo) => {
              const idx = globalIndex++;
              const brand = FILM_BRANDS[idx % FILM_BRANDS.length];
              const dimmed = hoveredIndex !== null && hoveredIndex !== idx;
              const highlighted = hoveredIndex === idx;
              return (
                <motion.div
                  key={photo.src}
                  variants={itemVariants}
                  className="group flex flex-col relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <FilmFrame
                    src={photo.thumb || photo.src}
                    alt={photo.alt}
                    label={brand}
                    frameStyle="thick"
                    onClick={() => onPhotoClick(photo)}
                    className="w-full transition-transform duration-700 ease-out"
                    dimmed={dimmed}
                    highlighted={highlighted}
                    lightLeak={idx % 5 === 1 ? 'top' : idx % 5 === 3 ? 'right' : 'none'}
                    dateStamp={photo.filmInfo?.date}
                    developing={true}
                    frameNumber={idx + 1}
                    srcSet={getSrcSet(photo)}
                    sizes={SIZES.polaroid}
                  />
                  {/* Film info card — slides up on hover */}
                  {photo.filmInfo && (
                    <div className="mt-0 overflow-hidden">
                      <div className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out pt-4 pb-2 px-3">
                        <div className="border-t border-white/10 pt-3">
                          <p className="font-mono text-[8px] text-[#888] tracking-[0.15em] uppercase mb-1">
                            {photo.filmInfo.camera}
                          </p>
                          <p className="font-mono text-[7px] text-[#666] tracking-[0.12em] uppercase">
                            {photo.filmInfo.film}
                          </p>
                          <p className="font-mono text-[7px] text-[#444] tracking-[0.1em] mt-1">
                            Developed {photo.filmInfo.developed}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Subtle caption below frame */}
                  <div className="mt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 px-2">
                    <span className="font-mono text-[8px] text-[#666] tracking-[0.2em] uppercase">
                      Exp. {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#444] tracking-[0.15em]">
                      {photo.width}×{photo.height}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function VideoTimelineItem({
  video,
  index,
  total,
  onClick,
}: {
  video: NonNullable<Series['videos']>[number];
  index: number;
  total: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // First video uses a wider cinematic aspect ratio
  const isFirst = index === 0;

  return (
    <div ref={ref} id={video.title} className="flex gap-4 md:gap-10 mb-16 md:mb-28 last:mb-0 relative">
      {/* Timeline node */}
      <div className="w-[50px] md:w-[72px] flex flex-col items-end pr-3 md:pr-5 text-right shrink-0 pt-3">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono text-[9px] md:text-[11px] text-[#8c3b31] tracking-[0.15em] font-medium"
        >
          {video.season}
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-[7px] md:text-[8px] text-[#8c8577] mt-1 tracking-[0.15em]"
        >
          {video.month}
        </motion.span>
      </div>

      {/* Dot on timeline */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="absolute left-[50px] md:left-[72px] top-5 w-[5px] h-[5px] md:w-[7px] md:h-[7px] rounded-full bg-[#8c3b31] -translate-x-1/2 border-2 border-[#f4f1ea] z-10"
      />

      {/* Video card with gallery mat frame */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1"
      >
        {/* Mat board frame */}
        <div
          className={`bg-[#fdfcf9] border border-[#e8e4d9] shadow-sm transition-all duration-700 hover:bg-white hover:border-[#d6ceb8] hover:shadow-xl group ${
            isFirst ? 'p-4' : 'p-3'
          }`}
        >
          {/* Inner fine black line — the "reveal" edge */}
          <div className="border border-[#2c2824] p-[1px]">
            <div
              className="relative bg-[#1a1816] overflow-hidden cursor-pointer"
              style={{ aspectRatio: isFirst ? '21/9' : '16/9' }}
              onClick={onClick}
            >
              <Image
                src={video.poster}
                alt={video.title}
                fill
                className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-[1.03]"
                loading={index < 2 ? 'eager' : 'lazy'}
                unoptimized
              />

              {/* Vignette overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all duration-700 pointer-events-none" />

              {/* Bottom info — film credit style */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-heading text-[13px] text-white/90 tracking-wide mb-1">
                  {video.title}
                </p>
                {video.subtitle && (
                  <p className="font-mono text-[8px] text-[#e8d088]/80 tracking-[0.2em] uppercase">
                    {video.subtitle}
                  </p>
                )}
              </div>

              {/* Film edge number */}
              <div className="absolute top-4 left-4 font-mono text-[9px] text-white/40 tracking-[0.15em]">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Mat caption */}
          <div className="mt-3 px-1 flex justify-between items-baseline">
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#8c8577] group-hover:text-[#5c5549] transition-colors duration-500">
              {video.title}
            </span>
            <span className="font-mono text-[8px] text-[#a6a092] tracking-[0.1em]">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>

          {/* Quote */}
          {video.quote && (
            <div className="mt-4 px-1">
              <p className="text-[11px] leading-[1.8] text-[#5c5549] font-serif italic opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                “{video.quote}”
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function SeriesDetail({ series }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [videoOpen, setVideoOpen] = useState<{ src: string; poster: string; title: string } | null>(null);

  const isSeasonsFilm = series.slug === 'seasons-of-beijing';
  
  let theme: 'default' | 'dark' | 'oriental' = 'default';
  if (series.slug === 'film-life') theme = 'dark';
  if (isSeasonsFilm) theme = 'oriental';

  const isDarkMode = theme === 'dark';
  const isOriental = theme === 'oriental';

  const { scrollYProgress } = useScroll();
  const bgTextY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // Scroll to anchored work on mount
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    // Wait for layout/animations to settle
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief highlight pulse
      el.style.transition = 'background-color 0.5s ease';
      el.style.backgroundColor = 'rgba(201,169,110,0.08)';
      setTimeout(() => {
        el.style.backgroundColor = 'transparent';
      }, 1200);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main 
      className={`min-h-screen px-4 md:px-10 py-8 md:py-14 transition-colors duration-1000 relative overflow-hidden ${
        isDarkMode ? 'bg-[#0a0a0a] text-white' : isOriental ? 'bg-[#f4f1ea] text-[#2c2824]' : ''
      }`}
      data-theme={theme}
    >
      {/* Background Floating Massive Typography */}
      <motion.div 
        className="fixed top-[20%] left-[-10%] pointer-events-none select-none whitespace-nowrap z-0 opacity-[0.013]"
        style={{ y: bgTextY }}
      >
        <h1 className={`font-heading text-[25vw] leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {series.title.toUpperCase()}
        </h1>
      </motion.div>
      <motion.div
        className="fixed bottom-[10%] right-[-5%] pointer-events-none select-none whitespace-nowrap z-0 opacity-[0.013]"
        style={{ y: useTransform(scrollYProgress, [0, 1], ['20%', '-20%']) }}
      >
        <h1 className={`font-heading text-[15vw] leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {series.year}
        </h1>
      </motion.div>

      {/* Header */}
      <FadeIn delay={0}>
        <header className="mb-6">
          <div className="flex items-baseline justify-between mb-5">
            <h1 className={`font-heading text-xl font-normal tracking-tight transition-colors duration-1000 ${
              isDarkMode ? 'text-white' : isOriental ? 'text-[#2c2824]' : 'text-[#111111]'
            }`}>
              {series.title}
            </h1>
            <span className={`font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-1000 ${
              isDarkMode ? 'text-[#666666]' : isOriental ? 'text-[#a6a092]' : 'text-[#cccccc]'
            }`}>
              {series.year}
            </span>
          </div>
          <p className={`text-[13px] leading-[2] max-w-2xl font-light transition-colors duration-1000 ${
            isDarkMode ? 'text-[#aaaaaa]' : isOriental ? 'text-[#5c5549]' : 'text-[#888888]'
          }`}>
            <TextReveal delay={0.3}>{series.description}</TextReveal>
          </p>
        </header>
      </FadeIn>

      {/* Videos */}
      {series.videos && series.videos.length > 0 && (
        isSeasonsFilm ? (
          <section className="relative -mx-4 md:-mx-10 px-4 md:px-10 py-8 md:py-12 mb-20 bg-[#ece8df]">
            {/* Background grain & gradient for Oriental Theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f4f1ea] via-[#ece8df] to-[#f4f1ea] pointer-events-none" />

            {/* Section header */}
            <div className="relative mb-24 flex items-end justify-between border-b border-[#d6ceb8] pb-8">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="font-mono text-[9px] text-[#8c3b31] tracking-[0.3em] uppercase mb-4"
                >
                  Screening Room
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="font-heading text-3xl text-[#2c2824] tracking-tight"
                >
                  四季巡礼
                </motion.h2>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-right"
              >
                <p className="font-mono text-[10px] text-[#a6a092] tracking-[0.2em]">CINEMATIC LOG</p>
                <p className="font-mono text-[9px] text-[#5c5549] tracking-[0.15em] mt-2">
                  {series.videos.length} SCENES
                </p>
              </motion.div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[50px] md:left-[72px] top-2 bottom-2 w-px bg-[#d6ceb8]" />

              {series.videos.map((video, i) => (
                <VideoTimelineItem
                  key={i}
                  video={video}
                  index={i}
                  total={series.videos!.length}
                  onClick={() => {
                    if (video.xiaohongshuUrl) {
                      window.open(video.xiaohongshuUrl, '_blank');
                    } else {
                      setVideoOpen(video);
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ) : (
          <FadeIn delay={0.15}>
            <section className="mb-32">
              <h2 className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em] mb-10">
                Videos
              </h2>
              <div className="flex flex-col gap-16">
                {series.videos.map((video, i) => (
                  <FadeIn key={i} delay={i * 0.1} direction="up">
                    <div
                      className="relative bg-[#0a0a0a] aspect-video overflow-hidden group cursor-pointer"
                      onClick={() => {
                        if (video.xiaohongshuUrl) {
                          window.open(video.xiaohongshuUrl, '_blank');
                        } else {
                          setVideoOpen(video);
                        }
                      }}
                    >
                      <Image
                        src={video.poster}
                        alt={video.title}
                        fill
                        className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-[1.02]"
                        loading={i < 2 ? 'eager' : 'lazy'}
                        unoptimized
                      />

                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-700 pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:border-white/70 transition-all duration-500 ease-out">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-1 opacity-80">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="font-heading text-[13px] text-white/90 tracking-wide mb-1">
                          {video.title}
                        </p>
                        <p className="font-mono text-[8px] text-white/30 tracking-[0.2em] uppercase">
                          {series.title} · {series.year}
                        </p>
                      </div>
                      <div className="absolute top-5 right-5 font-mono text-[9px] text-white/15 tracking-[0.15em]">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </section>
          </FadeIn>
        )
      )}

      {/* Photos */}
      {series.photos.length > 0 && series.layout === 'polaroid' && (
        <ContactSheetGallery photos={series.photos} onPhotoClick={setLightboxPhoto} />
      )}

      {series.photos.length > 0 && series.layout !== 'polaroid' && (
        <section className="flex flex-col gap-32 relative z-10">
          {series.photos.map((photo, i) => (
            <FadeIn key={i} delay={0} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div
                className={`flex flex-col md:flex-row items-center relative ${
                  i % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Photo */}
                <div className="w-full md:w-[65%] z-0">
                  <div
                    className={`relative overflow-hidden cursor-pointer group flex items-center justify-center ${
                      (photo.height || 800) > (photo.width || 1200)
                        ? 'max-h-[78vh] min-h-[55vh]'
                        : 'max-h-[60vh]'
                    }`}
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <img
                      src={photo.thumb || photo.src}
                      alt={photo.alt}
                      width={photo.width || 1200}
                      height={photo.height || 800}
                      className={`w-full h-auto object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.02] ${
                        (photo.height || 800) > (photo.width || 1200)
                          ? 'max-h-[78vh]'
                          : 'max-h-[60vh]'
                      }`}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      srcSet={getSrcSet(photo)}
                      sizes={SIZES.split}
                    />
                  </div>
                </div>

                {/* Text side - Broken Grid Overlap */}
                <div 
                  className={`w-full md:w-[45%] z-10 mt-8 md:mt-0 p-8 md:p-12 transition-colors duration-1000 ${
                    isDarkMode 
                      ? 'bg-[#111111]/80 border border-white/5' 
                      : isOriental 
                      ? 'bg-[#ece8df]/90 border border-[#d6ceb8]/50' 
                      : 'bg-[#fcfcfc]/90 border border-[#f0f0f0]'
                  } backdrop-blur-md shadow-2xl ${
                    i % 2 === 1 ? 'md:-mr-16 lg:-mr-24' : 'md:-ml-16 lg:-ml-24'
                  } md:translate-y-12`}
                >
                  <p className={`font-heading text-[15px] tracking-wide mb-3 ${isDarkMode ? 'text-white' : isOriental ? 'text-[#2c2824]' : 'text-[#111111]'}`}>
                    {photo.caption || photo.alt}
                  </p>
                  {photo.exif && (
                    <>
                      <p className={`font-mono text-[9px] tracking-[0.12em] leading-relaxed ${isDarkMode ? 'text-[#888]' : isOriental ? 'text-[#8c8577]' : 'text-[#888888]'}`}>
                        {photo.exif.camera} · {photo.exif.lens}
                      </p>
                      <p className={`font-mono text-[9px] tracking-[0.12em] leading-relaxed mt-1 ${isDarkMode ? 'text-[#888]' : isOriental ? 'text-[#8c8577]' : 'text-[#888888]'}`}>
                        {photo.exif.aperture} · {photo.exif.shutter} · {photo.exif.iso}
                      </p>
                    </>
                  )}
                  <div className={`mt-8 w-8 h-px ${isDarkMode ? 'bg-[#333]' : isOriental ? 'bg-[#d6ceb8]' : 'bg-[#e0e0e0]'}`} />
                  <p className={`font-mono text-[9px] tracking-[0.15em] mt-4 uppercase ${isDarkMode ? 'text-[#555]' : isOriental ? 'text-[#a6a092]' : 'text-[#cccccc]'}`}>
                    {String(i + 1).padStart(2, '0')} / {String(series.photos.length).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </section>
      )}

      <Lightbox
        photo={lightboxPhoto}
        seriesTitle={series.title}
        isOpen={!!lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onPrev={() => {
          const idx = series.photos.findIndex((p) => p.src === lightboxPhoto!.src);
          if (idx > 0) setLightboxPhoto(series.photos[idx - 1]);
        }}
        onNext={() => {
          const idx = series.photos.findIndex((p) => p.src === lightboxPhoto!.src);
          if (idx < series.photos.length - 1) setLightboxPhoto(series.photos[idx + 1]);
        }}
      />

      <VideoLightbox
        src={videoOpen?.src || ''}
        poster={videoOpen?.poster || ''}
        title={videoOpen?.title || ''}
        isOpen={!!videoOpen}
        onClose={() => setVideoOpen(null)}
      />
    </main>
  );
}
