#!/usr/bin/env bash
# Rebuilds public/media/ from the source folder (WU-06, docs/07-INFRASTRUCTURE.md §Media pipeline).
#
#   bash scripts/build-media.sh
#   SRC="/path/to/originals" bash scripts/build-media.sh
#
# Requires ffmpeg + ffprobe on PATH (verified with 8.1-full_build).
# Everything published is H.264 / yuv420p, silent (G-001) and stripped of metadata: the
# iPhone sources carry GPS coordinates and timestamps that must not reach a public file.
# Sources are temporary: when CR-01/CR-02 arrive, point SRC at them and run this again.

set -euo pipefail

SRC="${SRC:-/c/Users/mateo/Downloads/contenido-araucaria}"
VID="$SRC/videos-muestra-salon"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/media"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found"; exit 1; }
[ -d "$SRC" ] || { echo "source folder not found: $SRC"; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT/galeria" "$OUT/fotos"

# clip <input> <start> <duration> <width> <crf> <output>
clip() {
  ffmpeg -y -v error -ss "$2" -t "$3" -i "$1" \
    -an -map_metadata -1 -c:v libx264 -preset slow -crf "$5" \
    -pix_fmt yuv420p -profile:v high -level 4.0 \
    -vf "scale=$4:-2,fps=30" -movflags +faststart "$6"
}

# frame <input> <at> <width> <output.jpg>
frame() {
  ffmpeg -y -v error -ss "$2" -i "$1" -frames:v 1 -map_metadata -1 -q:v 4 -vf "scale=$3:-2" "$4"
}

# ---- Hero -------------------------------------------------------------------
# Dos tomas, las dos en PLANO GENERAL y las dos de 720: recortado a horizontal, un plano corto
# se lee como un primer plano borroso (Mateo, 2026-09-21: "todos los videos muy cerca en
# desktop"). Del recorrido solo 1-6 s y 12-17 s están filmados de lejos; entre medio la cámara
# va pegada a la galería, y después de 17 s vienen un pasillo, una cocina vieja, un baño y la
# marca de agua de CapCut. Los tiles de WhatsApp no sirven acá: son de 480 de ancho y en una
# pantalla de 1920 se amplían 4 veces.
# El póster es el primer cuadro de la primera toma, así no hay salto al arrancar.
HERO="$VID/IMG_9789.MOV"
clip  "$HERO" 12 5 720 30 "$OUT/hero-pileta.mp4"
frame "$HERO" 12 1080 "$OUT/hero-pileta-poster.jpg"
ffmpeg -y -v error -ss 12 -i "$HERO" -frames:v 1 -map_metadata -1   -c:v libaom-av1 -crf 34 -cpu-used 6 -still-picture 1 "$OUT/hero-pileta-poster.avif"

clip  "$HERO" 1 4 720 30 "$OUT/hero-jardin.mp4"
frame "$HERO" 1 1080 "$OUT/hero-jardin-poster.jpg"

# ---- Gallery tiles ----------------------------------------------------------
# Vertical 480x848. The sources are 848x480 with 90 deg rotation metadata, which ffmpeg
# applies before the filter chain: scale=480:-2 is therefore the *displayed* width.
# The night video is deliberately left out: guests' faces are recognisable in it.
tile() { # tile <file> <start> <duration> <name> <poster offset inside the clip>
  clip "$VID/$1" "$2" "$3" 480 28 "$OUT/galeria/$4.mp4"
  frame "$OUT/galeria/$4.mp4" "$5" 480 "$OUT/galeria/$4.jpg"
}
tile "WhatsApp Video 2026-09-14 at 09.50.46.mp4" 10  8   jardin  2
tile "WhatsApp Video 2026-09-14 at 09.50.46.mp4" 32  8   quincho 0.5
tile "WhatsApp Video 2026-09-14 at 09.51.05.mp4"  0  8   patio   0.5
tile "WhatsApp Video 2026-09-14 at 09.51.14.mp4"  0  2.5 pergola 0.5
tile "WhatsApp Video 2026-09-14 at 09.51.26.mp4"  0  3.9 pileta  0.5
tile "WhatsApp Video 2026-09-14 at 09.51.37.mp4"  0  2.2 fachada 0.5

# ---- Stills -----------------------------------------------------------------
# 1080x1920 frames out of the walkthrough. Handheld, so only the steady, well-framed
# moments survived a look at the output; the rest were dropped rather than shipped.
frame "$HERO"  2.0 1080 "$OUT/fotos/jardin.jpg"
frame "$HERO" 10.5 1080 "$OUT/fotos/quincho.jpg"
frame "$HERO" 12.0 1080 "$OUT/fotos/pileta.jpg"
frame "$HERO" 19.5 1080 "$OUT/fotos/salon-interior.jpg"
frame "$HERO" 25.5 1080 "$OUT/fotos/salon-ventanal.jpg"

# The two professional photos of the SUM, cropped out of an Instagram carousel screenshot.
# Better framed than any frame of the videos, but a quarter of the resolution: temporary,
# and no layout may depend on their crop (06-UI-UX §7, CR-01).
CARRUSEL="$SRC/Screenshot 2026-09-15 075500.png"
ffmpeg -y -v error -i "$CARRUSEL" -vf "crop=452:418:0:0"   -map_metadata -1 -q:v 3 "$OUT/fotos/pileta-cascada.jpg"
ffmpeg -y -v error -i "$CARRUSEL" -vf "crop=407:418:455:0" -map_metadata -1 -q:v 3 "$OUT/fotos/salon-vacio.jpg"

# Temporary logo, cropped from the same account. Flat dark-blue background, no transparency:
# CR-03 (the real vector) is still owed by the client.
ffmpeg -y -v error -i "$SRC/Screenshot 2026-09-15 075435.png" -vf "crop=404:404:230:238" \
  -map_metadata -1 "$OUT/logo-araucaria.png"

echo "--- public/media ---"
find "$OUT" -type f -printf "%8s  %P\n" | sort -k2
echo "total: $(du -sb "$OUT" | cut -f1) bytes"
