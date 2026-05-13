#!/usr/bin/env python3
"""
Deploy the photography portfolio to Tencent Cloud COS + CDN.

Prerequisites:
    pip install cos-python-sdk-v5

Usage:
    # 1. Fill in the CONFIG section below, then:
    python3 deploy_cos.py

    # 2. Or set env vars:
    export COS_SECRET_ID=your-secret-id
    export COS_SECRET_KEY=your-secret-key
    export COS_REGION=ap-beijing
    export COS_BUCKET=huizzzi-website-125xxxxxx
    export VIDEO_CDN=https://cdn.yourdomain.com
    python3 deploy_cos.py
"""

import os
import sys
import mimetypes
from pathlib import Path
from qcloud_cos import CosConfig, CosS3Client

# ============================================================================
# CONFIG — fill these in or use environment variables
# ============================================================================
SECRET_ID = os.environ.get('COS_SECRET_ID', '')
SECRET_KEY = os.environ.get('COS_SECRET_KEY', '')
REGION = os.environ.get('COS_REGION', 'ap-beijing')       # e.g. ap-beijing, ap-shanghai, ap-guangzhou
BUCKET = os.environ.get('COS_BUCKET', '')                  # e.g. huizzzi-website-1250000000
VIDEO_CDN = os.environ.get('VIDEO_CDN', '')                # e.g. https://cdn.yourdomain.com

# Local paths (relative to this script)
PROJECT_ROOT = Path(__file__).parent
VIDEO_DIR = PROJECT_ROOT / 'public' / 'works' / 'videos'
SITE_DIR = PROJECT_ROOT / 'out'

# COS remote prefixes
VIDEO_PREFIX = 'works/videos'
SITE_PREFIX = ''        # static site files go to root

# Upload options
VIDEO_STORAGE_CLASS = 'STANDARD_IA'   # Infrequent Access for large videos (cheaper)
SITE_STORAGE_CLASS = 'STANDARD'

# ============================================================================


def get_content_type(file_path: Path) -> str:
    ctype, _ = mimetypes.guess_type(str(file_path))
    return ctype or 'application/octet-stream'


def upload_directory(client: CosS3Client, local_dir: Path, remote_prefix: str, storage_class: str):
    """Recursively upload a directory to COS."""
    if not local_dir.exists():
        print(f"[SKIP] Directory not found: {local_dir}")
        return

    files = [f for f in local_dir.rglob('*') if f.is_file()]
    total = len(files)
    print(f"[UPLOAD] {total} files from '{local_dir}' → cos://{BUCKET}/{remote_prefix or ''}")

    for i, file_path in enumerate(files, 1):
        rel = file_path.relative_to(local_dir)
        key = f"{remote_prefix}/{rel}".replace('//', '/').lstrip('/')
        content_type = get_content_type(file_path)

        try:
            with open(file_path, 'rb') as fp:
                client.put_object(
                    Bucket=BUCKET,
                    Body=fp,
                    Key=key,
                    ContentType=content_type,
                    StorageClass=storage_class,
                )
            print(f"  [{i}/{total}] {key}  ({content_type})")
        except Exception as e:
            print(f"  [ERROR] {key}: {e}", file=sys.stderr)


def validate():
    if not SECRET_ID or not SECRET_KEY:
        print("[ERROR] COS_SECRET_ID and COS_SECRET_KEY are required.", file=sys.stderr)
        print("Set them as environment variables or edit deploy_cos.py directly.", file=sys.stderr)
        sys.exit(1)

    if not BUCKET:
        print("[ERROR] COS_BUCKET is required.", file=sys.stderr)
        sys.exit(1)

    if not VIDEO_CDN:
        print("[WARN] VIDEO_CDN not set. Videos will reference local paths.", file=sys.stderr)

    if not SITE_DIR.exists():
        print(f"[ERROR] Site directory not found: {SITE_DIR}", file=sys.stderr)
        print("Run 'npm run build' first.", file=sys.stderr)
        sys.exit(1)


def main():
    validate()

    config = CosConfig(
        Region=REGION,
        SecretId=SECRET_ID,
        SecretKey=SECRET_KEY,
        Token=None,
        Scheme='https',
    )
    client = CosS3Client(config)

    # 1. Upload videos
    print("\n" + "=" * 60)
    print("STEP 1: Uploading videos to COS")
    print("=" * 60)
    upload_directory(client, VIDEO_DIR, VIDEO_PREFIX, VIDEO_STORAGE_CLASS)

    # 2. Build site with CDN video paths
    print("\n" + "=" * 60)
    print("STEP 2: Building static site with CDN paths")
    print("=" * 60)
    env = os.environ.copy()
    env['NEXT_PUBLIC_VIDEO_BASE'] = VIDEO_CDN
    ret = os.system(f"cd {PROJECT_ROOT} && NEXT_PUBLIC_VIDEO_BASE={VIDEO_CDN} npx next build")
    if ret != 0:
        print("[ERROR] Build failed.", file=sys.stderr)
        sys.exit(1)

    # 3. Upload static site files
    print("\n" + "=" * 60)
    print("STEP 3: Uploading static site to COS")
    print("=" * 60)
    upload_directory(client, SITE_DIR, SITE_PREFIX, SITE_STORAGE_CLASS)

    # 4. Done
    print("\n" + "=" * 60)
    print("DEPLOY COMPLETE")
    print("=" * 60)
    print(f"Bucket:    {BUCKET}")
    print(f"Region:    {REGION}")
    print(f"Video CDN: {VIDEO_CDN or '(local paths)'}")
    print("\nNext steps:")
    print("  1. Enable static website hosting in COS console.")
    print("  2. Bind your custom domain and enable CDN.")
    print("  3. Configure HTTPS certificate.")
    print("=" * 60)


if __name__ == '__main__':
    main()
