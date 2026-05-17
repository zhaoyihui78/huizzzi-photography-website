/**
 * Image asset URL resolver.
 *
 * Supports two deployment modes:
 * - Local / default: NEXT_PUBLIC_IMAGE_BASE='' (default)
 * - CDN (e.g. COS):   NEXT_PUBLIC_IMAGE_BASE='https://cdn.yourdomain.com'
 */

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? '';

export function getImageUrl(localPath: string): string {
  // If no base is set, return local path
  if (!IMAGE_BASE) return localPath;
  
  // If we are in local development without explicitly wanting to use COS, use local paths
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_FORCE_COS) {
    return localPath;
  }
  
  return `${IMAGE_BASE}${localPath}`;
}
