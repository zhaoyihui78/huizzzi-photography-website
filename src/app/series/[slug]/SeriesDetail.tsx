'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Series, Photo } from '@/data/series';
import FadeIn from '@/components/FadeIn';
import Lightbox from '@/components/Lightbox';
import VideoLightbox from '@/components/VideoLightbox';

interface Props {
  series: Series;
}

export default function SeriesDetail({ series }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [videoOpen, setVideoOpen] = useState<{ src: string; poster: string; title: string } | null>(null);

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
            {series.description}
          </p>
        </header>
      </FadeIn>

      {/* Videos */}
      {series.videos && series.videos.length > 0 && (
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
      )}

      {/* Photos — 统一画册式 split 布局 */}
      {series.photos.length > 0 && (
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
