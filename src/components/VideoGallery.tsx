'use client';

import Image from 'next/image';
import FadeIn from '@/components/FadeIn';

export interface VideoItem {
  src: string;
  poster: string;
  title: string;
}

interface VideoGalleryProps {
  videos: VideoItem[];
  seriesTitle: string;
  seriesYear: string;
  onVideoClick: (video: VideoItem) => void;
}

export default function VideoGallery({ videos, seriesTitle, seriesYear, onVideoClick }: VideoGalleryProps) {
  return (
    <FadeIn delay={0.15}>
      <section className="mb-32">
        <h2 className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em] mb-10">
          Videos
        </h2>
        <div className="flex flex-col gap-16">
          {videos.map((video, i) => (
            <FadeIn key={i} delay={i * 0.1} direction="up">
              <div
                className="relative bg-[#0a0a0a] aspect-video overflow-hidden group cursor-pointer"
                onClick={() => onVideoClick(video)}
              >
                <Image
                  src={video.poster}
                  alt={video.title}
                  fill
                  className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-[1.02]"
                  loading={i < 2 ? 'eager' : 'lazy'}
                  unoptimized
                />

                {/* Darkening overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-all duration-700" />

                {/* Center play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:border-white/70 transition-all duration-500 ease-out">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-1 opacity-80">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Title — bottom left, like film credits */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-heading text-[13px] text-white/90 tracking-wide mb-1">
                    {video.title}
                  </p>
                  <p className="font-mono text-[8px] text-white/30 tracking-[0.2em] uppercase">
                    {seriesTitle} · {seriesYear}
                  </p>
                </div>

                {/* Subtle top-right index number */}
                <div className="absolute top-5 right-5 font-mono text-[9px] text-white/15 tracking-[0.15em]">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
