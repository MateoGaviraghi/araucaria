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
# jardin and pergola left on 2026-10-13: the client's 4K clips of the patio replace them (D-054).
tile "WhatsApp Video 2026-09-14 at 09.50.46.mp4" 32  8   quincho 0.5
tile "WhatsApp Video 2026-09-14 at 09.51.05.mp4"  0  8   patio   0.5
tile "WhatsApp Video 2026-09-14 at 09.51.26.mp4"  0  3.9 pileta  0.5
tile "WhatsApp Video 2026-09-14 at 09.51.37.mp4"  0  2.2 fachada 0.5

# ---- Stills -----------------------------------------------------------------
# 1080x1920 frames out of the walkthrough. Handheld, so only the steady, well-framed
# moments survived a look at the output; the rest were dropped rather than shipped.
frame "$HERO"  2.0 1080 "$OUT/fotos/jardin.jpg"
frame "$HERO" 10.5 1080 "$OUT/fotos/quincho.jpg"
frame "$HERO" 12.0 1080 "$OUT/fotos/pileta.jpg"
# salon-interior and salon-ventanal left on 2026-10-13: the client's photos of the salón replace them.

# The two professional photos of the SUM, cropped out of an Instagram carousel screenshot.
# Better framed than any frame of the videos, but a quarter of the resolution: temporary,
# and no layout may depend on their crop (06-UI-UX §7, CR-01).
CARRUSEL="$SRC/Screenshot 2026-09-15 075500.png"
# salon-vacio left on 2026-10-13 (the client's photos of the salón replace it); pileta-cascada stays.
ffmpeg -y -v error -i "$CARRUSEL" -vf "crop=452:418:0:0"   -map_metadata -1 -q:v 3 "$OUT/fotos/pileta-cascada.jpg"

# ---- The client's material of 2026-10-13 (D-054, CR-01/CR-02 in part) ----------
# iPhone, 4K. The clips are stored landscape with rotation metadata, which ffmpeg applies before the
# filters, so `scale=720:-2` is the displayed (vertical) width: 720x1280, like the hero. The photos are
# HEIC 3:4; the gallery shows every piece 9:16 without cropping it (D-027), so they are cut to 9:16
# around the centre here, once. HEIC decodes through a tile graph that rejects -vf, hence the PNG step.
NUE="${NUE:-$SRC/nuevas-fotos}"
[ -d "$NUE" ] || { echo "new material not found: $NUE"; exit 1; }

nuevo() { # nuevo <file> <start> <duration> <name> <poster offset inside the clip>
  clip "$NUE/$1" "$2" "$3" 720 28 "$OUT/galeria/$4.mp4"
  frame "$OUT/galeria/$4.mp4" "$5" 720 "$OUT/galeria/$4.jpg"
}
nuevo IMG_0789.MOV 0 8   salon-recorrido 0.5
nuevo IMG_0793.MOV 0 3.3 salon-ventanales 0.5
nuevo IMG_0792.MOV 0 2.4 salon-aparador  0.5
nuevo IMG_2864.mov 0 8   patio-galeria   0.5
nuevo IMG_2836.mov 0 4.4 patio-pergola   0.5
nuevo IMG_0968.MOV 0 8   patio-cesped    0.5
nuevo IMG_2869.mov 0 7   cocina          0.5

foto() { # foto <file.HEIC> <name>
  local tmp
  tmp="$(mktemp -u).png"
  ffmpeg -y -v error -i "$NUE/$1" -frames:v 1 "$tmp"
  ffmpeg -y -v error -i "$tmp" -map_metadata -1 -q:v 4 \
    -vf "crop=trunc(ih*9/16/2)*2:ih,scale=1080:1920:flags=lanczos" "$OUT/fotos/$2.jpg"
  rm -f "$tmp"
}
foto IMG_0794.HEIC salon-ventanales
foto IMG_0799.HEIC salon-desde-galeria
foto IMG_0800.HEIC salon-fondo
foto IMG_0798.HEIC bano

# Logo for the header (D-055): the SUM's brown emblem, cut out of the client's logo on its light blue
# (assets/marca/logo-sum-emblema.png, 486 px; the waves are holes that show what is behind). The
# multiespacio logo of D-052 stays in assets/marca/ for when the other spaces open.
ffmpeg -y -v error -i "$ROOT/assets/marca/logo-sum-emblema.png" -vf "scale=256:256:flags=lanczos" \
  -map_metadata -1 "$OUT/logo-sum.png"

echo "--- public/media ---"
find "$OUT" -type f -printf "%8s  %P\n" | sort -k2
echo "total: $(du -sb "$OUT" | cut -f1) bytes"
