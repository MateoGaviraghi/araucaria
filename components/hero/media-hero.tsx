"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// La media del hero. Arranca CERRADA —la pantalla entera del azul de la marca— y se abre como un
// RECTÁNGULO CHICO EN EL MEDIO que crece hasta llenarla, con margen en los cuatro lados todo el
// tiempo (Mateo, 2026-09-22, con un dibujo).
//
// Cuatro paneles que se corren, uno por lado, y la ventana es lo que queda entre ellos. Los cuatro
// se mueven JUNTOS y con la misma curva: así la ventana crece manteniendo la proporción de la
// pantalla, que es lo que la hace acostada en escritorio y parada en el teléfono, sin tener que
// tratar cada tamaño por separado. Moverlos con desfase abría una franja de borde a borde, que no
// es un rectángulo: esa versión queda descartada.
//
// Solo se anima `transform` en cuatro elementos planos: el video nunca se escala, ni se
// contra-escala, ni se recorta con clip-path. Es la versión que el compositor hace sola.

/** `foco` es el object-position vertical: recortado a horizontal, cada toma se entiende en un
 * punto distinto del cuadro (medido en el prototipo, 2026-09-21). */
export type Toma = { src: string; poster: string; alt: string; foco?: string };

const APERTURA = 1.5; // s que tardan los paneles en salir
const ESPERA = 0.3; // s quieto, en azul, antes de abrir
const CURVA = "expo.inOut";
const POR_TOMA = 7; // s por toma (criterio §2, carruseles)
const CORTINA = 1.25; // s que tarda la cortina en tapar la toma anterior

type Props = {
  tomas: Toma[];
  /** Cambia de toma cada 7 s. Con una sola toma no hace nada. */
  rotar?: boolean;
};

export function MediaHero({ tomas, rotar = false }: Props) {
  const marco = useRef<HTMLDivElement>(null);
  const arriba = useRef<HTMLSpanElement>(null);
  const abajo = useRef<HTMLSpanElement>(null);
  const izq = useRef<HTMLSpanElement>(null);
  const der = useRef<HTMLSpanElement>(null);
  const [activa, setActiva] = useState(0);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      const t = arriba.current;
      const b = abajo.current;
      const i = izq.current;
      const d = der.current;
      if (!t || !b || !i || !d) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([t, b], { yPercent: (k) => (k === 0 ? -101 : 101) });
        gsap.set([i, d], { xPercent: (k) => (k === 0 ? -101 : 101) });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: ESPERA })
          .fromTo(t, { yPercent: 0 }, { yPercent: -101, duration: APERTURA, ease: CURVA }, 0)
          .fromTo(b, { yPercent: 0 }, { yPercent: 101, duration: APERTURA, ease: CURVA }, 0)
          .fromTo(i, { xPercent: 0 }, { xPercent: -101, duration: APERTURA, ease: CURVA }, 0)
          .fromTo(d, { xPercent: 0 }, { xPercent: 101, duration: APERTURA, ease: CURVA }, 0);
      });

      return () => mm.revert();
    },
    { scope: marco },
  );

  // Reproduce solo cuando se ve; se frena fuera de pantalla y con movimiento reducido.
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), {
      threshold: 0.15,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Cambio de toma. El siguiente video ya está montado debajo y sube su opacidad.
  useEffect(() => {
    if (!rotar || tomas.length < 2 || !visible) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return;
    const id = window.setInterval(
      () => setActiva((i) => (i + 1) % tomas.length),
      (POR_TOMA + CORTINA) * 1000,
    );
    return () => window.clearInterval(id);
  }, [rotar, tomas.length, visible]);

  return (
    <div ref={marco} className="hero-marco">
      <div className="hero-contra">
        {tomas.map((toma, i) => (
          <Capa
            key={toma.src}
            toma={toma}
            activa={rotar ? i === activa : i === 0}
            reproducir={visible}
            prioridad={i === 0}
          />
        ))}
      </div>
      <div className="hero-trato" aria-hidden="true" />
      <div className="hero-telon" aria-hidden="true">
        <span ref={arriba} className="hero-telon-arriba" />
        <span ref={abajo} className="hero-telon-abajo" />
        <span ref={izq} className="hero-telon-izq" />
        <span ref={der} className="hero-telon-der" />
      </div>
    </div>
  );
}

function Capa({
  toma,
  activa,
  reproducir,
  prioridad,
}: {
  toma: Toma;
  activa: boolean;
  reproducir: boolean;
  prioridad: boolean;
}) {
  const capa = useRef<HTMLDivElement>(null);
  const dentro = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const primera = useRef(true);

  // Solo reproduce la toma activa. Dos videos a la vez cuestan cuadros: medido durante el cambio,
  // 50 fps y 30 saltos; con uno solo, 60 fps. La que sale queda quieta, pero la cortina la tapa
  // en vez de fundirla, así que no se la ve desvanecerse.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return;

    if (reproducir && activa) void el.play().catch(() => {});
    else el.pause();
  }, [reproducir, activa]);

  // La cortina: la toma nueva baja tapando a la anterior, y su contenido sube lo mismo, así la
  // imagen se queda quieta y lo único que se mueve es el borde que la descubre. Nada de fundido
  // cruzado: dos planos distintos superpuestos se ven como una doble exposición.
  useGSAP(
    () => {
      const el = capa.current;
      const media = dentro.current;
      if (!el || !media) return;

      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (primera.current || reducido) {
        primera.current = false;
        gsap.set([el, media], { yPercent: 0 });
        return;
      }
      if (!activa) return;

      gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: CORTINA, ease: "expo.inOut" });
      gsap.fromTo(media, { yPercent: -100 }, { yPercent: 0, duration: CORTINA, ease: "expo.inOut" });
    },
    { dependencies: [activa], scope: capa },
  );

  return (
    <div ref={capa} className="hero-capa" data-activa={activa || undefined}>
      <div ref={dentro} className="hero-capa-dentro">
        {/* El póster es el elemento LCP (06-UI-UX §7): una imagen real, no solo el atributo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toma.poster}
          alt={toma.alt}
          className="hero-poster"
          style={{ objectPosition: `center ${toma.foco ?? "42%"}` }}
          fetchPriority={prioridad ? "high" : "low"}
          decoding="async"
        />
        <video
          ref={video}
          className="hero-video"
          style={{ objectPosition: `center ${toma.foco ?? "42%"}` }}
          poster={toma.poster}
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        >
          <source src={toma.src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
