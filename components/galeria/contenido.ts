// Contenido de la galería (bloque 3, docs/06-UI-UX.md §2). Los espacios salen de
// docs/01-CONTEXT.md §Amenities; el nombre de cada pieza describe LO QUE SE VE en ella, mirada
// cuadro por cuadro el 2026-09-22, no el nombre del archivo.
//
// Doce piezas desde el 2026-10-13 (D-054): el salón y el patio ya son el material 4K que mandó la
// clienta (mirado cuadro por cuadro ese día), y se sumó el baño y la cocina. La parrilla y la pileta
// siguen con las tomas de WhatsApp: no llegó material nuevo de esas partes.
//
// CINCO espacios (Mateo, 2026-09-22: "el jardin y el patio es lo mismo y también la parte de la
// pergola es dentro del patio"; 2026-10-13: el baño y la cocina, "cocina" por lo que se ve). La
// galería con media sombra, la pérgola y el césped son todos el patio; el recorrido va de adentro
// hacia afuera y termina en la pileta.
//
// "La fachada" NO está: el archivo que se llama así es una panorámica que arranca en la pileta y
// termina en el jardín — nunca se ve el frente de la casa. Poner ese nombre sería una afirmación
// falsa en la página de un cliente.
/** Una toma corta o una foto del lugar. TODAS con la forma 9:16 del material (480x848 o 720x1280
 * los videos, 1080x1920 las fotos): ninguna se recorta al mostrarla (D-027). */
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
  "Un recorrido por el salón, el baño y la cocina, el patio, la parrilla con horno pizzero y la pileta.";

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
        id: "salon-recorrido",
        espacio: "El salón",
        alt: "El salón de punta a punta, con el piso claro, las sillas al fondo y el ventanal a un costado",
        poster: "/media/galeria/salon-recorrido.jpg",
        video: "/media/galeria/salon-recorrido.mp4",
      },
      {
        id: "salon-ventanales",
        espacio: "El salón",
        alt: "Los ventanales del salón, que dan al jardín",
        poster: "/media/galeria/salon-ventanales.jpg",
        video: "/media/galeria/salon-ventanales.mp4",
      },
      {
        id: "salon-aparador",
        espacio: "El salón",
        alt: "Un rincón del salón con el aparador blanco, los cuadros y el aire acondicionado",
        poster: "/media/galeria/salon-aparador.jpg",
        video: "/media/galeria/salon-aparador.mp4",
      },
      {
        id: "salon-desde-galeria",
        espacio: "El salón",
        alt: "El salón visto desde la galería, a través del ventanal abierto",
        poster: "/media/fotos/salon-desde-galeria.jpg",
      },
    ],
  },
  {
    id: "bano-cocina",
    nombre: "El baño y la cocina",
    detalle: "Baño y espacio de lavado con pileta",
    piezas: [
      {
        id: "cocina",
        espacio: "El baño y la cocina",
        alt: "La cocina, con la mesada, la pileta, las alacenas de madera y el microondas",
        poster: "/media/galeria/cocina.jpg",
        video: "/media/galeria/cocina.mp4",
      },
      {
        id: "bano",
        espacio: "El baño y la cocina",
        alt: "El baño, con azulejos verdes, el lavatorio y el espejo",
        poster: "/media/fotos/bano.jpg",
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
        id: "patio-galeria",
        espacio: "El patio",
        alt: "La galería con la pérgola de madera y media sombra, a lo largo de los ventanales del salón",
        poster: "/media/galeria/patio-galeria.jpg",
        video: "/media/galeria/patio-galeria.mp4",
      },
      {
        id: "patio-pergola",
        espacio: "El patio",
        alt: "La pérgola de madera entre las plantas, con el solado y los ventanales detrás",
        poster: "/media/galeria/patio-pergola.jpg",
        video: "/media/galeria/patio-pergola.mp4",
      },
      {
        id: "patio-cesped",
        espacio: "El patio",
        alt: "El solado y el césped, con el pino, los sillones de exterior y la pérgola al fondo",
        poster: "/media/galeria/patio-cesped.jpg",
        video: "/media/galeria/patio-cesped.mp4",
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

/** Todas las piezas seguidas, en el orden del recorrido: lo que usa el visor, que pasa de una a
 * otra sin saber de tarjetas. */
export const PIEZAS: Pieza[] = ESPACIOS.flatMap((e) => e.piezas);
