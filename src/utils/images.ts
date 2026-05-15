import { Photo } from '@/data/series';

/**
 * Generate srcSet string from photo's thumb and src.
 * Returns undefined if thumb === src (no separate thumb available).
 */
export function getSrcSet(photo: Photo): string | undefined {
  if (!photo.thumb || photo.thumb === photo.src) return undefined;
  return `${photo.thumb} 800w, ${photo.src} 1920w`;
}

/**
 * Common sizes descriptors for responsive images.
 */
export const SIZES = {
  /** Full viewport width (hero images) */
  fullWidth: '100vw',
  /** Masonry grid items (1-3 columns) */
  masonry: '(max-width: 768px) 90vw, 33vw',
  /** Split layout photo (takes ~65% width on desktop) */
  split: '(max-width: 768px) 90vw, 55vw',
  /** Polaroid / 3-column film layout */
  polaroid: '(max-width: 768px) 90vw, 33vw',
  /** Generic card / fallback */
  card: '(max-width: 768px) 90vw, 45vw',
} as const;
