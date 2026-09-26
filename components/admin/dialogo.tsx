"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconoCerrar } from "./iconos";

// A centered modal on a native <dialog> (D-046): showModal() keeps focus inside and makes the page
// behind inert, Escape closes it, and focus returns to what opened it. Styles: `.pn-dialogo` in
// app/admin/admin.css (a 220 ms entrance, none with reduced motion).
export function Dialogo({
  abierto,
  titulo,
  subtitulo,
  alCerrar,
  children,
  alerta = false,
}: {
  abierto: boolean;
  titulo: string;
  subtitulo?: string;
  alCerrar: () => void;
  children: ReactNode;
  /** A question that needs an answer (role alertdialog), not a form. */
  alerta?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const subtituloId = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className="pn-dialogo"
      role={alerta ? "alertdialog" : undefined}
      aria-labelledby={tituloId}
      aria-describedby={subtitulo ? subtituloId : undefined}
      onClose={alCerrar}
      onClick={(event) => {
        if (event.target === event.currentTarget) alCerrar();
      }}
    >
      <div className="pn-dialogo-caja">
        <div className="pn-dialogo-cabeza">
          <div>
            <h2 id={tituloId} className="pn-dialogo-titulo">
              {titulo}
            </h2>
            {subtitulo && (
              <p id={subtituloId} className="pn-dialogo-sub">
                {subtitulo}
              </p>
            )}
          </div>
          <button type="button" className="pn-icono-boton" aria-label="Cerrar" onClick={alCerrar}>
            <IconoCerrar />
          </button>
        </div>
        {abierto && children}
      </div>
    </dialog>
  );
}
