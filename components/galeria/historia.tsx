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
// - En el celular, además, se desliza con el dedo (D-031). Mateo: "en mobile me gustaría que vos
//   tengas para deslizar con el dedo entre el carrusel de las imágenes y no esperar".
// - Solas: el video pasa cuando termina; la foto, a los FOTO segundos ("solas", Mateo).
// - Frenan si la tarjeta no está arriba de la pila, fuera de pantalla, con el mouse encima, con el
//   visor abierto, con el dedo encima y con movimiento reducido. Nunca corre más de un video (G-041).
// - La nueva entra como cortina tapando a la anterior, sin fundido: el mismo gesto que las tomas
//   del hero. La ventana avanza y la imagen de adentro retrocede lo mismo, así que la imagen queda
//   quieta y lo que se mueve es el borde; la que sale se corre un poco. En el escritorio la cortina
//   sube (eje y); en el celular entra de costado (eje x), en la misma dirección que el dedo.
//
// Quién va en pantalla lo decide la tarjeta (tarjeta.tsx), porque el fondo desenfocado también lo
// necesita.

const FOTO = 6; // s que se queda una foto
const CORTINA = 0.9; // s del cambio de toma
const CURVA = "power3.inOut";
const CORRIDA = 12; // % que se corre la toma que sale
// El dedo: a partir de cuántos px el gesto es de costado, cuánto del ancho hay que arrastrar para
// que pase sola al soltar, y la velocidad (px/ms) de un gesto rápido que pasa aunque sea corto.
const UMBRAL = 8;
const PASA = 0.25;
const RAPIDO = 0.4;
const RECIENTE = 80; // ms del final del gesto con los que se mide la velocidad
const SOLTAR = 0.45; // s que tarda en completarse o en volver al soltar

const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Props = {
  piezas: Pieza[];
  nombre: string;
  actual: number;
  /** La que se está yendo durante la cortina, o null. */
  anterior: number | null;
  /** 1 hacia adelante (entra desde abajo o desde la derecha), -1 hacia atrás. */
  sentido: 1 | -1;
  /** Por dónde entra la cortina: "y" desde abajo (escritorio), "x" de costado y con el dedo
   * (celular). */
  eje: "x" | "y";
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
  eje,
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

  // Si el dedo ya hizo la cortina, el cambio de toma que sigue no la vuelve a hacer.
  const yaCorrida = useRef(false);

  // La cortina y la raya del avance. Se rearma en cada cambio de toma: revertOnUpdate deshace la
  // anterior a medio camino si se toca rápido, y el primer set deja todo en su lugar antes de
  // empezar la nueva (también lo que haya dejado el dedo).
  useGSAP(
    () => {
      const el = raiz.current;
      if (!el) return;
      const capas = gsap.utils.toArray<HTMLElement>(".gal-historia-capa", el);
      const medios = capas.map((c) => c.querySelector(".gal-historia-media"));
      const rayas = gsap.utils.toArray<HTMLElement>(".gal-historia-raya i", el);
      gsap.set([...capas, ...medios], { xPercent: 0, yPercent: 0 });
      gsap.set(capas, { clearProps: "visibility,zIndex" });
      rayas.forEach((r, j) => gsap.set(r, { scaleX: j < actual ? 1 : 0 }));

      const quieto = reducido();
      const P = eje === "x" ? "xPercent" : "yPercent";
      if (anterior !== null && !quieto && !yaCorrida.current) {
        const entra = capas[actual];
        gsap
          .timeline({ onComplete: onFinCortina })
          .fromTo(entra, { [P]: 100 * sentido }, { [P]: 0, duration: CORTINA, ease: CURVA }, 0)
          .fromTo(
            medios[actual],
            { [P]: -100 * sentido },
            { [P]: 0, duration: CORTINA, ease: CURVA },
            0,
          )
          .to(medios[anterior], { [P]: -CORRIDA * sentido, duration: CORTINA, ease: CURVA }, 0);
      } else if (anterior !== null) {
        onFinCortina();
      }
      yaCorrida.current = false;

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

  // EL DEDO (solo en el celular, eje x). La toma sigue al dedo: arrastrando hacia la izquierda la
  // siguiente entra por el borde derecho como la misma cortina, pero en la mano; hacia la derecha,
  // vuelve la anterior. Al soltar, pasada la cuarta parte del ancho o con un gesto rápido, se
  // completa; si no, vuelve. Solo el gesto de costado es de la galería: el vertical es la página
  // (touch-action: pan-y en la hoja). Mientras el dedo está encima, el avance solo espera.
  const gesto = useRef<{
    x0: number;
    y0: number;
    t0: number;
    dx: number;
    modo: "h" | "v" | null;
    destino: number | null;
    s: 1 | -1;
    /** Los últimos puntos del dedo, para medir la velocidad del final del gesto y no la del total
     * (que cuenta la pausa antes de arrancar). */
    rastro: Array<{ x: number; t: number }>;
  } | null>(null);
  const arrastro = useRef(false);
  const puedeArrastrar = eje === "x" && n > 1;

  const partes = () => {
    const el = raiz.current;
    if (!el) return null;
    const capas = gsap.utils.toArray<HTMLElement>(".gal-historia-capa", el);
    return { el, capas, medios: capas.map((c) => c.querySelector<HTMLElement>(".gal-historia-media")) };
  };

  const seguirDedo = (dx: number) => {
    const g = gesto.current;
    const p = partes();
    if (!g || !p) return;
    const ancho = p.el.offsetWidth || 1;
    const s: 1 | -1 = dx < 0 ? 1 : -1;
    const destino = s === 1 ? siguiente : (actual - 1 + n) % n;
    // Si cambió de lado, la que estaba asomando vuelve a esconderse.
    if (g.destino !== null && g.destino !== destino) {
      gsap.set(p.capas[g.destino] ?? [], { clearProps: "visibility,zIndex", xPercent: 0 });
      gsap.set(p.medios[g.destino] ?? [], { xPercent: 0 });
    }
    g.destino = destino;
    g.s = s;
    const avance = Math.min(1, Math.abs(dx) / ancho);
    gsap.set(p.capas[destino] ?? [], { visibility: "visible", zIndex: 3, xPercent: s * 100 * (1 - avance) });
    gsap.set(p.medios[destino] ?? [], { xPercent: -s * 100 * (1 - avance) });
    gsap.set(p.medios[actual] ?? [], { xPercent: -s * CORRIDA * avance });
  };

  const soltar = (cancelado: boolean) => {
    const g = gesto.current;
    gesto.current = null;
    const p = partes();
    if (!g || g.modo !== "h" || g.destino === null || !p) return;
    const ancho = p.el.offsetWidth || 1;
    const avance = Math.abs(g.dx) / ancho;
    const ahora = performance.now();
    const ultimo = g.rastro[g.rastro.length - 1];
    const viejo = g.rastro.find((r) => ahora - r.t <= RECIENTE) ?? g.rastro[0];
    const velocidad =
      ultimo && viejo && ultimo.t > viejo.t ? Math.abs(ultimo.x - viejo.x) / (ultimo.t - viejo.t) : 0;
    const pasa = !cancelado && (avance > PASA || (velocidad > RAPIDO && avance > 0.06));
    const { destino, s } = g;
    const duracion = Math.max(0.2, SOLTAR * (pasa ? 1 - avance : avance) + 0.12);
    const capa = p.capas[destino];
    const media = p.medios[destino];
    const sale = p.medios[actual];
    if (pasa) {
      gsap
        .timeline({
          onComplete: () => {
            yaCorrida.current = true;
            onIr(destino, s);
          },
        })
        .to(capa ?? [], { xPercent: 0, duration: duracion, ease: "power3.out" }, 0)
        .to(media ?? [], { xPercent: 0, duration: duracion, ease: "power3.out" }, 0)
        .to(sale ?? [], { xPercent: -s * CORRIDA, duration: duracion, ease: "power3.out" }, 0);
      return;
    }
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(capa ?? [], { clearProps: "visibility,zIndex" });
          // Vuelve a correr lo que el dedo frenó.
          if (!corriendo) return;
          reloj.current?.resume();
          void videos.current[actual]?.play().catch(() => {});
        },
      })
      .to(capa ?? [], { xPercent: s * 100, duration: duracion, ease: "power3.out" }, 0)
      .to(media ?? [], { xPercent: -s * 100, duration: duracion, ease: "power3.out" }, 0)
      .to(sale ?? [], { xPercent: 0, duration: duracion, ease: "power3.out" }, 0);
  };

  return (
    <div
      ref={raiz}
      className="gal-historia"
      role="group"
      aria-roledescription="carrusel"
      aria-label={`${nombre}: ${n === 1 ? "una toma" : `${n} tomas`}`}
      onPointerDown={(e) => {
        if (!puedeArrastrar || e.pointerType === "mouse" || reducido()) return;
        if ((e.target as HTMLElement).closest(".gal-historia-ver")) return;
        gesto.current = {
          x0: e.clientX,
          y0: e.clientY,
          t0: performance.now(),
          dx: 0,
          modo: null,
          destino: null,
          s: 1,
          rastro: [{ x: e.clientX, t: performance.now() }],
        };
        arrastro.current = false;
      }}
      onPointerMove={(e) => {
        const g = gesto.current;
        if (!g) return;
        const dx = e.clientX - g.x0;
        const dy = e.clientY - g.y0;
        if (g.modo === null) {
          if (Math.abs(dy) > UMBRAL && Math.abs(dy) >= Math.abs(dx)) {
            gesto.current = null; // es la página bajando: no es de la galería
            return;
          }
          if (Math.abs(dx) <= UMBRAL) return;
          g.modo = "h";
          arrastro.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          reloj.current?.pause();
          videos.current[actual]?.pause();
        }
        g.dx = dx;
        g.rastro.push({ x: e.clientX, t: performance.now() });
        if (g.rastro.length > 12) g.rastro.shift();
        seguirDedo(dx);
      }}
      onPointerUp={() => soltar(false)}
      onPointerCancel={() => soltar(true)}
      // Un arrastre no es un toque: que no llegue a los botones de pasar.
      onClickCapture={(e) => {
        if (!arrastro.current) return;
        arrastro.current = false;
        e.stopPropagation();
        e.preventDefault();
      }}
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
