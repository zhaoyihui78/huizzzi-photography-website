#!/usr/bin/env python3
import os
import subprocess
import glob

SRC_DIR = "/Users/zhao/huizzzi-photography-website/new-picture"
PHOTO_DIR = "/Users/zhao/huizzzi-photography-website/public/works/webp/photos"
THUMB_DIR = "/Users/zhao/huizzzi-photography-website/public/works/webp/thumbs"

files = sorted(glob.glob(os.path.join(SRC_DIR, "*.jpg")) + glob.glob(os.path.join(SRC_DIR, "*.JPG")))

start_num = 23
results = []

for idx, f in enumerate(files):
    num = f"{start_num + idx:02d}"
    basename = os.path.basename(f)
    print(f"Processing: {basename} -> beijing{num}.webp")

    photo_path = os.path.join(PHOTO_DIR, f"beijing{num}.webp")
    thumb_path = os.path.join(THUMB_DIR, f"beijing{num}.webp")

    # Full-size photo: resize to 1920px on longest side, quality 85
    subprocess.run(["cwebp", "-q", "85", "-resize", "1920", "0", f, "-o", photo_path], check=True)

    # Thumbnail: resize to 800px on longest side, quality 80
    subprocess.run(["cwebp", "-q", "80", "-resize", "800", "0", f, "-o", thumb_path], check=True)

    # Get dimensions
    result = subprocess.run(["file", photo_path], capture_output=True, text=True, check=True)
    # Parse like: RIFF ... Web/P image, VP8 encoding, 1920x1282, ...
    import re
    m = re.search(r'(\d+)x(\d+)', result.stdout)
    if m:
        w, h = int(m.group(1)), int(m.group(2))
    else:
        w, h = 1920, 1280
    print(f"  -> dimensions: {w}x{h}")
    results.append((num, basename, w, h))

print(f"\nDone. Processed {len(results)} photos.")
print("\nSummary for series.ts update:")
for num, basename, w, h in results:
    caption = os.path.splitext(basename)[0]
    print(f"  '{num}': [{w}, {h}],  // {caption}")
