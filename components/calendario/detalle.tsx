"use client";

import { useRef } from "react";
import { MODULE_WORDS, enabledChoices, type BlockChoice } from "@/components/calendar/month";
import { MODULOS } from "@/content/modulos";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Estado } from "./calendario";
import { ABRE, CURVA, ENTRE_LINEAS, ESCONDIDO, Mascara, partesDelDia, quieto } from "./comun";

// El día elegido: la fecha en grande y los tres módulos con horario y precio (content/modulos.ts,
// de docs/01-CONTEXT.md). Lo que no se puede pedir queda tachado y dice por qué. Cada vez que se
// elige otro día, las líneas se abren desde su máscara, una detrás de otra.
//
// "Seguir con mis datos" lleva al formulario (bloque 6), que todavía no existe: hasta entonces el
// botón no hace nada, y por eso el calendario no sale a producción sin el formulario (Mateo, 2026-09-23).

function noDisponible(codigo: BlockChoice) {
  if (codigo === "dia-completo") return "No disponible";
  const palabra = MODULE_WORDS[codigo].crossed;
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

export function Detalle({ cal }: { cal: Estado }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cal.dia || !quieto()) return;
      gsap.fromTo(".cal-linea", { yPercent: ESCONDIDO }, { yPercent: 0, duration: ABRE, ease: CURVA, stagger: ENTRE_LINEAS });
    },
    { scope: raiz, dependencies: [cal.dia?.date] },
  );

  if (!cal.dia) return <div ref={raiz} className="cal-det" />;

  const { semana, numero, resto } = partesDelDia(cal.dia.date);
  const libres = enabledChoices(cal.dia, cal.cargada);

  return (
    <div ref={raiz} className="cal-det" aria-live="polite">
      <p className="cal-det-fecha">
        <Mascara className="cal-det-semana">{semana}</Mascara>
        <Mascara className="cal-det-numero">{numero}</Mascara>
        <Mascara className="cal-det-resto">de {resto}</Mascara>
      </p>

      <ul className="cal-modulos">
        {MODULOS.map((m) => {
          const libre = libres.includes(m.codigo);
          return (
            <li key={m.codigo} className="cal-mascara">
              <button
                type="button"
                className="cal-modulo cal-linea"
                disabled={!libre}
                aria-pressed={libre ? cal.modulo === m.codigo : undefined}
                onClick={() => cal.setModulo(m.codigo)}
              >
                <span className="cal-modulo-nombre">{m.nombre}</span>
                <span className="cal-modulo-horario">{m.horario}</span>
                <span className="cal-modulo-precio">{libre ? m.precio : noDisponible(m.codigo)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="cal-mascara cal-seguir">
        <span className="cal-linea">
          <button type="button" className="boton boton-en-oscuro" disabled={!cal.modulo}>
            Seguir con mis datos
          </button>
        </span>
      </div>
    </div>
  );
}
