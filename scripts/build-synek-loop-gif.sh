#!/usr/bin/env bash
# Stitch ordered stills into a looping GIF for the SYNEK work card (or any frame folder).
#
# 1) mkdir -p images/projects/synek-frames
# 2) Export frames with zero-padded names so sort order is correct, e.g.
#      01.png … 09.png, 10.png …   (not 1.png,10.png,2.png)
# 3) Run from repo root:
#      ./scripts/build-synek-loop-gif.sh
#
# Optional env:
#   SYNEK_GIF_FPS=7        frames per second (default 7)
#   SYNEK_GIF_MAX_W=900    max width in px (default 900)
#   SYNEK_GIF_COLORS=128   palette size (default 128; try 96 for smaller files)
#
# For a seamless loop, make the last frame visually match the first (or cross-fade in design).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FR_DIR="${1:-$ROOT/images/projects/synek-frames}"
OUT="${2:-$ROOT/images/projects/synek-loop.gif}"
FPS="${SYNEK_GIF_FPS:-7}"
MAX_W="${SYNEK_GIF_MAX_W:-900}"
COLORS="${SYNEK_GIF_COLORS:-128}"

FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
if ! command -v "$FFMPEG" >/dev/null 2>&1; then
    FFMPEG="ffmpeg"
fi

frames=()
while IFS= read -r f; do
    [[ -n "$f" ]] && frames+=("$f")
done < <(
    find "$FR_DIR" -maxdepth 1 -type f \( \
        -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \
    \) | LC_ALL=C sort
)

if [[ ${#frames[@]} -lt 2 ]]; then
    echo "Need at least 2 images in: $FR_DIR" >&2
    echo "Add PNG/JPEG/WebP files with zero-padded names (01.png, 02.png, …)." >&2
    exit 1
fi

CONCAT=$(mktemp /tmp/synek-concat.XXXXXX.txt)
cleanup() { rm -f "$CONCAT"; }
trap cleanup EXIT

dur=$(awk -v f="$FPS" 'BEGIN { printf "%.5f", 1.0 / f }')
last=$((${#frames[@]} - 1))
i=0
for f in "${frames[@]}"; do
    printf "file '%s'\n" "${f//\'/\'\\\'\'}"
    if [[ $i -lt $last ]]; then
        printf "duration %s\n" "$dur"
    fi
    i=$((i + 1))
done >"$CONCAT"
# Concat demuxer: repeat last file so the final duration is honored.
printf "file '%s'\n" "${frames[$last]//\'/\'\\\'\'}" >>"$CONCAT"

"$FFMPEG" -y -f concat -safe 0 -i "$CONCAT" \
    -vf "scale=w=min($MAX_W\,iw):h=-2:flags=lanczos,setsar=1,split[s0][s1];[s0]palettegen=max_colors=${COLORS}:reserve_transparent=1:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
    "$OUT"

ls -lh "$OUT"
echo "Done. Point the SYNEK card at: images/projects/$(basename "$OUT")"
