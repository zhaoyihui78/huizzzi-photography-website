/**
 * Image Compression Script
 *
 * Generates WebP versions of all photos and thumbs:
 * - photos/ → webp/photos/  (1920px wide, quality 90)
 * - thumbs/ → webp/thumbs/  (800px wide, quality 80)
 * - photos/film/ → webp/photos/film/  (1920px wide, quality 90)
 *
 * Then updates src/data/series.ts to use .webp paths.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(ROOT, 'public', 'works', 'photos');
const THUMBS_DIR = path.join(ROOT, 'public', 'works', 'thumbs');
const WEBP_PHOTOS_DIR = path.join(ROOT, 'public', 'works', 'webp', 'photos');
const WEBP_THUMBS_DIR = path.join(ROOT, 'public', 'works', 'webp', 'thumbs');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function compressImage(inputPath, outputPath, width, quality) {
  const pipeline = sharp(inputPath).webp({ quality });
  if (width) {
    pipeline.resize(width, null, { withoutEnlargement: true });
  }
  await pipeline.toFile(outputPath);
}

async function processDirectory(inputDir, outputDir, width, quality) {
  await ensureDir(outputDir);
  const entries = fs.readdirSync(inputDir, { withFileTypes: true });
  for (const entry of entries) {
    const inputPath = path.join(inputDir, entry.name);
    const outputPath = path.join(outputDir, entry.name.replace(/\.[^.]+$/, '.webp'));

    if (entry.isDirectory()) {
      await processDirectory(inputPath, path.join(outputDir, entry.name), width, quality);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    // Skip if already exists and newer
    if (fs.existsSync(outputPath)) {
      const inStat = fs.statSync(inputPath);
      const outStat = fs.statSync(outputPath);
      if (outStat.mtime >= inStat.mtime) {
        console.log(`  Skip (up-to-date): ${path.relative(ROOT, outputPath)}`);
        continue;
      }
    }

    await compressImage(inputPath, outputPath, width, quality);
    const inSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
    const outSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  ${path.relative(ROOT, inputPath)} → ${path.relative(ROOT, outputPath)} (${inSize}KB → ${outSize}KB)`);
  }
}

async function updateSeriesTs() {
  const seriesPath = path.join(ROOT, 'src', 'data', 'series.ts');
  let content = fs.readFileSync(seriesPath, 'utf-8');

  // Replace /works/photos/... .jpg → /works/webp/photos/... .webp
  // Replace /works/thumbs/... .jpg → /works/webp/thumbs/... .webp
  content = content.replace(/\/works\/photos\/([^`]+)\.jpg/g, '/works/webp/photos/$1.webp');
  content = content.replace(/\/works\/thumbs\/([^`]+)\.jpg/g, '/works/webp/thumbs/$1.webp');

  fs.writeFileSync(seriesPath, content, 'utf-8');
  console.log('\nUpdated src/data/series.ts to use .webp paths');
}

async function main() {
  console.log('Compressing images...\n');

  await ensureDir(WEBP_PHOTOS_DIR);
  await ensureDir(WEBP_THUMBS_DIR);

  console.log('Photos (1920px, quality 90):');
  await processDirectory(PHOTOS_DIR, WEBP_PHOTOS_DIR, 1920, 90);

  console.log('\nThumbs (800px, quality 80):');
  await processDirectory(THUMBS_DIR, WEBP_THUMBS_DIR, 800, 80);

  console.log('\nUpdating series.ts...');
  await updateSeriesTs();

  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
