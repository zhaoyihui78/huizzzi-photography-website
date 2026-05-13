#!/bin/bash
# Post-build cleanup for static export.
# Removes large video files from out/ since they are served via GitHub Release CDN.

BUILD_DIR="${1:-out}"

echo "[CLEAN] Removing video files from $BUILD_DIR/works/videos ..."
find "$BUILD_DIR/works/videos" -name '*.mp4' -delete 2>/dev/null || true

# Verify
REMAINING=$(find "$BUILD_DIR/works/videos" -name '*.mp4' | wc -l)
echo "[CLEAN] Remaining mp4 files: $REMAINING"
