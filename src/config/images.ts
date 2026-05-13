/**
 * Image asset URL resolver.
 *
 * Supports two deployment modes:
 * - Local / default: NEXT_PUBLIC_IMAGE_BASE='' (default)
 * - CDN (e.g. COS):   NEXT_PUBLIC_IMAGE_BASE='https://cdn.yourdomain.com'
 */

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? '';

export function getImageUrl(localPath: string): string {
  if (!IMAGE_BASE) return localPath;
  return `${IMAGE_BASE}${localPath}`;
}
