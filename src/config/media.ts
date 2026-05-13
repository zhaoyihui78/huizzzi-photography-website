/**
 * Video asset URL resolver.
 *
 * Supports three deployment modes:
 * - Local / intranet: NEXT_PUBLIC_VIDEO_BASE='' (default)
 * - GitHub Release:   NEXT_PUBLIC_VIDEO_BASE='release'
 * - CDN (e.g. COS):   NEXT_PUBLIC_VIDEO_BASE='https://cdn.yourdomain.com'
 */

const RELEASE_BASE =
  'https://github.com/zhaoyihui78/huizzzi-photography-website/releases/download/v1.0.0';

const RELEASE_URLS: Record<string, string> = {
  故宫春雪: `${RELEASE_BASE}/gugongchunxue.mp4`,
  北海的秋: `${RELEASE_BASE}/beihaiqiu.mp4`,
  颐和园的晚霞: `${RELEASE_BASE}/yiheyuandexia.mp4`,
  圆明园的秋: `${RELEASE_BASE}/yuanmingyuan.mp4`,
  新年天坛: `${RELEASE_BASE}/qiniannafu.mp4`,
};

export function getVideoUrl(title: string, localPath: string): string {
  const base = process.env.NEXT_PUBLIC_VIDEO_BASE ?? '';

  if (base === 'release') {
    return RELEASE_URLS[title] || localPath;
  }

  if (base) {
    // CDN mode: base + localPath  →  https://cdn.xxx.com/works/videos/...
    return `${base}${localPath}`;
  }

  // Local / intranet mode
  return localPath;
}
