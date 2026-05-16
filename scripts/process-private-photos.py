#!/usr/bin/env python3
import os
import subprocess
import glob

SRC_DIR = "/Users/zhao/huizzzi-photography-website/we"
PHOTO_DIR = "/Users/zhao/huizzzi-photography-website/public/works/webp/private/photos"
THUMB_DIR = "/Users/zhao/huizzzi-photography-website/public/works/webp/private/thumbs"

files = sorted(glob.glob(os.path.join(SRC_DIR, "*.jpg")) + glob.glob(os.path.join(SRC_DIR, "*.JPG")))

results = []

for idx, f in enumerate(files):
    num = f"{idx + 1:02d}"
    basename = os.path.basename(f)
    print(f"Processing: {basename} -> private{num}.webp")

    photo_path = os.path.join(PHOTO_DIR, f"private{num}.webp")
    thumb_path = os.path.join(THUMB_DIR, f"private{num}.webp")

    # Full-size photo
    subprocess.run(["cwebp", "-q", "85", "-resize", "1920", "0", f, "-o", photo_path], check=True)

    # Thumbnail
    subprocess.run(["cwebp", "-q", "80", "-resize", "800", "0", f, "-o", thumb_path], check=True)

    # Get dimensions
    result = subprocess.run(["file", photo_path], capture_output=True, text=True, check=True)
    import re
    m = re.search(r'(\d+)x(\d+)', result.stdout)
    if m:
        w, h = int(m.group(1)), int(m.group(2))
    else:
        w, h = 1920, 1280
    print(f"  -> dimensions: {w}x{h}")
    results.append((num, w, h))

print(f"\nDone. Processed {len(results)} photos.")
