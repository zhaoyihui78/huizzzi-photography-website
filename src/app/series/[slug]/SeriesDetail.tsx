'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Series, Photo } from '@/data/series';
import FadeIn from '@/components/FadeIn';
import Lightbox from '@/components/Lightbox';
import VideoLightbox from '@/components/VideoLightbox';
import TextReveal from '@/components/TextReveal';
import FilmFrame from '@/components/FilmFrame';

interface Props {
  series: Series;
}

const FILM_BRANDS = [
  'KODAK PORTRA 400',
  'KODAK VISION3 250D',
  'FUJIFILM PRO 400H',
  'ILFORD HP5 PLUS',
  'CINESTILL 800T',
  'KODAK GOLD 200',
  'KODAK EKTAR 100',
];

function ContactSheetGallery({
  photos,
  onPhotoClick,
}: {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}) {
  const [columnCount, setColumnCount] = useState(3);

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
      className="relative -mx-10 px-10 py-32 bg-[#0a0a0a] text-white"
    >
      {/* Background grain & gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#0a0a0a] pointer-events-none" />
      
      {/* Editorial Header for the Gallery */}
      <div className="relative mb-24 flex items-end justify-between border-b border-white/10 pb-8">
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
              return (
                <motion.div
                  key={photo.src}
                  variants={itemVariants}
                  className="group flex flex-col"
                >
                  <FilmFrame
                    src={photo.src}
                    alt={photo.alt}
                    label={brand}
                    frameStyle="thick"
                    onClick={() => onPhotoClick(photo)}
                    className="w-full hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  {/* Subtle caption below frame */}
                  <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 px-2">
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Asymmetric sizing: first video largest, evens slightly inset
  const isFirst = index === 0;
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="flex gap-10 mb-28 last:mb-0 relative">
      {/* Timeline node */}
      <div className="w-[72px] flex flex-col items-end pr-5 text-right shrink-0 pt-3">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono text-[11px] text-[#b8a060] tracking-[0.15em] font-medium"
        >
          {video.season}
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-[8px] text-[#bbb] mt-1 tracking-[0.15em]"
        >
          {video.month}
        </motion.span>
      </div>

      {/* Dot on timeline */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="absolute left-[72px] top-5 w-[7px] h-[7px] rounded-full bg-[#b8a060] -translate-x-1/2 border-2 border-[#f7f5f0] z-10"
      />

      {/* Video card with gallery mat frame */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`flex-1 ${isEven && !isFirst ? 'ml-8' : ''}`}
      >
        {/* Mat board frame */}
        <div
          className={`bg-white border border-[#eae8e3] shadow-sm transition-all duration-700 hover:bg-[#f0ece0] hover:border-[#ddd8cc] hover:shadow-md group ${
            isFirst ? 'p-4' : 'p-3'
          }`}
        >
          {/* Inner fine black line — the "reveal" edge */}
          <div className="border border-[#1a1a1a] p-[1px]">
            <div
              className="relative bg-[#0a0a0a] overflow-hidden cursor-pointer"
              style={{ aspectRatio: isFirst ? '21/9' : '16/9' }}
              onClick={onClick}
            >
              <Image
                src={video.poster}
                alt={video.title}
                fill
                className="object-cover grayscale-[25%] group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-[1.03]"
                loading={index < 2 ? 'eager' : 'lazy'}
                unoptimized
              />

              {/* Vignette overlay */}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-all duration-700" />

              {/* Play button — thin square wireframe */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 border border-white/35 flex items-center justify-center group-hover:scale-110 group-hover:border-white/65 transition-all duration-500 ease-out">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.2"
                    className="ml-0.5 opacity-80"
                  >
                    <path d="M8 5l11 7-11 7z" />
                  </svg>
                </div>
              </div>

              {/* Bottom info — film credit style */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-heading text-[13px] text-white/90 tracking-wide mb-1">
                  {video.title}
                </p>
                {video.subtitle && (
                  <p className="font-mono text-[8px] text-white/35 tracking-[0.2em] uppercase">
                    {video.subtitle}
                  </p>
                )}
              </div>

              {/* Film edge number */}
              <div className="absolute top-4 left-4 font-mono text-[9px] text-white/15 tracking-[0.15em]">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Mat caption */}
          <div className="mt-3 px-1 flex justify-between items-baseline">
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#999] group-hover:text-[#555] transition-colors duration-500">
              {video.title}
            </span>
            <span className="font-mono text-[8px] text-[#ccc] tracking-[0.1em]">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SeriesDetail({ series }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [videoOpen, setVideoOpen] = useState<{ src: string; poster: string; title: string } | null>(null);

  const isSeasonsFilm = series.slug === 'seasons-of-beijing';

  return (
    <main className="min-h-full px-10 py-14">
      {/* Header */}
      <FadeIn delay={0}>
        <header className="mb-20">
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="font-heading text-xl font-normal tracking-tight text-[#111111]">
              {series.title}
            </h1>
            <span className="font-mono text-[9px] text-[#cccccc] tracking-[0.2em] uppercase">
              {series.year}
            </span>
          </div>
          <p className="text-[13px] text-[#888888] leading-[2] max-w-2xl font-light">
            <TextReveal delay={0.3}>{series.description}</TextReveal>
          </p>
        </header>
      </FadeIn>

      {/* Videos */}
      {series.videos && series.videos.length > 0 && (
        isSeasonsFilm ? (
          <section className="relative bg-[#f7f5f0] -mx-10 px-10 py-20 mb-32">
            {/* Section header */}
            <div className="mb-16 flex items-end justify-between">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="font-mono text-[9px] text-[#c9a96e] tracking-[0.3em] uppercase mb-3"
                >
                  Film Collection
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="font-heading text-[22px] text-[#111] tracking-tight"
                >
                  四季巡礼
                </motion.h2>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-mono text-[9px] text-[#ccc] tracking-[0.2em]"
              >
                {series.videos.length} Scenes
              </motion.span>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[72px] top-2 bottom-2 w-px bg-[#e0ddd5]" />

              {series.videos.map((video, i) => (
                <VideoTimelineItem
                  key={i}
                  video={video}
                  index={i}
                  total={series.videos!.length}
                  onClick={() => setVideoOpen(video)}
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
                      onClick={() => setVideoOpen(video)}
                    >
                      <Image
                        src={video.poster}
                        alt={video.title}
                        fill
                        className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-[1.02]"
                        loading={i < 2 ? 'eager' : 'lazy'}
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-all duration-700" />
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
        <section className="flex flex-col gap-32">
          {series.photos.map((photo, i) => (
            <FadeIn key={i} delay={0} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div
                className={`flex gap-16 items-center ${
                  i % 2 === 1 ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Photo */}
                <div className="flex-1">
                  <div
                    className={`relative overflow-hidden cursor-pointer group flex items-center justify-center ${
                      (photo.height || 800) > (photo.width || 1200)
                        ? 'max-h-[78vh] min-h-[55vh]'
                        : 'max-h-[60vh]'
                    }`}
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width || 1200}
                      height={photo.height || 800}
                      className={`w-full h-auto object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.02] ${
                        (photo.height || 800) > (photo.width || 1200)
                          ? 'max-h-[78vh]'
                          : 'max-h-[60vh]'
                      }`}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      unoptimized
                    />
                  </div>
                </div>

                {/* Text side */}
                <div className="w-[260px] shrink-0">
                  <p className="font-heading text-[15px] text-[#111111] tracking-wide mb-3">
                    {photo.alt}
                  </p>
                  {photo.exif && (
                    <>
                      <p className="font-mono text-[9px] text-[#cccccc] tracking-[0.12em] leading-relaxed">
                        {photo.exif.camera} · {photo.exif.lens}
                      </p>
                      <p className="font-mono text-[9px] text-[#cccccc] tracking-[0.12em] leading-relaxed mt-1">
                        {photo.exif.aperture} · {photo.exif.shutter} · {photo.exif.iso}
                      </p>
                    </>
                  )}
                  <div className="mt-8 w-8 h-px bg-[#e0e0e0]" />
                  <p className="font-mono text-[9px] text-[#dddddd] tracking-[0.15em] mt-4 uppercase">
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
