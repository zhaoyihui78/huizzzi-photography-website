'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { seriesList, Photo, naturePhotos } from '@/data/series';
import FadeIn from '@/components/FadeIn';
import Slideshow from '@/components/Slideshow';
import { getSrcSet, SIZES } from '@/utils/images';

interface WallItem {
  photo: Photo;
  label: string;
}

const HERO_PHOTO = naturePhotos[5];

function RevealImage({
  src,
  alt,
  highlighted,
  srcSet,
  sizes,
}: {
  src: string;
  alt: string;
  highlighted: boolean;
  srcSet?: string;
  sizes?: string;
}) {
  const [revealed, setRevealed] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      setRevealed(true);
      return;
    }
    const onLoad = () => setRevealed(true);
    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      className={`w-full h-auto object-cover transition-all duration-1000 ease-out ${
        revealed
          ? 'blur-0 scale-100 grayscale-0'
          : 'blur-[12px] scale-[1.04] grayscale-[20%]'
      }`}
      style={{
        transform:
          revealed && highlighted ? 'scale(1.02)' : revealed ? 'scale(1)' : undefined,
      }}
      loading="lazy"
    />
  );
}

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [columnCount, setColumnCount] = useState(2);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setColumnCount(w < 768 ? 1 : w < 1440 ? 2 : 3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const labelByPhotoSrc = useMemo(() => {
    const map = new Map<string, string>();
    for (const series of seriesList) {
      for (const photo of series.photos) {
        if (!map.has(photo.src)) map.set(photo.src, series.title);
      }
    }
    return map;
  }, []);

  const { items, heroIndex, columns } = useMemo(() => {
    // Exclude film-life series from homepage
    const allPhotos = seriesList
      .filter((s) => s.slug !== 'film-life')
      .flatMap((s) => s.photos);
    const seen = new Set<string>();
    const uniquePhotos = allPhotos.filter((p) => {
      if (seen.has(p.src)) return false;
      seen.add(p.src);
      return true;
    });

    const hIdx = uniquePhotos.findIndex((p) => p.src === HERO_PHOTO.src);

    const wallItems: WallItem[] = uniquePhotos.map((photo) => ({
      photo,
      label: labelByPhotoSrc.get(photo.src) || photo.caption || photo.alt,
    }));

    // Remove hero from masonry
    const masonryItems = wallItems.filter((i) => i.photo.src !== HERO_PHOTO.src);

    const cols: WallItem[][] = Array.from({ length: columnCount }, () => []);
    const colHeights = Array.from({ length: columnCount }, () => 0);

    for (const item of masonryItems) {
      const ratio = (item.photo.height || 600) / (item.photo.width || 800);
      const minCol = colHeights.indexOf(Math.min(...colHeights));
      cols[minCol].push(item);
      colHeights[minCol] += ratio;
    }

    return { items: wallItems, heroIndex: hIdx >= 0 ? hIdx : 0, columns: cols };
  }, [columnCount, labelByPhotoSrc]);

  const heroLabel = labelByPhotoSrc.get(HERO_PHOTO.src) || 'Featured';

  const openSlideshow = useCallback(
    (targetIndex: number) => {
      setSlideshowIndex(targetIndex);
      setSlideshowOpen(true);
    },
    []
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  let globalIndex = 0;

  return (
    <main className="min-h-full px-4 md:px-10 py-8 md:py-14">
      {/* Hero — full-bleed feature image */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-1 cursor-pointer group -mx-4 md:-mx-10 overflow-hidden"
        onClick={() => openSlideshow(heroIndex)}
      >
        <div className="relative overflow-hidden w-full max-h-[65vh] flex items-center justify-center bg-[#050505]">
          <RevealImage
            src={HERO_PHOTO.thumb || HERO_PHOTO.src}
            alt={HERO_PHOTO.caption || HERO_PHOTO.alt}
            highlighted={false}
            srcSet={getSrcSet(HERO_PHOTO)}
            sizes={SIZES.fullWidth}
          />
          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500">
            <span className="font-mono text-[8px] text-[#c9a96e] tracking-[0.3em] uppercase">
              {heroLabel}
            </span>
            <h2 className="font-heading text-[15px] text-white/90 tracking-wide mt-2">
              {HERO_PHOTO.caption || HERO_PHOTO.alt}
            </h2>
          </div>
        </div>
      </motion.section>

      {HERO_PHOTO.alt === 'Nature & Landscape 6' && (
        <FadeIn delay={0.4}>
          <div className="flex flex-col items-center justify-center pt-8 pb-12 px-4 text-center space-y-4">
            <div className="space-y-3 max-w-2xl">
              <p className="font-heading text-[12px] md:text-[13px] font-light tracking-[0.15em] text-[#666666] leading-[2]">
                我曾经说过，我喜爱摄影，有很大部分原因是因为摄影具有孤独的本质。
              </p>
              <p className="font-heading text-[12px] md:text-[13px] font-light tracking-[0.15em] text-[#666666] leading-[2]">
                「一台相机的背后只能有一双眼睛，一个快门只给唯一的手指。在无法分析的瞬间快速地判断，充满乐趣。人很难同时在这里，又在那里，可是你看到刚刚拍下的照片，所有曾经存在过的瞬间一起绽放，生命的丰盛和喜悦，都在里面。」
              </p>
            </div>
            <p className="font-heading text-[9px] md:text-[10px] font-light tracking-[0.2em] pt-2 text-[#aaaaaa]">
              —— 陈绮贞
            </p>
          </div>
        </FadeIn>
      )}

      {/* Masonry wall — remaining photos */}
      <section className="mb-16 mx-auto max-w-[1500px]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-1"
        >
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-1">
              {col.map((item) => {
                const currentGlobal = globalIndex++;
                const dimmed = hoveredIndex !== null && hoveredIndex !== currentGlobal;
                const highlighted = hoveredIndex === currentGlobal;
                return (
                  <motion.div
                    key={item.photo.src}
                    variants={itemVariants}
                    onMouseEnter={() => setHoveredIndex(currentGlobal)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => openSlideshow(items.findIndex((i) => i.photo.src === item.photo.src))}
                  >
                    <div
                      data-cursor="view"
                      className={`relative overflow-hidden cursor-pointer transition-all duration-700 ${
                        dimmed
                          ? 'brightness-[0.4] saturate-[0.6] sepia-[0.12]'
                          : highlighted
                          ? 'brightness-105 scale-[1.015] z-10'
                          : ''
                      }`}
                    >
                      <RevealImage
                        src={item.photo.thumb || item.photo.src}
                        alt={item.photo.caption || item.photo.alt}
                        highlighted={highlighted}
                        srcSet={getSrcSet(item.photo)}
                        sizes={SIZES.masonry}
                      />
                      {/* Minimal label — bottom reveal on hover */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${
                          highlighted ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div className="px-3 pt-6 pb-2">
                          <span className="font-mono text-white/90 text-[8px] tracking-[0.25em] uppercase">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </section>

      <FadeIn delay={0.2}>
        <footer className="mt-40 pt-10 border-t border-[#f0f0f0]">
          <p className="font-mono text-[9px] text-[#dddddd] tracking-[0.15em]">
            © {new Date().getFullYear()} HUI ZZZI. All rights reserved.
          </p>
        </footer>
      </FadeIn>

      <Slideshow
        photos={items.map((i) => i.photo)}
        labels={items.map((i) => i.label)}
        initialIndex={slideshowIndex}
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
      />
    </main>
  );
}
