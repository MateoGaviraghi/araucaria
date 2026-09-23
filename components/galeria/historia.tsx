"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Pieza } from "./contenido";

// Las tomas de un espacio, una a la vez y a tamaño completo, con la forma de las historias de
// Instagram: de ahí llega la mayoría de la gente, y es lo que ya sabe usar sin pensarlo. Mateo,
// 2026-09-23, sobre las tomas chicas en tarjetas grandes: "necesito que sea algo claro, que se vea
// bien y sea profesional, pero la facilidad de la persona de conocer cada uno de los espacios".
//
// - Tocar a la derecha pasa a la siguiente; a la izquierda, a la anterior.
// - Solas: el video pasa cuando termina; la foto, a los FOTO segundos ("solas", Mateo).
// - Frenan si la tarjeta no está arriba de la pila, fuera de pantalla, con el mouse encima, con el
//   visor abierto y con movimiento reducido. Nunca corre más de un video (G-041).
// - La nueva entra como cortina tapando a la anterior, sin fundido: el mismo gesto que las tomas
//   del hero. La ventana sube y la imagen de adentro baja lo mismo, así que la imagen queda quieta
//   y lo que se mueve es el borde; la de atrás se corre un poco hacia arriba.
//
// Quién va en pantalla lo decide la tarjeta (tarjeta.tsx), porque el fondo desenfocado y las
// flechas del escritorio también lo necesitan.

const FOTO = 6; // s que se queda una foto
const CORTINA = 0.9; // s del cambio de toma
const CURVA = "power3.inOut";
const CORRIDA = 12; // % que se corre hacia arriba la toma que sale

const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Props = {
  piezas: Pieza[];
  nombre: string;
  actual: number;
  /** La que se está yendo durante la cortina, o null. */
  anterior: number | null;
  /** 1 hacia adelante (entra desde abajo), -1 hacia atrás (entra desde arriba). */
  sentido: 1 | -1;
  /** Si puede correr: tarjeta arriba de la pila, sin mouse encima y sin visor. */
  corre: boolean;
  /** Si un video solo se repite (la pila) o termina y avisa (la fila del escritorio, que pasa el
   * turno al espacio de al lado). */
  repetir: boolean;
  /** Se llama cuando termina una toma: el video al final, la foto a los FOTO segundos. */
  onFinToma?: () => void;
  onIr: (indice: number, sentido: 1 | -1) => void;
  onFinCortina: () => void;
  onAbrir: (indice: number) => void;
};

export function Historia({
  piezas,
  nombre,
  actual,
  anterior,
  sentido,
  corre,
  repetir,
  onFinToma,
  onIr,
  onFinCortina,
  onAbrir,
}: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);
  const reloj = useRef<gsap.core.Tween | null>(null);
  const [cerca, setCerca] = useState(false);
  const [visible, setVisible] = useState(false);
  const n = piezas.length;
  const siguiente = (actual + 1) % n;
  const corriendo = corre && visible;

  // A 400 px se montan los videos; al verse, pueden correr.
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const previo = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setCerca(true);
          previo.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    const mira = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), {
      threshold: 0.15,
    });
    previo.observe(el);
    mira.observe(el);
    return () => {
      previo.disconnect();
      mira.disconnect();
    };
  }, []);

  // El video de turno arranca de cero cada vez que le toca, y solo si puede correr.
  const turnoVisto = useRef(-1);
  useEffect(() => {
    const v = videos.current[actual];
    videos.current.forEach((otro, j) => {
      if (otro && j !== actual) otro.pause();
    });
    if (!v || reducido()) return;
    if (turnoVisto.current !== actual) {
      turnoVisto.current = actual;
      v.currentTime = 0;
    }
    if (corriendo) void v.play().catch(() => {});
    else v.pause();
  }, [actual, corriendo, cerca]);

  // La cortina y la raya del avance. Se rearma en cada cambio de toma: revertOnUpdate deshace la
  // anterior a medio camino si se toca rápido, y el primer set deja todo en su lugar antes de
  // empezar la nueva.
  useGSAP(
    () => {
      const el = raiz.current;
      if (!el) return;
      const capas = gsap.utils.toArray<HTMLElement>(".gal-historia-capa", el);
      const medios = capas.map((c) => c.querySelector(".gal-historia-media"));
      const rayas = gsap.utils.toArray<HTMLElement>(".gal-historia-raya i", el);
      gsap.set([...capas, ...medios], { yPercent: 0 });
      rayas.forEach((r, j) => gsap.set(r, { scaleX: j < actual ? 1 : 0 }));

      const quieto = reducido();
      if (anterior !== null && !quieto) {
        const entra = capas[actual];
        gsap
          .timeline({ onComplete: onFinCortina })
          .fromTo(entra, { yPercent: 100 * sentido }, { yPercent: 0, duration: CORTINA, ease: CURVA }, 0)
          .fromTo(
            medios[actual],
            { yPercent: -100 * sentido },
            { yPercent: 0, duration: CORTINA, ease: CURVA },
            0,
          )
          .to(medios[anterior], { yPercent: -CORRIDA * sentido, duration: CORTINA, ease: CURVA }, 0);
      } else if (anterior !== null) {
        onFinCortina();
      }

      // El avance. La foto lo cuenta con un tween de FOTO segundos; el video, con su propio reloj.
      const raya = rayas[actual];
      if (!raya || quieto) return;
      if (!piezas[actual]?.video) {
        reloj.current = gsap.to(raya, {
          scaleX: 1,
          duration: FOTO,
          ease: "none",
          paused: true,
          onComplete: () => {
            onFinToma?.();
            if (n > 1) onIr(siguiente, 1);
          },
        });
        return () => {
          reloj.current = null;
        };
      }
      const seguir = () => {
        const v = videos.current[actual];
        if (v && v.duration) gsap.set(raya, { scaleX: v.currentTime / v.duration });
      };
      gsap.ticker.add(seguir);
      return () => gsap.ticker.remove(seguir);
    },
    { dependencies: [actual], scope: raiz, revertOnUpdate: true },
  );

  // El reloj de la foto corre y frena con la tarjeta.
  useEffect(() => {
    const r = reloj.current;
    if (!r) return;
    if (corriendo) r.resume();
    else r.pause();
  }, [corriendo, actual]);

  return (
    <div
      ref={raiz}
      className="gal-historia"
      role="group"
      aria-roledescription="carrusel"
      aria-label={`${nombre}: ${n === 1 ? "una toma" : `${n} tomas`}`}
    >
      <div className="gal-historia-lente">
        {piezas.map((pieza, j) => {
          const estado = j === actual ? "actual" : j === anterior ? "anterior" : undefined;
          const posicion = `center ${pieza.foco ?? "50%"}`;
          return (
            <div key={pieza.id} className="gal-historia-capa" data-estado={estado} aria-hidden={j !== actual}>
              <div className="gal-historia-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pieza.poster}
                  alt={pieza.alt}
                  style={{ objectPosition: posicion }}
                  loading="lazy"
                  decoding="async"
                />
                {pieza.video && cerca && estado && (
                  <video
                    ref={(v) => {
                      videos.current[j] = v;
                    }}
                    style={{ objectPosition: posicion }}
                    poster={pieza.poster}
                    muted
                    playsInline
                    loop={n === 1 && repetir}
                    preload="metadata"
                    tabIndex={-1}
                    aria-hidden="true"
                    onEnded={(e) => {
                      onFinToma?.();
                      if (n > 1) {
                        onIr(siguiente, 1);
                        return;
                      }
                      // Una sola toma que no se repite sola: vuelve al principio y sigue si todavía
                      // le toca (el mouse encima); si el turno pasó, el efecto de arriba la frena.
                      const v = e.currentTarget;
                      v.currentTime = 0;
                      void v.play().catch(() => {});
                    }}
                  >
                    <source src={pieza.video} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="gal-historia-rayas" aria-hidden="true">
        {piezas.map((pieza) => (
          <span key={pieza.id} className="gal-historia-raya">
            <i />
          </span>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            className="gal-historia-paso gal-historia-paso-antes"
            aria-label="Toma anterior"
            onClick={() => onIr((actual - 1 + n) % n, -1)}
          />
          <button
            type="button"
            className="gal-historia-paso gal-historia-paso-despues"
            aria-label="Toma siguiente"
            onClick={() => onIr(siguiente, 1)}
          />
        </>
      )}

      <button
        type="button"
        className="gal-historia-ver"
        aria-label={`Ver ${nombre} en grande`}
        onClick={() => onAbrir(actual)}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M9.5 2h4.5v4.5M6.5 14H2V9.5M14 2l-5 5M2 14l5-5" strokeLinecap="round" />
        </svg>
      </button>

      <span className="gal-historia-cuenta">
        Toma {actual + 1} de {n}
      </span>
    </div>
  );
}
