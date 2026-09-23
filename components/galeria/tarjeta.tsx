"use client";

import { useState, type CSSProperties } from "react";
import type { Espacio } from "./contenido";
import { Historia } from "./historia";

// Un espacio del salón: número, nombre y una línea de docs/01-CONTEXT.md, y sus tomas a tamaño
// completo, una a la vez (historia.tsx). En el celular es una tarjeta de la pila; en el escritorio,
// una columna de la fila (D-030). El movimiento vive en galeria.tsx.
//
// SIN ESPACIO MUERTO. La versión anterior ponía tomas del mismo tamaño en las cuatro tarjetas, así
// que La parrilla —una sola toma— usaba el 13 % de su tarjeta. Mateo, 2026-09-23: "hay muchos
// espacios libres tanto en mobile como desktop". En el celular la toma ocupa todo el ancho y el resto
// de la tarjeta es la misma toma desenfocada debajo del color del espacio: la luz del lugar, no un
// fondo vacío. En el escritorio no hay tarjeta: la toma es la columna, con el nombre encima.
//
// El número, el nombre y la línea van dentro de una máscara (.gal-mascara) para abrirse desde abajo
// cuando la tarjeta llega arriba: se abren, no aparecen (criterio de Mateo).

type Props = {
  espacio: Espacio;
  indice: number;
  total: number;
  /** "pila" en el celular (tarjetas apiladas), "fila" en el escritorio (los cuatro lado a lado,
   * D-030). La hoja acomoda el mismo marcado; acá cambia solo qué hace el mouse. */
  modo: "pila" | "fila";
  /** Pila: es la tarjeta de arriba. Fila: le toca el turno. En los dos, sin visor abierto. */
  activa: boolean;
  onAbrir: (pieza: number) => void;
  /** Fila: terminó una toma, se pasa el turno. */
  onFinToma: () => void;
  /** Fila: el mouse entró (true) o salió (false). */
  onEncima: (dentro: boolean) => void;
};

const dosCifras = (n: number) => String(n).padStart(2, "0");

export function Tarjeta({
  espacio,
  indice,
  total,
  modo,
  activa,
  onAbrir,
  onFinToma,
  onEncima,
}: Props) {
  const titulo = `gal-tarjeta-${espacio.id}`;

  // Qué toma se ve, cuál se está yendo y hacia dónde: los tres cambian juntos, en el mismo toque.
  const [vista, setVista] = useState<{ actual: number; anterior: number | null; sentido: 1 | -1 }>({
    actual: 0,
    anterior: null,
    sentido: 1,
  });
  const ir = (destino: number, sentido: 1 | -1) =>
    setVista((v) => (destino === v.actual ? v : { actual: destino, anterior: v.actual, sentido }));
  const finCortina = () => setVista((v) => (v.anterior === null ? v : { ...v, anterior: null }));

  // En la pila, el mouse encima frena para mirar tranquilo. En la fila hace lo contrario: el espacio
  // que tiene el mouse encima toma el turno y se mueve. (En el celular no hay "encima".)
  const [encima, setEncima] = useState(false);
  const fila = modo === "fila";
  const alEntrar = (dentro: boolean) => (fila ? onEncima(dentro) : setEncima(dentro));

  return (
    <article
      className="gal-tarjeta"
      data-tono={indice % 4}
      style={{ "--i": indice } as CSSProperties}
      aria-labelledby={titulo}
      onPointerEnter={(e) => e.pointerType === "mouse" && alEntrar(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && alEntrar(false)}
    >
      {/* El fondo: todas las tomas del espacio desenfocadas, se ve la de turno. Decorativo. */}
      <div className="gal-tarjeta-fondo" aria-hidden="true">
        {espacio.piezas.map((pieza, j) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={pieza.id}
            src={pieza.poster}
            alt=""
            loading="lazy"
            decoding="async"
            data-actual={j === vista.actual ? "" : undefined}
          />
        ))}
        <span className="gal-tarjeta-tinte" />
      </div>

      <header className="gal-tarjeta-cabeza">
        <span className="gal-mascara gal-tarjeta-num">
          <span className="gal-linea">
            {dosCifras(indice + 1)} — {dosCifras(total)}
          </span>
        </span>
        <h3 id={titulo} className="gal-mascara gal-tarjeta-nombre">
          <span className="gal-linea">{espacio.nombre}</span>
        </h3>
        <p className="gal-mascara gal-tarjeta-detalle">
          <span className="gal-linea">{espacio.detalle}</span>
        </p>
      </header>

      <div className="gal-tarjeta-escena">
        <Historia
          piezas={espacio.piezas}
          nombre={espacio.nombre}
          actual={vista.actual}
          anterior={vista.anterior}
          sentido={vista.sentido}
          corre={fila ? activa : activa && !encima}
          repetir={!fila}
          onFinToma={fila ? onFinToma : undefined}
          onIr={ir}
          onFinCortina={finCortina}
          onAbrir={onAbrir}
        />
      </div>

      {/* El velo oscurece la tarjeta cuando la tapa la siguiente. Va arriba de todo y no recibe
          clics: una tarjeta tapada no se toca, se ve por el canto. */}
      <span className="gal-tarjeta-velo" aria-hidden="true" />
    </article>
  );
}
