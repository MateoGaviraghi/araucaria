"use client";

import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef } from "react";
import type { Pieza } from "@/components/galeria/contenido";
import "./visor.css";

// El "tocar para verla grande". Un <dialog> nativo: showModal() ya atrapa el foco, ya cierra con
// Escape y ya apaga el resto de la página para el lector de pantalla. Escribir eso a mano siempre
// sale peor.
//
// Lo usa la galería, y después cualquier otra sección que necesite agrandar una imagen.

type Props = {
  piezas: Pieza[];
  /** Índice de la pieza abierta, o null con el visor cerrado. */
  abierta: number | null;
  onCerrar: () => void;
  onIr: (indice: number) => void;
};

export function Visor({ piezas, abierta, onCerrar, onIr }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const pieza = abierta === null ? undefined : piezas[abierta];

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierta !== null && !el.open) el.showModal();
    if (abierta === null && el.open) el.close();
  }, [abierta]);

  // Con el scroll suave de la landing, la rueda sobre el visor movería la página de atrás: Lenis
  // escucha la rueda en toda la ventana. Se frena mientras está abierto. Sin Lenis (el panel, o
  // movimiento reducido) useLenis no devuelve nada y esto no hace nada.
  const lenis = useLenis();
  const abierto = abierta !== null;
  useEffect(() => {
    if (!lenis) return;
    if (abierto) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [abierto, lenis]);

  const mover = useCallback(
    (paso: number) => {
      if (abierta === null || piezas.length === 0) return;
      onIr((abierta + paso + piezas.length) % piezas.length);
    },
    [abierta, onIr, piezas.length],
  );

  // Las flechas cambian de pieza. Escape lo maneja el propio <dialog>.
  useEffect(() => {
    if (abierta === null) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mover(1);
      else if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierta, mover]);

  return (
    <dialog
      ref={dialogo}
      className="visor"
      data-lenis-prevent=""
      aria-label={pieza ? `${pieza.espacio}, en grande` : undefined}
      onClose={onCerrar}
      // Cualquier clic que no caiga en la pieza ni en un mando es "afuera", y cierra. Comparar
      // contra el propio <dialog> no alcanza: la caja lo cubre entero, así que el clic en el fondo
      // nunca llegaba al diálogo (medido el 2026-09-22: abría pero no cerraba).
      onClick={(e) => {
        const donde = e.target as HTMLElement;
        if (!donde.closest(".visor-pieza, .visor-cerrar, .visor-paso")) onCerrar();
      }}
    >
      {pieza && (
        <div className="visor-caja">
          <figure className="visor-pieza">
            {pieza.video ? (
              <video
                key={pieza.id}
                className="visor-media"
                poster={pieza.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={pieza.alt}
              >
                <source src={pieza.video} type="video/mp4" />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={pieza.id} className="visor-media" src={pieza.poster} alt={pieza.alt} />
            )}
            <figcaption className="visor-pie">
              <span>{pieza.espacio}</span>
              <small>
                {(abierta ?? 0) + 1} / {piezas.length}
              </small>
            </figcaption>
          </figure>

          <button type="button" className="visor-cerrar" aria-label="Cerrar" onClick={onCerrar}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
            </svg>
          </button>

          {piezas.length > 1 && (
            <>
              <button
                type="button"
                className="visor-paso visor-paso-antes"
                aria-label="Anterior"
                onClick={() => mover(-1)}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 2L4 8l6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="visor-paso visor-paso-despues"
                aria-label="Siguiente"
                onClick={() => mover(1)}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
