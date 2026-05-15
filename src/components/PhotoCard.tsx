'use client';

import { Photo } from '@/data/series';
import { getSrcSet, SIZES } from '@/utils/images';

interface PhotoCardProps {
  photo: Photo;
  fill?: boolean;
  className?: string;
  imgClassName?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  onClick?: () => void;
}

export default function PhotoCard({
  photo,
  fill = false,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  sizes = SIZES.card,
  onClick,
}: PhotoCardProps) {
  const srcSet = getSrcSet(photo);
  const exifText = photo.exif
    ? `${photo.exif.camera}  ·  ${photo.exif.lens}  ·  ${photo.exif.aperture}  ·  ${photo.exif.shutter}  ·  ${photo.exif.iso}`
    : '';

  return (
    <div
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Image with grayscale → color transition */}
      {fill ? (
        <img
          src={photo.thumb || photo.src}
          alt={photo.alt}
          className={`absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-[1.03] ${imgClassName}`}
          loading={loading}
          srcSet={srcSet}
          sizes={sizes}
        />
      ) : (
        <img
          src={photo.thumb || photo.src}
          alt={photo.alt}
          width={photo.width || 800}
          height={photo.height || 600}
          className={`w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-[1.03] ${imgClassName}`}
          loading={loading}
          srcSet={srcSet}
          sizes={sizes}
        />
      )}

      {/* Vignette overlay on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.15)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* EXIF info bar */}
      {photo.exif && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
        >
          <p className="font-mono text-[8px] text-white/70 tracking-[0.12em] truncate">
            {exifText}
          </p>
        </div>
      )}
    </div>
  );
}
