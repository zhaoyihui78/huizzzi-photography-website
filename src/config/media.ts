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
  // Local dev branch: always use local paths
  return localPath;
}
