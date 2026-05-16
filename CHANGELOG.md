# Changelog

## 2025-05-16

### Private Gallery (/we)
- **New page** — Private girlfriend photo gallery at `/we`
  - Password-protected lock screen with base64-obfuscated password
  - 5-attempt brute-force lockout (60s cooldown)
  - 6-second intro animation (blur reveal + curtain slide)
  - Meeting chronicle wall grouping 67 photos across 13 meetups
  - Lightbox with audio player (plays only in story mode)
  - Sticky notes section with sync code for cross-device sharing
  - Custom meeting names
- **New editor** — Drag-and-drop photo assignment at `/we/edit`
  - Assign photos to meetings via native HTML5 drag-and-drop
  - Rename meetings inline
  - Export `we-layout.json` config

### Security
- Password no longer hardcoded in plaintext (`verifyPassword()` with base64 hash)
- Brute-force protection: 5 failed attempts -> 60s lock (persisted in localStorage)
- `robots.txt` updated with `Disallow: /we/`
- `/we` layout exports `noindex, nofollow` metadata

### COS (Tencent Cloud Object Storage)
- All webp photos migrated to COS bucket `photo-1392627581` in `ap-beijing`
- Added `NEXT_PUBLIC_IMAGE_BASE` and `NEXT_PUBLIC_PRIVATE_CDN` env support
- Private photos now load from COS instead of local `public/` directory
- Fixed missing `/works/webp/private` path prefix in private photo URLs

### Content
- Added 30 new Beijing photos (`beijing23.webp` ~ `beijing52.webp`)
- Added private photo EXIF data scripts

### Performance
- Added `loading="lazy"` to `FilmFrame` component in series detail pages
- Confirmed lazy loading already active via Next.js Image defaults and Framer Motion `whileInView`

## 2025-05-15

### Guestbook
- Envelope fly-out + card drop-in animation
- Optimistic comment updates
- Linkify URLs, relative timestamps, avatar fallbacks

### Photography Series
- Refactored photo map: SVG vector rendering with real GPS alignment
- Parchment art style for map backgrounds

---

## Environment Variables Required

```bash
# COS photo CDN
NEXT_PUBLIC_IMAGE_BASE=https://photo-1392627581.cos.ap-beijing.myqcloud.com
NEXT_PUBLIC_PRIVATE_CDN=https://photo-1392627581.cos.ap-beijing.myqcloud.com

# COS deploy credentials (for scripts only, not client)
COS_SECRET_ID=xxx
COS_SECRET_KEY=xxx
COS_BUCKET=photo-1392627581
COS_REGION=ap-beijing
```
