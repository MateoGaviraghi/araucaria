"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// El texto entra acompañando la apertura del video, no antes: el marco empieza a crecer a los
// 0,35 s y el titular sale detrás, escalonado. Sin esto el movimiento es solo del video y el
// resto "ya estaba" (criterio §2: todo sincronizado).
// Si el script no corre, la hoja que lo oculta se quita sola a los 3 s y el texto aparece.

const ARRANQUE = 0.55; // s — el marco ya creció más de la mitad
const PASO = 1.1; // s
const ESCALON = 0.09; // s

export function EntradaTexto({ children, className }: { children: ReactNode; className?: string }) {
  const caja = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const hijos = caja.current?.children;
      if (!hijos?.length) return;
      // fromTo, no from: el estado inicial lo pone una hoja inyectada antes del pintado
      // (hero-apertura.tsx), así que `from` tomaría 0 como destino y el texto no aparecería.
      gsap.fromTo(
        hijos,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: PASO, ease: "power3.out", stagger: ESCALON, delay: ARRANQUE },
      );
    },
    { scope: caja },
  );

  return (
    <div ref={caja} className={className}>
      {children}
    </div>
  );
}
