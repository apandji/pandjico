#!/usr/bin/env bash
# Animated WebP “story” from `images/projects/synek images/` (better than GIF for color + sharpness).
#
# — Most slides: scale + center-crop to fill the 16:10 canvas (full-bleed).
# — Ultra-wide only (aspect iw/ih > SYNEK_PAD_IF_WIDE): contain + cream letterbox (banner-style).
#
# Requires: ffmpeg, ffprobe, img2webp (brew install ffmpeg webp)
#
# Optional env:
#   SYNEK_STORY_W / SYNEK_STORY_H     default 1920×1200
#   SYNEK_STORY_DUR_MS               frame duration ms (default 550)
#   SYNEK_PAD_IF_WIDE                pad when iw/ih exceeds this (default 2.1)
#   SYNEK_PAD_COLOR                  ffmpeg pad hex without # (default f7eed9)
#   SYNEK_WEBP_Q                     lossy quality 0–100 (default 82)
#
# Usage:
#   bash scripts/build-synek-story-webp.sh
#   bash scripts/build-synek-story-webp.sh /path/to/out.webp
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/images/projects/synek images"
OUT_WEBP="${1:-$ROOT/images/projects/synek-story.webp}"
OUT_POSTER="$ROOT/images/projects/synek-story-poster.jpg"
W="${SYNEK_STORY_W:-1920}"
H="${SYNEK_STORY_H:-1200}"
DUR_MS="${SYNEK_STORY_DUR_MS:-550}"
PAD_WIDE="${SYNEK_PAD_IF_WIDE:-2.1}"
PAD="${SYNEK_PAD_COLOR:-f7eed9}"
QUALITY="${SYNEK_WEBP_Q:-82}"

FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
FFPROBE="${FFPROBE:-/opt/homebrew/bin/ffprobe}"
IMG2WEBP="${IMG2WEBP:-/opt/homebrew/bin/img2webp}"
command -v "$FFMPEG" >/dev/null 2>&1 || FFMPEG="ffmpeg"
command -v "$FFPROBE" >/dev/null 2>&1 || FFPROBE="ffprobe"
command -v "$IMG2WEBP" >/dev/null 2>&1 || IMG2WEBP="img2webp"

frames=(
    "$SRC/Banner2.png"
    "$SRC/synek-card.png"
    "$SRC/portfosy-1.png"
    "$SRC/BronzeAction.png"
    "$SRC/Square-Cardboard-Boxes-Mockup-vol-2.png"
    "$SRC/thumbnail_synek.png"
)

for f in "${frames[@]}"; do
    if [[ ! -f "$f" ]]; then
        echo "Missing: $f" >&2
        exit 1
    fi
done

TMP=$(mktemp -d "${TMPDIR:-/tmp}/synek-webp.XXXXXX")
cleanup() {
    rm -rf "$TMP"
}
trap cleanup EXIT

idx=0
for f in "${frames[@]}"; do
    wh=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f")
    iw=${wh%,*}
    ih=${wh#*,}
    use_pad=$(
        awk -v iw="$iw" -v ih="$ih" -v lim="$PAD_WIDE" 'BEGIN {
            if (ih < 1) exit 1
            r = iw / ih
            print (r > lim) ? 1 : 0
        }'
    )

    if [[ "$use_pad" == "1" ]]; then
        vf="scale=w=${W}:h=${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x${PAD},format=rgba"
    else
        vf="scale=w=${W}:h=${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}:(iw-${W})/2:(ih-${H})/2,format=rgba"
    fi

    out="$TMP/$(printf '%02d' "$idx").png"
    "$FFMPEG" -hide_banner -loglevel error -y -i "$f" -vf "$vf" -frames:v 1 "$out"
    idx=$((idx + 1))
done

webp_args=("$IMG2WEBP" -loop 0 -sharp_yuv)
for p in "$TMP"/*.png; do
    [[ -f "$p" ]] || continue
    webp_args+=(-lossy -q "$QUALITY" -d "$DUR_MS" "$p")
done
webp_args+=(-o "$OUT_WEBP")
"${webp_args[@]}"

"$FFMPEG" -hide_banner -loglevel error -y -i "$TMP/00.png" -q:v 90 "$OUT_POSTER"

ls -lh "$OUT_WEBP" "$OUT_POSTER"
echo "Card markup: <picture>…<source type=\"image/webp\" srcset=\"images/projects/$(basename "$OUT_WEBP")\" />…"
