"use client";

import { useRef } from "react";
import { isSelectableDay, publicDayState, type DayCell, type PublicDayState } from "@/components/calendar/month";
import { formatLongDate } from "@/lib/dates";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Estado } from "./calendario";
import { ABRE, CURVA, ESCONDIDO, Mascara, partesDelMes, quieto } from "./comun";

// El mes, "Sello con luces" (D-033). Mateo: "la de sello con los colores de luces, ya que se
// llega a identificar bien cuáles son los disponibles aún".
//   Libre            — el día encendido, luz cálida.
//   Queda un módulo  — a media luz, con "solo noche" o "solo mediodía".
//   Reservado        — apagado, y encima el sello RESERVADO.
// Al llegar la sección (y al cambiar de mes): los números suben desde su máscara, los días se
// encienden uno detrás de otro y después caen los sellos, con un golpe corto.

const ENTRE_DIAS = 0.012; // s entre números
const LUZ: Partial<Record<PublicDayState, number>> = { free: 1, unknown: 1, partial: 0.5 };
const ENCIENDE = 0.7; // s de cada día
const ENTRE_LUCES = 0.028;
const DESDE_LUCES = 0.3;
const CAE = 0.42; // s del golpe de cada sello
const ENTRE_SELLOS = 0.07;
const DESDE_SELLOS = 0.55;

const SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function etiqueta(celda: DayCell, estado: PublicDayState) {
  const fecha = formatLongDate(celda.date);
  switch (estado) {
    case "free":
      return `${fecha}, libre`;
    case "partial":
      return celda.modules.mediodia ? `${fecha}, mediodía reservado, noche libre` : `${fecha}, noche reservada, mediodía libre`;
    case "full":
      return `${fecha}, reservado`;
    case "past":
      return `${fecha}, ya pasó`;
    case "beyond-horizon":
      return `${fecha}, todavía no se puede reservar`;
    default:
      return fecha;
  }
}

/** Qué queda libre en un día con un solo módulo tomado. */
function queda(celda: DayCell, estado: PublicDayState) {
  if (estado !== "partial") return null;
  return celda.modules.mediodia ? "noche" : "mediodía";
}

export function Grilla({ cal, llego }: { cal: Estado; llego: boolean }) {
  const raiz = useRef<HTMLDivElement>(null);
  const { nombre, anio } = partesDelMes(cal.mes);

  useGSAP(
    () => {
      const numeros = ".cal-num";
      const cabeza = ".cal-grilla-cabeza .cal-linea";
      const luces = gsap.utils.toArray<HTMLElement>(".cal-luz", raiz.current);
      const sellos = gsap.utils.toArray<HTMLElement>(".cal-sello", raiz.current); // puede no haber ninguno
      const nivel = (_: number, el: HTMLElement) => Number(el.dataset.nivel);

      if (!quieto()) {
        gsap.set([numeros, cabeza], { y: 0, yPercent: 0 });
        gsap.set(luces, { opacity: nivel });
        if (sellos.length) gsap.set(sellos, { opacity: 1, scale: 1, rotation: -10 });
        return;
      }
      if (!llego) {
        gsap.set(numeros, { y: 0, yPercent: ESCONDIDO });
        gsap.set(cabeza, { y: 0, yPercent: ESCONDIDO });
        gsap.set(luces, { opacity: 0 });
        if (sellos.length) gsap.set(sellos, { opacity: 0 });
        return;
      }
      gsap.fromTo(numeros, { y: 0, yPercent: ESCONDIDO * cal.sentido }, { y: 0, yPercent: 0, duration: ABRE, ease: CURVA, stagger: ENTRE_DIAS });
      gsap.fromTo(cabeza, { y: 0, yPercent: ESCONDIDO }, { y: 0, yPercent: 0, duration: ABRE, ease: CURVA });
      gsap.fromTo(luces, { opacity: 0 }, { opacity: nivel, duration: ENCIENDE, ease: "power2.out", stagger: ENTRE_LUCES, delay: DESDE_LUCES });
      if (!sellos.length) return;
      gsap.fromTo(
        sellos,
        { scale: 1.9, opacity: 0, rotation: -10 },
        { scale: 1, opacity: 1, rotation: -10, duration: CAE, ease: "power4.in", stagger: ENTRE_SELLOS, delay: DESDE_SELLOS },
      );
    },
    { scope: raiz, dependencies: [cal.mes, llego] },
  );

  return (
    <div ref={raiz} className="cal-grilla">
      <div className="cal-grilla-cabeza">
        <p className="cal-grilla-titulo" aria-live="polite">
          <Mascara>
            {nombre} <span className="cal-grilla-anio">{anio}</span>
          </Mascara>
        </p>
        <div className="cal-flechas">
          <button type="button" className="cal-flecha" onClick={() => cal.mover(-1)} disabled={!cal.hayAntes} aria-label="Mes anterior">
            ←
          </button>
          <button type="button" className="cal-flecha" onClick={() => cal.mover(1)} disabled={!cal.hayDespues} aria-label="Mes siguiente">
            →
          </button>
        </div>
      </div>

      <div className="cal-semana" aria-hidden="true">
        {SEMANA.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <ol className="cal-dias">
        {cal.semanas.flat().map((celda) => {
          if (celda.status === "outside-month") return <li key={celda.date} aria-hidden="true" />;
          const estado = publicDayState(celda, cal.cargada);
          const puede = isSelectableDay(estado);
          const elegido = cal.dia?.date === celda.date;
          const libre = queda(celda, estado);
          const luz = LUZ[estado] ?? 0;
          return (
            <li key={celda.date}>
              <button
                type="button"
                className="cal-dia"
                data-estado={estado}
                data-hoy={celda.date === cal.today ? "" : undefined}
                data-elegido={elegido ? "" : undefined}
                disabled={!puede}
                aria-pressed={puede ? elegido : undefined}
                aria-label={etiqueta(celda, estado)}
                onClick={() => cal.elegir(celda)}
              >
                <span className="cal-luz" data-nivel={luz} />
                <span className="cal-num-mascara">
                  <span className="cal-num">{celda.day}</span>
                </span>
                {libre ? (
                  <span className="cal-nota">
                    <span>solo</span> <span>{libre}</span>
                  </span>
                ) : null}
                {estado === "full" ? (
                  <span className="cal-sello" aria-hidden="true">
                    Reservado
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      <p className="cal-leyenda">
        <span className="cal-leyenda-luz" data-nivel="1" aria-hidden="true" /> Libre
        <span className="cal-leyenda-luz" data-nivel="0.5" aria-hidden="true" /> Queda un módulo
        <span className="cal-leyenda-sello" aria-hidden="true">
          Reservado
        </span>
      </p>
    </div>
  );
}
