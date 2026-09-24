"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  CALLES,
  ESTACION,
  ETIQUETAS,
  LAGUNA,
  LUGARES,
  MARCO,
  PARQUES,
  PLAYA_FERROVIARIA,
  PRINCIPALES,
  SALON,
  VIAS,
  type Lugar,
} from "./mapa-datos";

// EL MAPA del cierre (bloque 7, MAP-LOCATION): las calles reales de Candioti Norte con su nombre y los
// lugares conocidos del barrio, dibujados con los colores de la marca. Sin mapa de Google embebido
// (docs/02-STACK.md lo prohíbe por el peso) y sin recorrido: cada uno llega desde otro lado (Mateo);
// para eso está "Cómo llegar", que abre Google Maps.
//
// La escala es fija en píxeles por metro: el encuadre se recalcula con el tamaño de la caja, así las
// calles y los nombres se leen igual en el celular y en 1920. Los nombres y los íconos se dibujan en
// píxeles (se escalan con `escala`), no en metros.

/** Píxeles por metro. En escritorio se ve del MAC a la Costanera (Mateo: "que la gente se ubique"). */
const ESCALA = { angosto: 0.62, ancho: 0.5 };

type Props = {
  /** Corre el centro (en metros) para que el salón no quede debajo del texto. Solo en pantallas anchas. */
  corrimiento?: { x: number; y: number };
  className?: string;
};

function useEncuadre(corrimiento: { x: number; y: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const [tam, setTam] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => setTam({ w: el.clientWidth, h: el.clientHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [x0, y0, ancho, alto] = MARCO;
  if (!tam || !tam.w || !tam.h) return { caja, vb: [x0, y0, ancho, alto], escala: 1 };
  const angosto = tam.w < 700;
  // En una caja baja se aleja un poco: alrededor del salón siempre entran ~300 m.
  const s = Math.min(angosto ? ESCALA.angosto : ESCALA.ancho, tam.h / 300);
  const w = tam.w / s;
  const h = tam.h / s;
  const cx = SALON[0] + (angosto ? 0 : corrimiento.x);
  // En el celular el rótulo va arriba del marcador: el centro sube un poco para que entre.
  const cy = SALON[1] + (angosto ? -40 : corrimiento.y);
  return { caja, vb: [cx - w / 2, cy - h / 2, w, h], escala: 1 / s };
}

/** Los íconos de los lugares, dibujados en una caja de 12 × 12 px. */
const ICONO: Record<Lugar["tipo"], string> = {
  tren: "M3.5 1.5h5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM1.5 5.5h9M4 11.5l1-2M8 11.5l-1-2",
  plaza: "M6 1l3.6 5.2H2.4zM6 3.8l4.2 5.7H1.8zM6 9.5v2.5",
  puente: "M.5 8.5h11M1 8.5c2-5.5 8-5.5 10 0M3.5 8.5V5.2M8.5 8.5V5.2M6 8.5V4",
  monumento: "M5 1h2v7H5zM3 8h6v1.8H3zM2 9.8h8v1.7H2z",
  museo: "M6 1l5 3H1zM2.5 5v4.8M5 5v4.8M7 5v4.8M9.5 5v4.8M1 11h10",
  deporte: "M1 8.5c1.5 1.5 3 1.5 5 0s3.5-1.5 5 0M3 6.5l6-5M7.5 3l2 1.5",
  costanera: "M.5 5c1.8-1.6 3.6-1.6 5.5 0s3.7 1.6 5.5 0M.5 8.5c1.8-1.6 3.6-1.6 5.5 0s3.7 1.6 5.5 0",
  agua: "",
  escuela: "M.5 4.5L6 2l5.5 2.5L6 7zM2.8 5.6v3.2c2 1.4 4.4 1.4 6.4 0V5.6",
};

export function Mapa({ corrimiento = { x: 0, y: 0 }, className = "" }: Props) {
  const { caja, vb, escala } = useEncuadre(corrimiento);
  // El rótulo es HTML (se lee mejor que un texto del SVG): va donde cae el marcador.
  const rotulo = {
    left: `${((SALON[0] - vb[0]) / vb[2]) * 100}%`,
    top: `${((SALON[1] - vb[1]) / vb[3]) * 100}%`,
  };

  return (
    <div ref={caja} className={`mp ${className}`}>
      <svg
        className="mp-svg"
        viewBox={vb.join(" ")}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Mapa de Candioti Norte con Araucaria en Güemes 3660, a una cuadra de Bulevar Gálvez y cerca de la Estación Belgrano"
      >
        <g className="mp-terreno">
          <rect className="mp-tierra" x={MARCO[0] - 800} y={MARCO[1] - 800} width={MARCO[2] + 1600} height={MARCO[3] + 1600} />
          <path className="mp-laguna" d={LAGUNA} />
          <path className="mp-ferro" d={PLAYA_FERROVIARIA} />
          {PARQUES.map((d, i) => (
            <path key={i} className="mp-parque" d={d} />
          ))}
          {CALLES.map((d, i) => (
            <path key={i} className="mp-calle" d={d} />
          ))}
          {PRINCIPALES.map((d, i) => (
            <path key={i} className="mp-principal" d={d} />
          ))}
          {VIAS.map((d, i) => (
            <path key={i} className="mp-via" d={d} />
          ))}
          <path className="mp-estacion" d={ESTACION} />

          {ETIQUETAS.map((e, i) => (
            <text
              key={i}
              className={`mp-etq ${e.principal ? "mp-etq-principal" : ""}`}
              transform={`translate(${e.x} ${e.y}) rotate(${e.giro}) scale(${escala})`}
              dy="0.35em"
            >
              {e.texto}
            </text>
          ))}

          {LUGARES.map((l) =>
            l.tipo === "agua" ? (
              <text key={l.texto} className="mp-lugar mp-agua" transform={`translate(${l.x} ${l.y}) scale(${escala})`}>
                {l.texto}
              </text>
            ) : (
              <g key={l.texto} className={`mp-lugar mp-lugar-${l.tipo}`} transform={`translate(${l.x} ${l.y}) scale(${escala})`}>
                <circle className="mp-lugar-fondo" r={10} />
                <path className="mp-lugar-icono" d={ICONO[l.tipo]} transform="translate(-6 -6)" />
                <text className="mp-lugar-nombre" x={15} dy="0.35em">
                  {l.texto}
                </text>
              </g>
            ),
          )}

          <g className="mp-pin" transform={`translate(${SALON[0]} ${SALON[1]}) scale(${escala})`}>
            <circle className="mp-pin-onda" r={8} />
            <g className="mp-pin-cuerpo">
              <path className="mp-pin-gota" d="M0 0c-7-9-14-14.5-14-23a14 14 0 0 1 28 0c0 8.5-7 14-14 23z" />
              <circle className="mp-pin-ojo" cy={-23} r={5.5} />
            </g>
          </g>
        </g>
      </svg>
      {/* GSAP mueve el de afuera (y deja `translate: none`); el de adentro se centra sobre el marcador. */}
      <div className="mp-rotulo" style={rotulo}>
        <p className="mp-rotulo-caja">
          <span className="mp-rotulo-marca">Araucaria</span>
          <span>Güemes 3660</span>
        </p>
      </div>
      <p className="mp-credito">
        © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
      </p>
    </div>
  );
}

// Lo que el mapa esconde antes de su entrada lo aplica el guion de app/page.tsx (GUION_CIERRE).

/**
 * La entrada del mapa: se acerca de a poco al salón (0,92 → 1 en 2,4 s) mientras aparecen los nombres
 * de las calles y los lugares; cae el marcador (0,7 s), sale una sola onda y aparece el rótulo.
 * Devuelve la línea de tiempo para sumarla a la sección.
 */
export function entradaDelMapa(raiz: Element) {
  const q = gsap.utils.selector(raiz);
  const tl = gsap.timeline();
  const nombres = q(".mp-etq, .mp-lugar");
  tl.fromTo(q(".mp-terreno"), { scale: 0.92, svgOrigin: `${SALON[0]} ${SALON[1]}` }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0);
  if (nombres.length)
    tl.fromTo(
      nombres,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: { amount: 0.9, from: "random" },
      },
      0.3,
    );
  tl.fromTo(q(".mp-pin"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.9)
    .fromTo(q(".mp-pin-cuerpo"), { y: -70, scale: 0.6, svgOrigin: "0 0" }, { y: 0, scale: 1, duration: 0.7, ease: "back.out(1.8)" }, 0.9)
    .fromTo(
      q(".mp-pin-onda"),
      { scale: 1, opacity: 0.55, svgOrigin: "0 0" },
      { scale: 5, opacity: 0, duration: 1.3, ease: "power2.out" },
      1.5,
    )
    .fromTo(q(".mp-rotulo"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 1.45);
  return tl;
}

/** Con movimiento reducido: todo en su lugar, sin desplazamientos. */
export function mapaQuieto(raiz: Element) {
  const q = gsap.utils.selector(raiz);
  gsap.set(q(".mp-etq, .mp-lugar, .mp-pin, .mp-rotulo"), { opacity: 1 });
  gsap.set(q(".mp-pin-onda"), { opacity: 0 });
}
