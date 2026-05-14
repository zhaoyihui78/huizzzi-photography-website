#!/bin/bash
# Post-build cleanup for static export.
# Videos are now compressed and deployed with Vercel (no external CDN needed).

BUILD_DIR="${1:-out}"

echo "[CLEAN] Videos are kept in static output for direct Vercel deployment."
echo "[CLEAN] Build dir: $BUILD_DIR"
