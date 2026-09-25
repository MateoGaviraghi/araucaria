"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { enlace, hayNumero } from "@/components/formulario/consulta";
import { Logo } from "@/components/cierre/logos";
import "@/components/ui/boton.css";
import "./nav.css";

// NAVBAR (bloque 1, D-041; reemplaza el botón redondo de D-040). Mateo: "no baja el header completo
// donde siga toda la web, lo mismo en desktop". El header entero queda fijo arriba en toda la página:
// arriba de todo es transparente sobre el hero; al bajar se vuelve una barra azul con desenfoque y se
// achica (GSAP). Se esconde SOLO mientras pasa la galería, para no achicar sus tarjetas (Mateo: "b").
// En el celular, el botón de menú va dentro del header y abre el panel de borde curvo.

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

/** El borde curvo del panel: con la curva hacia afuera mientras se mueve, recto cuando se queda. */
const curva = (estirada: boolean) => `M100 0 L100 1000 Q${estirada ? -100 : 100} 500 100 0`;

/** El alto del header fijo (lo usan el calendario y los links para dejar las cosas debajo). */
export function altoNav() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-nav")) || 64;
}

export function Nav() {
  const lenis = useLenis();
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);
  const barra = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const borde = useRef<SVGPathElement>(null);
  const velo = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const primero = useRef(true);

  useGSAP(() => {
    const h = barra.current;
    if (!h) return;
    const d = quieto() ? 1 : 0;

    // Al cargar, el header baja desde arriba (lo deja escondido GUION_NAV en app/page.tsx).
    gsap.fromTo(h, { y: 0, yPercent: -110 }, { y: 0, yPercent: 0, duration: 0.9 * d, ease: "power3.out", delay: 0.2 * d });

    // Transparente arriba de todo; al bajar 60 px, la barra azul con desenfoque, más baja.
    // Un solo número, --nav-p de 0 a 1: el CSS saca de ahí el fondo, el desenfoque, la sombra, el alto
    // y el tamaño del logo.
    gsap.set(h, { "--nav-p": 0 });
    const solido = gsap.to(h, { "--nav-p": 1, duration: 0.5 * d, ease: "power3.out", paused: true });
    ScrollTrigger.create({
      start: 60,
      onEnter: () => solido.play(),
      onLeaveBack: () => solido.reverse(),
    });

    // Mientras pasa la galería el header se va para arriba y vuelve después (D-041, Mateo: "b").
    const esconder = (si: boolean) => {
      if (document.documentElement.hasAttribute("data-menu-abierto")) return;
      gsap.to(h, { y: 0, yPercent: si ? -110 : 0, duration: (si ? 0.4 : 0.6) * d, ease: si ? "power2.in" : "power3.out", overwrite: "auto" });
    };
    const galeria = document.querySelector("#espacio");
    if (galeria) {
      ScrollTrigger.create({
        trigger: galeria,
        start: "top 10%",
        end: "bottom 45%",
        onEnter: () => esconder(true),
        onLeave: () => esconder(false),
        onEnterBack: () => esconder(true),
        onLeaveBack: () => esconder(false),
      });
    }

    // El link de la sección en la que se está queda marcado.
    for (const l of LINKS) {
      const s = document.querySelector(l.href);
      if (!s) continue;
      ScrollTrigger.create({
        trigger: s,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (st) => st.isActive && setActiva(l.href),
        onLeaveBack: () => l.href === "#espacio" && setActiva(null),
      });
    }
  });

  // El panel del celular: entra desde la derecha (0,8 s) mientras su borde se estira hacia afuera y
  // vuelve recto; los links llegan uno detrás de otro. Al cerrar, lo mismo al revés.
  useEffect(() => {
    const p = panel.current;
    const path = borde.current;
    if (!p || !path) return;
    const d = quieto() ? 1 : 0;
    const items = p.querySelectorAll(".nav-panel-item");
    if (primero.current) {
      primero.current = false;
      // x: 0 explícito: GSAP leería el translateX(101%) del CSS como píxeles (G-047).
      gsap.set(p, { x: 0, xPercent: 101 });
      gsap.set(path, { attr: { d: curva(false) } });
      return;
    }
    const raiz = document.documentElement;
    if (abierto) {
      raiz.setAttribute("data-menu-abierto", "");
      lenis?.stop();
      gsap.to(barra.current, { y: 0, yPercent: 0, duration: 0.3 * d, overwrite: "auto" });
      gsap.to(velo.current, { autoAlpha: 1, duration: 0.5 * d });
      gsap.fromTo(p, { x: 0, xPercent: 101 }, { x: 0, xPercent: 0, duration: 0.8 * d, ease: "power3.inOut" });
      gsap.fromTo(path, { attr: { d: curva(true) } }, { attr: { d: curva(false) }, duration: 0.9 * d, ease: "power3.inOut" });
      gsap.fromTo(items, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 * d, ease: "power3.out", stagger: 0.06 * d, delay: 0.25 * d });
    } else {
      raiz.removeAttribute("data-menu-abierto");
      lenis?.start();
      gsap.to(velo.current, { autoAlpha: 0, duration: 0.5 * d });
      gsap.to(p, { x: 0, xPercent: 101, duration: 0.8 * d, ease: "power3.inOut" });
      gsap.fromTo(path, { attr: { d: curva(true) } }, { attr: { d: curva(false) }, duration: 0.9 * d, ease: "power3.inOut" });
    }
  }, [abierto, lenis]);

  // Esc cierra; si la pantalla se agranda a escritorio con el menú abierto, también.
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 900px)");
    const cambio = () => mq.matches && setAbierto(false);
    document.addEventListener("keydown", tecla);
    mq.addEventListener("change", cambio);
    return () => {
      document.removeEventListener("keydown", tecla);
      mq.removeEventListener("change", cambio);
    };
  }, [abierto]);

  // Un link lleva a su sección y la deja justo debajo del header; con el menú abierto, primero se
  // cierra.
  function ir(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const destino = document.querySelector<HTMLElement>(href);
    const estabaAbierto = abierto;
    setAbierto(false);
    if (!destino) return;
    const irAhora = () => {
      const y = href === "#inicio" ? 0 : destino.getBoundingClientRect().top + window.scrollY - altoNav();
      const conDedo = !window.matchMedia("(hover: hover)").matches;
      // Con el dedo, el scroll del navegador (Lenis ignora scrollTo con un toque en curso, G-056).
      if (lenis && !conDedo && quieto()) lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: quieto() ? "smooth" : "auto" });
    };
    if (estabaAbierto) window.setTimeout(irAhora, quieto() ? 450 : 0);
    else irAhora();
  }

  return (
    <>
      <header ref={barra} className="nav-barra" data-abierto={abierto ? "" : undefined}>
        <div className="nav-barra-cuerpo">
          <a className="nav-marca" href="#inicio" onClick={(e) => ir(e, "#inicio")}>
            <Image src="/media/logo-araucaria.png" alt="" width={52} height={52} priority />
            <span>
              Araucaria
              <small>multiespacio</small>
            </span>
          </a>
          <nav className="nav-links" aria-label="Secciones">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => ir(e, l.href)} aria-current={activa === l.href ? "location" : undefined}>
                {l.texto}
              </a>
            ))}
          </nav>
          <button
            ref={boton}
            type="button"
            className="nav-boton"
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
        </div>
      </header>

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
