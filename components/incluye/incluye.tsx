"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import "./incluye.css";

// LO QUE INCLUYE EL ALQUILER (bloque 4, D-036 y D-037): una franja corta después de los cuatro espacios de
// la galería. Mateo: "quiero algo más sencillo, que sea fácil de ver, fácil de entender, pero profesional,
// serio y prolijo, y que siga con la estética de esto"; de la segunda ronda eligió "B · Columnas", con
// "viñetas, algo más prolijo y lindo, siempre respetando el GSAP".
//
// Todo a la vista, sin mouse ni toques: la bajada con la capacidad y la limpieza, y cuatro grupos
// numerados del 01 al 04, como las cuatro tarjetas de la galería que quedan justo arriba.
//
// Todos los datos salen de docs/01-CONTEXT.md §Amenities y §Modules and prices ("El valor final incluye
// la limpieza del lugar"). Nada más.

const GRUPOS = [
  { numero: "01", nombre: "El salón", items: ["Salón de usos múltiples", "Baño", "Espacio de lavado con pileta"] },
  { numero: "02", nombre: "El patio", items: ["Patio exterior con pileta", "8 sillones y livings de exterior"] },
  { numero: "03", nombre: "La parrilla", items: ["Asador", "Horno pizzero grande"] },
  { numero: "04", nombre: "Para la mesa", items: ["30 sillas", "3 mesas plegables", "Vajilla y vasos para 30"] },
];

const CURVA = "power3.out";
const quieto = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

function L({ children }: { children: React.ReactNode }) {
  return (
    <span className="inc-mascara">
      <span className="inc-linea">{children}</span>
    </span>
  );
}

/** Un filete fino que se dibuja en la entrada. */
const Hilo = () => <span className="inc-hilo" aria-hidden="true" />;

export function Incluye() {
  const raiz = useRef<HTMLElement>(null);

  // La entrada, una sola vez, cuando la franja llega al 75 % de la pantalla: los filetes se dibujan de
  // izquierda a derecha (0,9 s), los textos suben desde su máscara renglón por renglón y cada viñeta
  // aparece con un rebote chico (0,5 s) justo antes que su renglón. Después nada se mueve: es para leer.
  // Todo espera escondido antes del primer pintado (GUION_INCLUYE en app/page.tsx).
  useGSAP(
    () => {
      const el = raiz.current;
      if (!el || !quieto()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      tl.fromTo(
        gsap.utils.toArray<HTMLElement>(".inc-hilo", el),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "power3.inOut", stagger: 0.06 },
        0,
      );
      // `y: 0` en los dos extremos (G-047): GSAP lee el translateY(120%) del guion previo al pintado como
      // píxeles fijos (y: 22px) y, sin ponerlos en cero, el texto terminaba corrido y tapado por su máscara.
      tl.fromTo(
        gsap.utils.toArray<HTMLElement>(".inc-linea", el),
        { y: 0, yPercent: 120 },
        { y: 0, yPercent: 0, duration: 0.9, ease: CURVA, stagger: 0.045 },
        0.1,
      );
      tl.fromTo(
        gsap.utils.toArray<HTMLElement>(".inc-vineta", el),
        { scale: 0 },
        { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.07 },
        0.45,
      );
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="inc" id="incluye" aria-labelledby="inc-titulo">
      <div className="inc-cabeza">
        <h2 className="inc-titulo" id="inc-titulo">
          <L>Lo que incluye el alquiler</L>
        </h2>
        <p className="inc-bajada">
          <L>Para hasta 35 personas.</L>
          <L>La limpieza del lugar está incluida.</L>
        </p>
      </div>
      <ul className="inc-columnas">
        {GRUPOS.map((g) => (
          <li key={g.numero} className="inc-columna">
            <Hilo />
            <span className="inc-columna-numero">
              <L>{g.numero}</L>
            </span>
            <h3 className="inc-columna-nombre">
              <L>{g.nombre}</L>
            </h3>
            <ul className="inc-columna-items">
              {g.items.map((it) => (
                <li key={it}>
                  <span className="inc-vineta" aria-hidden="true" />
                  <L>{it}</L>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
