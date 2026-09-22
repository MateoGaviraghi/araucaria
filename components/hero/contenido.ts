// Contenido real del hero. Sale de docs/01-CONTEXT.md; nada se escribe de memoria.
import type { Toma } from "./media-hero";

// Primero el evento, después el lugar (Mateo, 2026-09-22: el titular estaba invertido; la idea
// es atraer todo tipo de evento y recién después contar los espacios).
export const TITULO = {
  antes: "Espacio versátil para cumpleaños, eventos infantiles, talleres y ",
  destacado: "celebraciones de todo tipo",
};

// Los espacios, tal como están en docs/01-CONTEXT.md §Amenities.
export const BAJADA =
  "Salón de usos múltiples con patio, pileta, parrilla y horno pizzero. Hasta 35 personas, en Güemes 3660, Santa Fe.";

export const CTA = "Consultar disponibilidad";

// docs/01-CONTEXT.md §Modules and prices. Los precios viven en PRICING-TABLE, no acá.
export const MODULOS = [
  { nombre: "Mediodía", horario: "10:00 a 17:00" },
  { nombre: "Noche", horario: "19:00 a 02:00" },
  { nombre: "Día completo", horario: "10:00 a 02:00" },
];

// Las dos tomas del hero: plano general las dos, 720 de ancho las dos (ver build-media.sh).
// `foco` es dónde se recorta cada una cuando la pantalla es horizontal: medido cuadro a cuadro.
export const RECORRIDO: Toma[] = [
  {
    src: "/media/hero-pileta.mp4",
    poster: "/media/hero-pileta-poster.jpg",
    alt: "La pileta con el muro de ladrillo, el deck y el jardín alrededor",
    foco: "45%",
  },
  {
    src: "/media/hero-jardin.mp4",
    poster: "/media/hero-jardin-poster.jpg",
    alt: "El jardín con la galería, la pérgola y el quincho al fondo",
    foco: "45%",
  },
];
