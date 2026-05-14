/**
 * Video asset URL resolver.
 *
 * Supports three deployment modes:
 * - Local / intranet: NEXT_PUBLIC_VIDEO_BASE='' (default)
 * - GitHub Release:   NEXT_PUBLIC_VIDEO_BASE='release'
 * - CDN (e.g. COS):   NEXT_PUBLIC_VIDEO_BASE='https://cdn.yourdomain.com'
 */

const COS_BASE = 'https://photo-1392627581.cos.ap-beijing.myqcloud.com';

export function getVideoUrl(_title: string, localPath: string): string {
  const base = process.env.NEXT_PUBLIC_VIDEO_BASE ?? COS_BASE;

  if (base) {
    // CDN mode: base + localPath → https://photo-xxx.cos.ap-beijing.myqcloud.com/works/videos/...
    return `${base}${localPath}`;
  }

  // Local / intranet mode (set NEXT_PUBLIC_VIDEO_BASE='')
  return localPath;
}
