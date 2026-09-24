"use client";

import { useRef } from "react";
import { MODULOS } from "@/content/modulos";
import { gsap, useGSAP } from "@/lib/gsap";
import { enlace, hayNumero } from "@/components/formulario/consulta";
import { Logo, type Marca } from "./logos";
import { entradaDelMapa, Mapa, mapaQuieto } from "./mapa";
import "@/components/ui/boton.css";
import "./cierre.css";

// CIERRE (bloques 7 y 8 juntos, "Dónde nos encontramos", D-036). Mateo eligió "1 con la 2": el mapa
// (Codrops · Scroll-Driven SVG Map) con el pie (Olivier Larose · Sticky Footer); de los prototipos quedó
// una sección beige con la dirección y el mapa, y abajo el pie como una tarjeta azul flotante (21st ·
// Hover Footer, mdafsarx: la versión "C · Tarjeta flotante").
//
// Los datos salen de docs/01-CONTEXT.md (dirección, cómo llegar, teléfonos, mail, Instagram) y los
// horarios de content/modulos.ts. El número de WhatsApp que recibe consultas sigue sin definir (CI-01):
// acá no se muestra.

const COMO_LLEGAR = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Güemes 3660, Santa Fe, Argentina")}`;
const TELEFONOS = [
  { ver: "342 545 0336", tel: "+543425450336" },
  { ver: "342 546 5599", tel: "+543425465599" },
];
const MAIL = "Araucaria3650@gmail.com";
const INSTAGRAM = { ver: "@araucariamultiespacio", url: "https://www.instagram.com/araucariamultiespacio/" };
const HORARIOS = MODULOS.filter((m) => m.codigo !== "dia-completo");

const CURVA = "power3.out";
const ABRE = 0.9;
const ENTRE_LINEAS = 0.07;
const quieto = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;


function L({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`cie-mascara ${className}`}>
      <span className="cie-linea">{children}</span>
    </span>
  );
}

function Direccion({ titulo = "Dónde nos encontramos" }: { titulo?: string }) {
  return (
    <div className="cie-direccion">
      <h2 className="cie-titulo" id="cie-titulo">
        <L>{titulo}</L>
      </h2>
      <p className="cie-calle">
        <L>Güemes 3660</L>
      </p>
      <p className="cie-barrio">
        <L>Santa Fe · Barrio Candioti Norte</L>
      </p>
      <p className="cie-llegar">
        <L>A una cuadra de Bv. Gálvez, cerca de la Estación Belgrano.</L>
      </p>
    </div>
  );
}

function Acciones({ enOscuro = false }: { enOscuro?: boolean }) {
  return (
    <div className="cie-acciones">
      <L>
        <a className={`boton ${enOscuro ? "boton-en-oscuro" : ""}`} href={COMO_LLEGAR} target="_blank" rel="noopener">
          Cómo llegar
          <svg className="cie-flecha" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 12L12 4M6 4h6v6" />
          </svg>
        </a>
      </L>
      <L>
        <a className="cie-consultar" href="#disponibilidad">
          Consultar disponibilidad
        </a>
      </L>
    </div>
  );
}

/**
 * Un dato de contacto (Mateo eligió 21st · Social Links de serafimcloud) con el logo ORIGINAL de cada
 * canal a la vista (Mateo: "que sean los logos originales"): WhatsApp, Gmail, Google Maps, Instagram.
 * Al pasar el mouse, el logo salta grande desde atrás del texto (sube, se inclina −10° y crece de 0,6 a 1
 * en 0,5 s con un rebote) y los otros datos bajan al 40 %. En el celular, al tocar, el logo salta 0,3 s
 * y recién ahí se abre el enlace.
 */
function Dato({ marca, href, externo = false, children }: { marca: Marca; href?: string; externo?: boolean; children: React.ReactNode }) {
  const dedo = useRef(false);
  const contenido = (
    <>
      <L>
        <span className="cie-dato-texto">
          <Logo marca={marca} className="cie-dato-marca" />
          {children}
        </span>
      </L>
      <span className="cie-dato-logo" aria-hidden="true">
        <Logo marca={marca} />
      </span>
    </>
  );
  if (!href) return <span className="cie-dato">{contenido}</span>;

  function tocar(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!dedo.current || !quieto()) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setAttribute("data-salta", "");
    window.setTimeout(() => {
      el.removeAttribute("data-salta");
      if (externo) window.open(href, "_blank", "noopener");
      else window.location.href = href!;
    }, 300);
  }

  return (
    <a
      className="cie-dato"
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener" } : {})}
      onPointerDown={(e) => {
        dedo.current = e.pointerType === "touch";
      }}
      onClick={tocar}
    >
      {contenido}
    </a>
  );
}

/** Las líneas de un bloque suben desde su máscara, una detrás de otra. 130 %: la máscara de los
 *  botones es más alta que el botón (deja ver su canto), con 110 % asomaba el borde de arriba. */
function lineas(tl: gsap.core.Timeline, raiz: Element, selector: string, en = 0) {
  const ls = gsap.utils.toArray<HTMLElement>(selector, raiz);
  if (!ls.length) return;
  tl.fromTo(ls, { y: 0, yPercent: 130 }, { y: 0, yPercent: 0, duration: ABRE, ease: CURVA, stagger: ENTRE_LINEAS }, en);
}

function useEntrada(raiz: React.RefObject<HTMLElement | null>, armar: (el: HTMLElement) => void) {
  useGSAP(
    () => {
      const el = raiz.current;
      if (!el) return;
      if (!quieto()) {
        gsap.set(gsap.utils.toArray(".cie-linea", el), { yPercent: 0 });
        mapaQuieto(el);
        return;
      }
      armar(el);
    },
    { scope: raiz },
  );
}

// ---------------------------------------------------------------- EL PIE (bloque 8)
//
// Mateo: "la 2" (21st · Hover Footer) "hacelo dinámico, más premium; combinalo con los botones". Una
// tarjeta azul con columnas que sube montada sobre el beige de debajo del mapa (1,3 s) y se inclina
// apenas con el mouse; el contacto son los logos originales y cada logo es el link; abajo, ARAUCARIA
// gigante en contorno, toda la palabra del mismo color: el contorno se dibuja (1,6 s) y después aparece
// su relleno tenue (0,9 s).

const SALON_LINKS = [
  { texto: "El espacio", href: "#espacio" },
  { texto: "Disponibilidad", href: "#disponibilidad" },
  { texto: "Dónde estamos", href: "#ubicacion" },
  { texto: "Volver arriba", href: "#inicio" },
];

/**
 * ARAUCARIA en contorno, toda la palabra del mismo color (Mateo: "dejalo del mismo color a toda la
 * palabra, como en CA, porque si no queda feo solo una parte"). Al llegar, el contorno se dibuja.
 */
function Contorno() {
  const texto = { x: 500, y: 172, textAnchor: "middle" as const, textLength: 990, lengthAdjust: "spacingAndGlyphs" as const };
  return (
    <svg className="pie-contorno" viewBox="0 0 1000 190" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <text className="pie-contorno-letras" {...texto}>
        ARAUCARIA
      </text>
    </svg>
  );
}

const WHATSAPP = hayNumero ? enlace("Hola Araucaria, quería hacer una consulta sobre el salón.") : null;

/**
 * A y C: el contacto es una fila de logos originales, y cada logo ES el link (Mateo: "sacá la data de
 * al lado, que el botón sea parte de ese link"). El dato va en el nombre accesible y en el globito del
 * navegador. Al pasar el mouse el logo sube e inclina (0,5 s con rebote).
 */
function Filas() {
  const items: { marca: Marca; nombre: string; href: string; externo?: boolean }[] = [
    ...(WHATSAPP ? [{ marca: "whatsapp" as const, nombre: "Escribinos por WhatsApp", href: WHATSAPP, externo: true }] : []),
    // Un solo teléfono (Mateo: "dejá solo un teléfono"): el primero de 01-CONTEXT.md.
    { marca: "telefono", nombre: `Llamar al ${TELEFONOS[0].ver}`, href: `tel:${TELEFONOS[0].tel}` },
    { marca: "gmail", nombre: `Escribir a ${MAIL}`, href: `mailto:${MAIL}` },
    { marca: "instagram", nombre: `Instagram ${INSTAGRAM.ver}`, href: INSTAGRAM.url, externo: true },
  ];
  return (
    <ul className="pie-logos">
      {items.map((i) => (
        <li key={i.href} className="cie-mascara">
          <a
            className="pie-logo cie-linea"
            href={i.href}
            aria-label={i.nombre}
            title={i.nombre}
            {...(i.externo ? { target: "_blank", rel: "noopener" } : {})}
          >
            {/* El salto va en un envoltorio: GSAP deja un transform en línea en .cie-linea (la entrada) y le
                gana al :hover (G-055). */}
            <span className="pie-logo-cuerpo">
              <Logo marca={i.marca} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Pie() {
  const tarjeta = useRef<HTMLDivElement>(null);

  // Nada se ilumina con el mouse (Mateo: "sacale lo de que ilumine con el mouse"). La tarjeta se inclina
  // apenas siguiendo el mouse.
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const el = tarjeta.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    if (quieto()) {
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
      gsap.to(el, { rotationX: rx, rotationY: ry, transformPerspective: 1400, duration: 0.8, ease: "power3.out", overwrite: "auto" });
    }
  }
  function salir() {
    if (tarjeta.current) gsap.to(tarjeta.current, { rotationX: 0, rotationY: 0, duration: 1, ease: "power3.out" });
  }

  useGSAP(
    () => {
      const el = tarjeta.current;
      if (!el) return;
      const trazos = el.querySelectorAll(".pie-contorno text");
      if (!quieto()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      tl.fromTo(el, { y: 140 }, { y: 0, duration: 1.3, ease: "expo.out" }, 0);
      lineas(tl, el, ".cie-linea", 0.1);
      tl.fromTo(trazos, { strokeDasharray: 1600, strokeDashoffset: 1600 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0.3);
      // Cuando termina de dibujarse, el relleno tenue aparece.
      tl.fromTo(trazos, { fillOpacity: 0 }, { fillOpacity: 0.14, duration: 0.9, ease: "power2.out" }, 1.6);
    },
    { scope: tarjeta },
  );

  return (
    <div ref={tarjeta} className="pie" onPointerMove={mover} onPointerLeave={salir}>
      <div className="pie-cuerpo">
        <div className="pie-marca">
          <p className="pie-nombre">
            <L>Araucaria</L>
          </p>
          <p className="pie-sub">
            <L>multiespacio</L>
          </p>
          <p className="pie-frase">
            <L>Salón de eventos con patio, pileta y parrilla, en Candioti Norte.</L>
          </p>
        </div>

        <div className="pie-col pie-col-contacto">
          <p className="pie-cabeza">
            <L>Contacto</L>
          </p>
          <Filas />
        </div>

        <div className="pie-col">
          <p className="pie-cabeza">
            <L>Horarios</L>
          </p>
          <ul className="pie-lista">
            {HORARIOS.map((m) => (
              <li key={m.codigo}>
                <Dato marca="reloj">
                  {m.nombre} · {m.horario.replace(" hs", "")}
                </Dato>
              </li>
            ))}
            <li>
              <Dato marca="maps" href={COMO_LLEGAR} externo>
                Cómo llegar
              </Dato>
            </li>
          </ul>
        </div>

        <nav className="pie-col" aria-label="El salón">
          <p className="pie-cabeza">
            <L>El salón</L>
          </p>
          <ul className="pie-lista">
            {SALON_LINKS.map((l) => (
              <li key={l.href}>
                <L>
                  <a className="pie-link" href={l.href}>
                    {l.texto}
                    <svg className="pie-link-flecha" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4 12L12 4M6 4h6v6" />
                    </svg>
                  </a>
                </L>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="pie-base">
        <L>© Araucaria multiespacio · Güemes 3660, Santa Fe</L>
        <L>Barrio Candioti Norte</L>
      </div>

      <Contorno />
    </div>
  );
}

// ---------------------------------------------------------------- El cierre entero: el mapa y el pie

export function Cierre() {
  const raiz = useRef<HTMLDivElement>(null);
  useEntrada(raiz, (el) => {
    const seccion = el.querySelector(".cie-ubicacion")!;
    const a = gsap.timeline({ scrollTrigger: { trigger: seccion, start: "top 70%", once: true } });
    lineas(a, el, ".cie-ubicacion .cie-linea", 0);
    a.add(entradaDelMapa(seccion), 0.15);
  });
  return (
    <div ref={raiz} className="cie" id="ubicacion">
      <section className="cie-ubicacion" aria-labelledby="cie-titulo">
        <div className="cie-ubicacion-texto">
          <Direccion />
          <Acciones />
        </div>
        <Mapa className="cie-ubicacion-mapa" corrimiento={{ x: 300, y: -130 }} />
      </section>
      <footer className="pie-marco">
        <Pie />
      </footer>
    </div>
  );
}
