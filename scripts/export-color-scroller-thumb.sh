#!/usr/bin/env bash
# Regenerate work-card thumbnails from the source MOV (run from repo root).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/images/projects/Pandji_Andrew_ColorScroller_4.MOV"
OUT_W="$ROOT/images/projects/color-scroller-thumb.webp"
OUT_J="$ROOT/images/projects/color-scroller-thumb.jpg"
FRAME="$(mktemp /tmp/color-scroller-frame.XXXXXX.png)"
cleanup() { rm -f "$FRAME"; }
trap cleanup EXIT

if [[ ! -f "$SRC" ]]; then
    echo "Missing source: $SRC" >&2
    exit 1
fi

ffmpeg -y -ss 2.2 -i "$SRC" -frames:v 1 -vf "scale=1600:-1:flags=lanczos" -update 1 "$FRAME"
cwebp -q 82 "$FRAME" -o "$OUT_W"
ffmpeg -y -i "$FRAME" -update 1 -q:v 88 "$OUT_J"

OUT_MP4="$ROOT/images/projects/color-scroller-loop.mp4"
ffmpeg -y -i "$SRC" -an -vf "scale=1600:-2:flags=lanczos,fps=30" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart "$OUT_MP4"

ls -lh "$OUT_W" "$OUT_J" "$OUT_MP4"
