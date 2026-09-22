// Contenido real del hero. Sale de docs/01-CONTEXT.md; nada se escribe de memoria.
import type { Toma } from "./media-hero";

export const TITULO = { antes: "Salón de eventos con ", destacado: "patio, pileta y parrilla" };

export const BAJADA =
  "Cumpleaños, eventos infantiles, reuniones, talleres y celebraciones. Hasta 35 personas, en Güemes 3660, Santa Fe.";

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
