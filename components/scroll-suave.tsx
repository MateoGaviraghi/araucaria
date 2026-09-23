"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import "lenis/dist/lenis.css";

// Scroll suave de la landing (Lenis, ya elegido en docs/02-STACK.md). Mateo, 2026-09-23: "si", para
// que la pila de la galería avance pareja con la rueda del mouse en vez de a saltos.
//
// - La rueda va con lerp 0.075: el "Cinemático" que Mateo eligió midiendo en Sanalys.
// - El dedo en el celular queda NATIVO (syncTouch apagado): el sistema ya tiene su inercia, y
//   re-simularla se siente gomosa y en iOS falla.
// - Un solo reloj: Lenis avanza con el ticker de GSAP y le avisa a ScrollTrigger en cada paso. Dos
//   bucles de requestAnimationFrame compitiendo son el temblor clásico de las secciones fijas.
// - Con movimiento reducido no se monta: el scroll del sistema, tal cual.
//
// Se monta en app/page.tsx y no en el layout: el panel /admin es una herramienta y no lo lleva.

const REDUCIDO = "(prefers-reduced-motion: reduce)";

function suscribir(avisar: () => void) {
  const mq = window.matchMedia(REDUCIDO);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}

function Reloj() {
  const lenis = useLenis(ScrollTrigger.update);

  useEffect(() => {
    if (!lenis) return;
    const avanzar = (segundos: number) => lenis.raf(segundos * 1000);
    gsap.ticker.add(avanzar);
    // Que GSAP no "se ponga al día" de golpe después de un corte: pelea con el suavizado de Lenis.
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(avanzar);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

export function ScrollSuave() {
  // En el servidor se da por reducido: no se pinta nada y el cliente decide al hidratar.
  const reducido = useSyncExternalStore(
    suscribir,
    () => window.matchMedia(REDUCIDO).matches,
    () => true,
  );

  if (reducido) return null;

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.075, syncTouch: false, anchors: true }}>
      <Reloj />
    </ReactLenis>
  );
}
