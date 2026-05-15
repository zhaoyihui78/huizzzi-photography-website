/**
 * Upload WebP images to Tencent COS
 *
 * Usage:
 *   export COS_SECRET_ID=xxx
 *   export COS_SECRET_KEY=xxx
 *   export COS_BUCKET=photo-1392627581
 *   export COS_REGION=ap-beijing
 *   node scripts/upload-webp-to-cos.js
 */

const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

const ROOT = path.resolve(__dirname, '..');
const WEBP_DIR = path.join(ROOT, 'public', 'works', 'webp');

const SECRET_ID = process.env.COS_SECRET_ID || '';
const SECRET_KEY = process.env.COS_SECRET_KEY || '';
const BUCKET = process.env.COS_BUCKET || 'photo-1392627581';
const REGION = process.env.COS_REGION || 'ap-beijing';

if (!SECRET_ID || !SECRET_KEY) {
  console.error('Error: Please set COS_SECRET_ID and COS_SECRET_KEY environment variables.');
  console.error('You can get them from https://console.cloud.tencent.com/cam/capi');
  process.exit(1);
}

const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
});

async function uploadDir(localDir, cosPrefix) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const cosKey = `${cosPrefix}/${entry.name}`;

    if (entry.isDirectory()) {
      await uploadDir(localPath, cosKey);
      continue;
    }

    console.log(`Uploading: ${localPath} → cos://${BUCKET}/${cosKey}`);

    await new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: BUCKET,
          Region: REGION,
          Key: cosKey,
          Body: fs.createReadStream(localPath),
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        },
        (err, data) => {
          if (err) {
            console.error(`  Failed: ${cosKey}`, err.message);
            reject(err);
          } else {
            console.log(`  OK: ${cosKey}`);
            resolve(data);
          }
        }
      );
    });
  }
}

async function main() {
  console.log('Uploading WebP images to COS...\n');
  await uploadDir(WEBP_DIR, 'works/webp');
  console.log('\nAll done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
