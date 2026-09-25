"use client";

import { useLenis } from "lenis/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildMonth, type AvailabilityEntry, type BlockChoice, type DayCell } from "@/components/calendar/month";
import { addMonthsToMonth, monthOf, type IsoDate, type IsoMonth } from "@/lib/dates";
import { Formulario } from "@/components/formulario/formulario";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABRE, CURVA, ESCONDIDO, Mascara, quieto } from "./comun";
import { Detalle } from "./detalle";
import { Foto } from "./foto";
import { Grilla } from "./grilla";
import "@/components/ui/boton.css";
import "./calendario.css";

// CALENDARIO público (docs/06-UI-UX.md §3, D-033). Dos mitades: a un lado la foto del lugar con el
// mes en grande, al otro el mes. Al elegir un día, una cortina tapa la foto con ese día y sus
// módulos ("La foto se cambia"). Lo reservado se cuenta con luces y sellos (grilla.tsx).
//
// LA ENTRADA pasa cuando la sección llega al 70 % de la pantalla, no al cargar la página: hasta ahí
// los números, las luces y los sellos esperan escondidos (el guion de app/page.tsx los esconde
// antes del primer pintado, y después GSAP). Nada se mueve solo.
//
// `entradas` null: la base no respondió. Todos los días quedan elegibles y se avisa (D-021).

const CORTINA = 1.1; // s, power3.inOut: la misma cortina de las historias de la galería

export type Datos = { today: IsoDate; lastBookable: IsoDate; entradas: readonly AvailabilityEntry[] | null };

/** Lo que el calendario le pasa al formulario al tocar "Seguir con mis datos". */
export type Seleccion = { fecha: IsoDate; modulo: BlockChoice };

function useEstado({ today, lastBookable, entradas }: Datos) {
  const primero = monthOf(today);
  const ultimo = monthOf(lastBookable);
  const [mes, setMes] = useState<IsoMonth>(primero);
  const [sentido, setSentido] = useState(1);
  const [dia, setDia] = useState<DayCell | null>(null);
  const [modulo, setModulo] = useState<BlockChoice | null>(null);
  const semanas = useMemo(() => buildMonth(mes, entradas ?? [], today, lastBookable), [mes, entradas, today, lastBookable]);

  function mover(n: 1 | -1) {
    const nuevo = addMonthsToMonth(mes, n);
    if (nuevo < primero || nuevo > ultimo) return;
    setSentido(n);
    setMes(nuevo);
  }

  function elegir(celda: DayCell) {
    setDia(celda);
    setModulo(null);
  }

  return {
    today,
    cargada: entradas !== null,
    mes,
    sentido,
    semanas,
    dia,
    modulo,
    setModulo,
    elegir,
    mover,
    hayAntes: mes > primero,
    hayDespues: mes < ultimo,
  };
}

export type Estado = ReturnType<typeof useEstado>;

export function Calendario(datos: Datos) {
  const cal = useEstado(datos);
  const [siguiendo, setSiguiendo] = useState<Seleccion | null>(null);
  // Si después eligen otro día, lo que seguía queda atrás.
  const sigue = siguiendo && siguiendo.fecha === cal.dia?.date ? siguiendo : null;

  // "Seguir con mis datos": el formulario sigue adentro del panel, sobre el día elegido (D-034).
  function seguir() {
    if (!cal.dia || !cal.modulo) return;
    setSiguiendo({ fecha: cal.dia.date, modulo: cal.modulo });
  }
  const raiz = useRef<HTMLElement>(null);
  const [llego, setLlego] = useState(false);
  const abierto = cal.dia !== null;
  const lenis = useLenis();

  // En el celular el panel va DEBAJO de la grilla: al elegir un día, y otra vez al seguir con los
  // datos, la pantalla baja sola hasta el panel (Mateo, 2026-09-24: "cuando elegís un día deslice
  // hacia abajo, no tenga que scrollear yo"). Lo dispara el toque de la persona; en escritorio el panel
  // está al lado y no se mueve nada (D-035).
  const dia = cal.dia?.date ?? null;
  const siguiendoAhora = sigue !== null;
  const alPanel = useCallback(() => {
    const panel = raiz.current?.querySelector<HTMLElement>(".cal-panel");
    const grilla = raiz.current?.querySelector<HTMLElement>(".cal-grilla");
    if (!panel || !grilla) return;
    if (panel.getBoundingClientRect().top < grilla.getBoundingClientRect().bottom - 1) return;
    const destino = panel.getBoundingClientRect().top + window.scrollY - 16;
    if (Math.abs(destino - window.scrollY) < 2) return;
    const duracion = quieto() ? 1.1 : 0;
    // Con el dedo el scroll es el nativo (Lenis no simula el toque, `syncTouch: false`) y Lenis ignora
    // scrollTo mientras hay un toque: se usa el del navegador.
    const conDedo = !window.matchMedia("(hover: hover)").matches;
    if (lenis && !conDedo) lenis.scrollTo(destino, { duration: duracion, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: destino, behavior: duracion ? "smooth" : "auto" });
  }, [lenis]);

  useEffect(() => {
    if (dia) alPanel();
  }, [dia, siguiendoAhora, alPanel]);

  // Mientras se completa el formulario en el celular, el teclado del iPhone corre la página para mostrar
  // el campo, y al cerrarse la deja corrida (Mateo: "mientras fui rellenando el form no queda fijo, se
  // hace como scroll para abajo"). Cuando el teclado se cierra (el alto visible vuelve a crecer), el
  // panel vuelve a su lugar, a 16 px del borde de arriba (D-039). Al cambiar de paso también (abajo,
  // `alCambiarPaso`).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!siguiendoAhora || !vv) return;
    let alto = vv.height;
    let espera = 0;
    const cambio = () => {
      const crecio = vv.height - alto > 120;
      alto = vv.height;
      if (!crecio) return;
      window.clearTimeout(espera);
      espera = window.setTimeout(alPanel, 120);
    };
    vv.addEventListener("resize", cambio);
    return () => {
      vv.removeEventListener("resize", cambio);
      window.clearTimeout(espera);
    };
  }, [siguiendoAhora, alPanel]);

  useGSAP(
    () => {
      const titulo = ".cal-encabezado .cal-linea";
      if (!quieto()) {
        gsap.set(titulo, { y: 0, yPercent: 0 });
        setLlego(true);
        return;
      }
      gsap.set(titulo, { y: 0, yPercent: ESCONDIDO });
      ScrollTrigger.create({
        trigger: raiz.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          gsap.to(titulo, { y: 0, yPercent: 0, duration: ABRE, ease: CURVA, stagger: 0.1 });
          setLlego(true);
        },
      });
    },
    { scope: raiz },
  );

  useGSAP(
    () => {
      if (!abierto) return;
      // x: 0 explícito: GSAP lee el translateX(-101%) de la hoja como x en px y lo dejaría puesto.
      gsap.fromTo(
        ".cal-telon",
        { x: 0, xPercent: -101 },
        { x: 0, xPercent: 0, duration: quieto() ? CORTINA : 0, ease: "power3.inOut" },
      );
    },
    { scope: raiz, dependencies: [abierto] },
  );

  return (
    <section ref={raiz} id="disponibilidad" className="cal" aria-labelledby="cal-titulo">
      <header className="cal-encabezado">
        <h2 id="cal-titulo" className="cal-titulo">
          <Mascara>Disponibilidad</Mascara>
        </h2>
        <p className="cal-bajada">
          <Mascara>Elegí el día y el módulo para tu evento.</Mascara>
        </p>
      </header>

      {cal.cargada ? null : (
        <p className="cal-aviso" role="status">
          No pudimos cargar la disponibilidad. Elegí la fecha igual y te confirmamos por WhatsApp.
        </p>
      )}

      <div className="cal-cuerpo">
        <div className="cal-panel">
          <Foto mes={cal.mes} llego={llego} className="cal-panel-foto" />
          <div className="cal-telon">
            <Detalle cal={cal} onSeguir={seguir} />
            {sigue ? (
              <div className="cal-continua">
                <Formulario sel={sigue} volver={() => setSiguiendo(null)} alCambiarPaso={alPanel} />
              </div>
            ) : null}
          </div>
        </div>
        <Grilla cal={cal} llego={llego} />
      </div>
    </section>
  );
}
