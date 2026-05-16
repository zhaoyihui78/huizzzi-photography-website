#!/bin/bash
set -e

SRC_DIR="/Users/zhao/huizzzi-photography-website/new-picture"
PHOTO_DIR="/Users/zhao/huizzzi-photography-website/public/works/webp/photos"
THUMB_DIR="/Users/zhao/huizzzi-photography-website/public/works/webp/thumbs"

start_num=23
idx=0

for f in $(ls "$SRC_DIR"/*.jpg "$SRC_DIR"/*.JPG 2>/dev/null | sort); do
    num=$(printf "%02d" $((start_num + idx)))
    basename=$(basename "$f")
    echo "Processing: $basename -> beijing${num}.webp"

    # Full-size photo: resize to 1920px on longest side, quality 85
    cwebp -q 85 -resize 1920 0 "$f" -o "$PHOTO_DIR/beijing${num}.webp"

    # Thumbnail: resize to 800px on longest side, quality 80
    cwebp -q 80 -resize 800 0 "$f" -o "$THUMB_DIR/beijing${num}.webp"

    # Get dimensions from the generated webp
    dims=$(file "$PHOTO_DIR/beijing${num}.webp" | grep -oE '[0-9]+x[0-9]+' | head -1)
    echo "  -> dimensions: $dims"

    idx=$((idx + 1))
done

echo "Done. Processed $idx photos."
