#!/usr/bin/env bash
# Build a looping “thumbnail story” GIF from `images/projects/synek images/`.
# — Each slide is scaled down and letterboxed to a fixed 16:10 frame (matches work-card figure).
# — Edit the `frames` array below to change order or add/remove shots.
# Optional env:
#   SYNEK_STORY_W / SYNEK_STORY_H   canvas (default 1920×1200 — sharper on retina cards)
#   SYNEK_STORY_SLIDE_SEC            seconds per slide (default 0.55)
#   SYNEK_STORY_COLORS              GIF palette 2–256 (default 256)
#   SYNEK_PAD_COLOR                 Letterbox fill, ffmpeg hex e.g. 0xf7eed9 (warm cream; not black)
#   SYNEK_DITHER                    bayer | sierra2_4a | none (default bayer)
#   SYNEK_BAYER_SCALE               1–5, only for bayer (default 2 — less grainy than 3)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/images/projects/synek images"
OUT="${1:-$ROOT/images/projects/synek-story.gif}"
W="${SYNEK_STORY_W:-1920}"
H="${SYNEK_STORY_H:-1200}"
DUR="${SYNEK_STORY_SLIDE_SEC:-0.55}"
COLORS="${SYNEK_STORY_COLORS:-256}"
PAD="${SYNEK_PAD_COLOR:-0xf7eed9}"
DITHER="${SYNEK_DITHER:-bayer}"
BAYER_SCALE="${SYNEK_BAYER_SCALE:-2}"

FFMPEG="${FFMPEG:-/opt/homebrew/bin/ffmpeg}"
command -v "$FFMPEG" >/dev/null 2>&1 || FFMPEG="ffmpeg"

# Story order (edit freely). Paths must stay under "$SRC".
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
        echo "Missing file: $f" >&2
        exit 1
    fi
done

n=${#frames[@]}
if [[ $n -lt 2 ]]; then
    echo "Need at least 2 frames." >&2
    exit 1
fi

args=()
fc=""
for i in "${!frames[@]}"; do
    args+=(-loop 1 -t "$DUR" -i "${frames[$i]}")
    fc+="[$i:v]scale=w=${W}:h=${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${PAD},setsar=1[v$i];"
done

conc=""
for ((i = 0; i < n; i++)); do
    conc+="[v$i]"
done
fc+="${conc}concat=n=${n}:v=1:a=0[vcat];"
fc+="[vcat]format=rgb24,split[s0][s1];[s0]palettegen=max_colors=${COLORS}:reserve_transparent=0:stats_mode=full[p];"

if [[ "$DITHER" == "none" ]]; then
    fc+="[s1][p]paletteuse=dither=none[vout]"
elif [[ "$DITHER" == "sierra2_4a" ]]; then
    fc+="[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle[vout]"
else
    fc+="[s1][p]paletteuse=dither=bayer:bayer_scale=${BAYER_SCALE}:diff_mode=rectangle[vout]"
fi

"$FFMPEG" -y "${args[@]}" -filter_complex "$fc" -map "[vout]" "$OUT"

ls -lh "$OUT"
echo "Use on the SYNEK card: images/projects/$(basename "$OUT")"
