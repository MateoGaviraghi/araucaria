"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// La entrada del login (D-043): el telón azul se corre y deja ver el jardín, que se asienta de 1,12 a 1;
// detrás suben el título y la bajada. El formulario llega aparte (se muestra después de
// revisar la cookie, D-021) y engancha su parte en el mismo reloj con `desdeElInicio()`.

const inicio = { t: 0 };

// Segundos desde que arrancó la entrada. El primero que la llama pone el reloj: el efecto del
// formulario puede correr antes que el de la escena (React corre primero los efectos de los hijos).
export function desdeElInicio() {
  if (!inicio.t) inicio.t = performance.now();
  return (performance.now() - inicio.t) / 1000;
}

export const conMovimiento = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

export function LoginEscena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      desdeElInicio();
      if (!conMovimiento()) return;
      const q = gsap.utils.selector(raiz);
      const ancho = window.matchMedia("(min-width: 900px)").matches;

      // G-047: lo que el guion dejó corrido por CSS se anima con los dos extremos explícitos.
      gsap.fromTo(
        q(".lg-telon"),
        { xPercent: 0, yPercent: 0, x: 0, y: 0 },
        ancho
          ? { xPercent: 101, yPercent: 0, duration: 1.2, ease: "power3.inOut" }
          : { xPercent: 0, yPercent: 101, duration: 1.2, ease: "power3.inOut" },
      );
      gsap.fromTo(q(".lg-foto-img"), { scale: 1.12 }, { scale: 1, duration: 2, ease: "power2.out" });
      gsap.fromTo(
        q(".lg-sube"),
        { yPercent: 110, y: 0 },
        { yPercent: 0, y: 0, duration: 1, delay: 0.5, stagger: 0.08, ease: "expo.out" },
      );
      gsap.fromTo(q(".lg-bajada"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: "power3.out" });
    },
    { scope: raiz },
  );

  return (
    <main ref={raiz} className="lg">
      <div className="lg-foto" aria-hidden="true">
        <Image
          className="lg-foto-img"
          src="/media/fotos/jardin.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 900px) 58vw, 100vw"
        />
        <span className="lg-telon" />
      </div>

      <div className="lg-panel">
        <div className="lg-caja">
          <h1 className="lg-titulo">
            <span className="lg-mascara">
              <span className="lg-sube">Panel de</span>
            </span>{" "}
            <span className="lg-mascara">
              <span className="lg-sube">Araucaria</span>
            </span>
          </h1>
          <p className="lg-bajada">Entrá con la contraseña del salón.</p>
          {children}
        </div>
      </div>
    </main>
  );
}
