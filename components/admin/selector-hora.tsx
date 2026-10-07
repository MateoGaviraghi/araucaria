"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type OpcionHora = {
  valor: number;
  texto: string;
  /** "día siguiente", in the list */
  nota?: string;
  /** "+1 día", in the field, which is narrower */
  notaCorta?: string;
  /** Inside a module already taken: shown dimmed, still selectable (the form explains why it fails). */
  apagada?: boolean;
};

// The hour dropdown of "Personalizado" (D-050): the panel's own field and list instead of the browser's
// grey one. A button with the hour opens a listbox in the panel's colours, scrolled to the chosen hour.
// Keyboard: arrows, Home/End, Enter or Space to choose, Escape to close. Styles: `.pn-hora` in
// app/admin/admin.css.
export function SelectorHora({
  id,
  etiquetaId,
  valor,
  opciones,
  invalido,
  alCambiar,
}: {
  id: string;
  etiquetaId: string;
  valor: number | null;
  opciones: readonly OpcionHora[];
  invalido?: boolean;
  alCambiar: (valor: number) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const listaId = useId();
  const elegida = opciones.find((o) => o.valor === valor);

  function abrir() {
    const i = opciones.findIndex((o) => o.valor === valor);
    setActiva(i >= 0 ? i : 0);
    setAbierto(true);
  }

  function cerrar(volverAlBoton = true) {
    setAbierto(false);
    if (volverAlBoton) boton.current?.focus();
  }

  function elegir(i: number) {
    const opcion = opciones[i];
    if (!opcion) return;
    alCambiar(opcion.valor);
    cerrar();
  }

  // Open: focus the list and bring the active hour to the middle of it.
  useEffect(() => {
    if (!abierto) return;
    const ul = lista.current;
    ul?.focus({ preventScroll: true });
    const li = ul?.children[activa] as HTMLElement | undefined;
    if (ul && li) ul.scrollTop = li.offsetTop - ul.clientHeight / 2 + li.clientHeight / 2;
    // Only on opening; moving with the keyboard scrolls on its own below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // A tap or click outside closes it.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (event: PointerEvent) => {
      if (!raiz.current?.contains(event.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  function mover(i: number) {
    const siguiente = Math.max(0, Math.min(opciones.length - 1, i));
    setActiva(siguiente);
    (lista.current?.children[siguiente] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }

  function teclas(event: KeyboardEvent<HTMLUListElement>) {
    const salto: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 6, PageUp: -6 };
    if (event.key in salto) mover(activa + salto[event.key]!);
    else if (event.key === "Home") mover(0);
    else if (event.key === "End") mover(opciones.length - 1);
    else if (event.key === "Enter" || event.key === " ") elegir(activa);
    else if (event.key === "Escape") cerrar();
    else if (event.key === "Tab") setAbierto(false);
    else return;
    if (event.key !== "Tab") event.preventDefault();
  }

  return (
    <div ref={raiz} className="pn-hora" data-abierto={abierto ? "" : undefined}>
      <button
        ref={boton}
        id={id}
        type="button"
        className="pn-input pn-hora-campo"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? listaId : undefined}
        aria-labelledby={`${etiquetaId} ${id}`}
        data-invalido={invalido ? "" : undefined}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            abrir();
          }
        }}
      >
        <span className={elegida ? undefined : "pn-hora-vacia"}>{elegida ? elegida.texto : "Hora"}</span>
        {elegida?.notaCorta && <span className="pn-hora-nota">{elegida.notaCorta}</span>}
        <svg className="pn-hora-flecha" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {abierto && (
        <ul
          ref={lista}
          id={listaId}
          className="pn-hora-lista"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={etiquetaId}
          aria-activedescendant={`${listaId}-${activa}`}
          onKeyDown={teclas}
        >
          {opciones.map((o, i) => (
            <li
              key={o.valor}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={o.valor === valor}
              data-activa={i === activa ? "" : undefined}
              data-apagada={o.apagada ? "" : undefined}
              onPointerEnter={() => setActiva(i)}
              onClick={() => elegir(i)}
            >
              <span>{o.texto}</span>
              {o.nota && <span className="pn-hora-nota">{o.nota}</span>}
              {o.apagada && <span className="pn-hora-nota">ocupado</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
