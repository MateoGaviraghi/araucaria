// Contenido de la galería (bloque 3, docs/06-UI-UX.md §2). Los espacios salen de
// docs/01-CONTEXT.md §Amenities; el nombre de cada pieza describe LO QUE SE VE en ella, mirada
// cuadro por cuadro el 2026-09-22, no el nombre del archivo.
//
// Nueve piezas (Mateo, 2026-09-22: "9"): las 6 tomas cortas de public/media/galeria más 3 fotos.
// De las fotos entran solo las de 1080x1920; las dos recortadas del carrusel de Instagram
// (pileta-cascada, salon-vacio) son casi cuadradas y de un cuarto de resolución, así que quedan
// afuera hasta que llegue CR-01.
//
// CUATRO espacios, no siete (Mateo, 2026-09-22: "el jardin y el patio es lo mimso y tambien la
// parte de la pergola es dentro del patio, dejalo en salon, patio, parrilla, y pileta"). La
// galería con media sombra, la pérgola y el césped son todos el patio; el recorrido va de adentro
// hacia afuera y termina en la pileta.
//
// "La fachada" NO está: el archivo que se llama así es una panorámica que arranca en la pileta y
// termina en el jardín — nunca se ve el frente de la casa. Poner ese nombre sería una afirmación
// falsa en la página de un cliente.
/** Una toma corta o una foto del lugar. TODAS con la forma 9:16 del material (480x848 los videos,
 * 1080x1920 las fotos): ninguna se recorta al mostrarla (D-027). */
export type Pieza = {
  id: string;
  /** El nombre del espacio, tal como va en el visor. */
  espacio: string;
  alt: string;
  poster: string;
  /** Sin `video` la pieza es una foto. */
  video?: string;
  /** object-position vertical, cuando el marco recorta más de lo que la toma aguanta. */
  foco?: string;
};

export const TITULO = "Conocé el espacio";

// Los espacios, todos de docs/01-CONTEXT.md §Amenities. El horno pizzero se nombra acá porque el
// capítulo se llama solo "La parrilla" y es de las cosas que más venden el lugar.
export const BAJADA =
  "Un recorrido por el salón, el patio, la parrilla con horno pizzero y la pileta.";

/** Una tarjeta de la pila: el nombre del espacio, su línea y las piezas que lo muestran. */
export type Espacio = {
  id: string;
  nombre: string;
  /** Una fila de docs/01-CONTEXT.md §Amenities, tal cual (Mateo, 2026-09-23: "vaya"). */
  detalle: string;
  piezas: Pieza[];
};

export const ESPACIOS: Espacio[] = [
  {
    id: "salon",
    nombre: "El salón",
    detalle: "Salón de usos múltiples, hasta 35 personas",
    piezas: [
      {
        id: "salon-interior",
        espacio: "El salón",
        alt: "El salón por dentro, con el piso claro, la puerta de madera y las sillas contra la pared",
        poster: "/media/fotos/salon-interior.jpg",
      },
      {
        id: "salon-ventanal",
        espacio: "El salón",
        alt: "El ventanal del salón, con los sillones mirando al patio",
        poster: "/media/fotos/salon-ventanal.jpg",
      },
    ],
  },
  {
    id: "patio",
    nombre: "El patio",
    detalle: "Sillones y livings de exterior",
    piezas: [
      {
        id: "patio",
        espacio: "El patio",
        alt: "El patio techado, con el pino y el muro cubierto de hiedra",
        poster: "/media/galeria/patio.jpg",
        video: "/media/galeria/patio.mp4",
      },
      {
        id: "galeria",
        espacio: "El patio",
        alt: "La galería con media sombra, a lo largo del ventanal del salón",
        poster: "/media/galeria/jardin.jpg",
        video: "/media/galeria/jardin.mp4",
      },
      {
        id: "pergola",
        espacio: "El patio",
        alt: "La pérgola de madera sobre el solado, al borde del césped",
        poster: "/media/galeria/pergola.jpg",
        video: "/media/galeria/pergola.mp4",
      },
      {
        id: "cesped",
        espacio: "El patio",
        alt: "El césped en un día despejado, con la pérgola al fondo",
        poster: "/media/fotos/jardin.jpg",
      },
    ],
  },
  {
    id: "parrilla",
    nombre: "La parrilla",
    detalle: "Asador y horno pizzero grande",
    piezas: [
      {
        id: "quincho",
        espacio: "La parrilla",
        alt: "La parrilla de ladrillo y el horno pizzero, con la mesada de acero adelante",
        poster: "/media/galeria/quincho.jpg",
        video: "/media/galeria/quincho.mp4",
      },
    ],
  },
  {
    id: "pileta",
    nombre: "La pileta",
    detalle: "Patio exterior con pileta",
    piezas: [
      {
        id: "pileta-patio",
        espacio: "La pileta",
        alt: "La pileta y el solado de piedra, con el salón y el césped al fondo",
        poster: "/media/galeria/fachada.jpg",
        video: "/media/galeria/fachada.mp4",
        foco: "58%",
      },
      {
        id: "pileta",
        espacio: "La pileta",
        alt: "La pileta con el muro decorado, el césped alrededor y la cascada de piedra",
        poster: "/media/galeria/pileta.jpg",
        video: "/media/galeria/pileta.mp4",
        foco: "56%",
      },
    ],
  },
];

/** Las nueve piezas seguidas, en el orden del recorrido: lo que usa el visor, que pasa de una a
 * otra sin saber de tarjetas. */
export const PIEZAS: Pieza[] = ESPACIOS.flatMap((e) => e.piezas);
