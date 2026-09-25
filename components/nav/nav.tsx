"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { enlace, hayNumero } from "@/components/formulario/consulta";
import { Logo } from "@/components/cierre/logos";
import "@/components/ui/boton.css";
import "./nav.css";

// NAVBAR (bloque 1, D-040; reemplaza el "sacarlo" de D-036). Mateo eligió la 1 de la ronda: Dennis
// Snellenberg (dennissnellenberg.com), con el menú curvo de Olivier Larose. Arriba de todo, el logo y
// los links sobre el hero; al bajar, los links se quedan atrás y aparece arriba a la derecha un botón
// redondo fijo; al tocarlo entra desde la derecha un panel azul con el borde curvo que se estira.
// En el celular el botón está desde el principio. Sin el botón rápido de antes (Mateo: "quitá ese call
// to action rápido"): cada sección ya termina en el calendario.

const LINKS = [
  { texto: "El espacio", href: "#espacio" },
  { texto: "Qué incluye", href: "#incluye" },
  { texto: "Disponibilidad", href: "#disponibilidad" },
  { texto: "Dónde estamos", href: "#ubicacion" },
];

// De docs/01-CONTEXT.md (el mismo que usa el pie).
const INSTAGRAM = "https://www.instagram.com/araucariamultiespacio/";
const WHATSAPP = hayNumero ? enlace("Hola Araucaria, quería hacer una consulta sobre el salón.") : null;

const quieto = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
const esAncho = () => window.matchMedia("(min-width: 900px)").matches;

/** El borde curvo del panel: con la curva hacia afuera mientras se mueve, recto cuando se queda. */
const curva = (alto: number, estirada: boolean) => `M100 0 L100 ${alto} Q${estirada ? -100 : 100} ${alto / 2} 100 0`;

export function Nav() {
  const lenis = useLenis();
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const borde = useRef<SVGPathElement>(null);
  const velo = useRef<HTMLDivElement>(null);
  const primero = useRef(true);

  // El botón redondo: en el escritorio crece (con un rebote) cuando la barra de arriba quedó atrás y se
  // achica al volver arriba; en el celular está siempre.
  useGSAP(() => {
    const b = boton.current;
    if (!b) return;
    const d = quieto() ? 1 : 0;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      gsap.set(b, { scale: 0 });
      ScrollTrigger.create({
        start: 160,
        onEnter: () => gsap.to(b, { scale: 1, duration: 0.55 * d, ease: "back.out(1.8)", overwrite: true }),
        onLeaveBack: () => {
          if (!document.documentElement.hasAttribute("data-menu-abierto")) gsap.to(b, { scale: 0, duration: 0.35 * d, ease: "power2.in", overwrite: true });
        },
      });
    });
    // En el celular se esconde hacia arriba mientras se baja y vuelve apenas se sube: así no tapa lo que
    // queda arriba a la derecha ("Cambiar" en el panel del día, que la página deja a 16 px del borde,
    // D-035, ni el botón de ampliar de la galería).
    mm.add("(max-width: 899px)", () => {
      gsap.set(b, { scale: 1, yPercent: 0 });
      let escondido = false;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (st) => {
          if (document.documentElement.hasAttribute("data-menu-abierto")) return;
          const esconder = st.direction === 1 && st.scroll() > 160;
          if (esconder === escondido) return;
          escondido = esconder;
          gsap.to(b, { yPercent: esconder ? -170 : 0, duration: 0.45 * d, ease: esconder ? "power2.in" : "back.out(1.6)", overwrite: "auto" });
        },
      });
    });
    return () => mm.revert();
  });

  // Abrir y cerrar: el panel entra desde la derecha (0,8 s) mientras su borde se estira hacia afuera y
  // vuelve recto; los links llegan uno detrás de otro. Al cerrar, lo mismo al revés.
  useEffect(() => {
    const p = panel.current;
    const path = borde.current;
    if (!p || !path) return;
    const alto = 1000; // el alto del viewBox del borde (se estira al alto del panel)
    const d = quieto() ? 1 : 0;
    const items = p.querySelectorAll(".nav-panel-item");
    if (primero.current) {
      primero.current = false;
      // x: 0 explícito: GSAP leería el translateX(101%) del CSS como píxeles (G-047).
      gsap.set(p, { x: 0, xPercent: 101 });
      gsap.set(path, { attr: { d: curva(alto, false) } });
      return;
    }
    const raiz = document.documentElement;
    if (abierto) {
      raiz.setAttribute("data-menu-abierto", "");
      lenis?.stop();
      gsap.to(boton.current, { scale: 1, yPercent: 0, duration: 0.3 * d, overwrite: true });
      gsap.to(velo.current, { autoAlpha: 1, duration: 0.5 * d });
      gsap.fromTo(p, { x: 0, xPercent: 101 }, { x: 0, xPercent: 0, duration: 0.8 * d, ease: "power3.inOut" });
      gsap.fromTo(path, { attr: { d: curva(alto, true) } }, { attr: { d: curva(alto, false) }, duration: 0.9 * d, ease: "power3.inOut" });
      gsap.fromTo(items, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 * d, ease: "power3.out", stagger: 0.06 * d, delay: 0.25 * d });
      p.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    } else {
      raiz.removeAttribute("data-menu-abierto");
      lenis?.start();
      gsap.to(velo.current, { autoAlpha: 0, duration: 0.5 * d });
      gsap.to(p, { x: 0, xPercent: 101, duration: 0.8 * d, ease: "power3.inOut" });
      gsap.fromTo(path, { attr: { d: curva(alto, true) } }, { attr: { d: curva(alto, false) }, duration: 0.9 * d, ease: "power3.inOut" });
      // En el escritorio, si se cierra arriba de todo, el botón vuelve a esconderse.
      if (esAncho() && window.scrollY < 160) gsap.to(boton.current, { scale: 0, duration: 0.35 * d, ease: "power2.in", delay: 0.5 * d });
    }
  }, [abierto, lenis]);

  // Esc cierra.
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierto]);

  // Un link lleva a su sección: con el menú abierto, primero se cierra y después la página baja.
  function ir(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const destino = document.querySelector<HTMLElement>(href);
    const estabaAbierto = abierto;
    setAbierto(false);
    if (!destino) return;
    const irAhora = () => {
      const conDedo = !window.matchMedia("(hover: hover)").matches;
      // Con el dedo, el scroll del navegador (Lenis ignora scrollTo con un toque en curso, G-056).
      if (lenis && !conDedo && quieto()) lenis.scrollTo(destino, { duration: 1.4 });
      else destino.scrollIntoView({ behavior: quieto() ? "smooth" : "auto" });
    };
    if (estabaAbierto) window.setTimeout(irAhora, quieto() ? 450 : 0);
    else irAhora();
  }

  return (
    <>
      <header className="nav-barra">
        <a className="nav-marca" href="#inicio" onClick={(e) => ir(e, "#inicio")}>
          <Image src="/media/logo-araucaria.png" alt="" width={52} height={52} priority />
          <span>
            Araucaria
            <small>multiespacio</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Secciones">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => ir(e, l.href)}>
              {l.texto}
            </a>
          ))}
        </nav>
      </header>

      <button
        ref={boton}
        type="button"
        className="nav-boton"
        data-abierto={abierto ? "" : undefined}
        aria-expanded={abierto}
        aria-controls="nav-panel"
        aria-label={abierto ? "Cerrar el menú" : "Abrir el menú"}
        onClick={() => setAbierto((a) => !a)}
      >
        <span className="nav-boton-rayas" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div ref={velo} className="nav-velo" aria-hidden="true" onClick={() => setAbierto(false)} />

      <div
        ref={panel}
        id="nav-panel"
        className="nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        aria-hidden={!abierto}
        inert={!abierto}
      >
        <svg className="nav-panel-borde" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
          <path ref={borde} />
        </svg>
        <div className="nav-panel-cuerpo">
          <p className="nav-panel-titulo nav-panel-item">Navegación</p>
          <ul className="nav-panel-links">
            {LINKS.map((l) => (
              <li key={l.href} className="nav-panel-item">
                <a href={l.href} onClick={(e) => ir(e, l.href)}>
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-panel-pie">
            <a className="boton boton-en-oscuro nav-panel-item" href="#disponibilidad" onClick={(e) => ir(e, "#disponibilidad")}>
              Consultar disponibilidad
            </a>
            <div className="nav-panel-redes nav-panel-item">
              {WHATSAPP ? (
                <a href={WHATSAPP} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp" title="WhatsApp">
                  <Logo marca="whatsapp" />
                </a>
              ) : null}
              <a href={INSTAGRAM} target="_blank" rel="noopener" aria-label="Instagram @araucariamultiespacio" title="Instagram">
                <Logo marca="instagram" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
