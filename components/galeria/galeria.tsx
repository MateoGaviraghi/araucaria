"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Visor } from "@/components/ui/visor";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { BAJADA, ESPACIOS, PIEZAS, TITULO } from "./contenido";
import { Tarjeta } from "./tarjeta";
import "./galeria.css";

// GALERÍA (bloque 3, docs/06-UI-UX.md §2). Un espacio por tarjeta, y adentro sus tomas como
// historias, una a la vez y a tamaño completo (historia.tsx, D-029). Dos composiciones con el mismo
// marcado, que acomoda la hoja:
//
// PILA, debajo de 1000 px (D-028). Tarjetas apiladas, la referencia de Olivier Larose que eligió
// Mateo: "quiero que sea con scroll animación, gsap, lo más fluido inmersivo y profesional posible".
// La pila es CSS puro (capas sticky de una pantalla); GSAP agrega, atado al scroll con 1 s de
// suavizado: la toma se aleja de 1,3× a 1× mientras sube la tarjeta; al llegar, el número, el
// nombre y la línea se abren desde su máscara (1,2 s, no atado); y mientras la tapan las
// siguientes se achica un 3 % y se oscurece un 14 % por cada una.
//
// FILA, desde 1000 px (D-030). Los cuatro espacios lado a lado, porque una toma vertical en una
// tarjeta apaisada dejaba la mayor parte vacía. Mateo: "no me gusta el de desktop que al ser en
// vertical haya tantos espacios no me cierra". Al llegar, las cuatro se abren desde abajo,
// escalonadas y atadas a la rueda, y los nombres se abren desde su máscara.
//
// UN SOLO VIDEO A LA VEZ (G-041). En la pila corre la tarjeta de arriba; en la fila, los espacios se
// pasan el turno de izquierda a derecha cada vez que termina una toma ("solos", Mateo), y el que
// tiene el mouse encima lo toma.

const APERTURA = 1.2; // s que tarda en abrirse un texto
const CURVA = "power3.out";
const DESFASE = 0.1; // s entre número, nombre y línea
const ESCONDIDO = 125; // % de su alto que baja un texto escondido: 110 dejaba 5 px del nombre
// a la vista dentro de la máscara, por el relleno que tiene abajo para los descendentes.
const SUAVIZADO = 1; // s que tarda la animación en alcanzar al scroll
const ACERCA = 1.3; // escala de la imagen cuando la tarjeta asoma abajo
const ACHIQUE = 0.03; // cuánto se achica una tarjeta por cada una que tiene encima
const VELO = 0.14; // cuánto se oscurece por cada una que tiene encima
const SUBE_FILA = 18; // % de su alto que suben las historias de la fila al llegar

const PILA = "(max-width: 999px)";
const FILA = "(min-width: 1000px)";
const QUIETO = "(prefers-reduced-motion: no-preference)";

function suscribirFila(avisar: () => void) {
  const mq = window.matchMedia(FILA);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}

// Dónde empieza cada espacio dentro de PIEZAS, que es la lista plana que recorre el visor.
const INICIOS = ESPACIOS.map((_, i) =>
  ESPACIOS.slice(0, i).reduce((n, e) => n + e.piezas.length, 0),
);

export function Galeria() {
  const raiz = useRef<HTMLElement>(null);
  const [activa, setActiva] = useState(0);
  const [abierta, setAbierta] = useState<number | null>(null);
  // Fila: el espacio que tiene el mouse encima se queda con el turno hasta que el mouse se va.
  const [fijo, setFijo] = useState<number | null>(null);
  // En el servidor se arma la pila; el cliente corrige al hidratar si la pantalla es ancha.
  const fila = useSyncExternalStore(suscribirFila, () => window.matchMedia(FILA).matches, () => false);

  const finToma = (i: number) => {
    if (fijo !== null) return;
    setActiva((a) => (a === i ? (i + 1) % ESPACIOS.length : a));
  };
  const encima = (i: number, dentro: boolean) => {
    if (dentro) {
      setFijo(i);
      setActiva(i);
    } else setFijo((f) => (f === i ? null : f));
  };

  useGSAP(
    () => {
      const capas = gsap.utils.toArray<HTMLElement>(".gal-capa");
      const tarjetas = capas.map((c) => c.querySelector<HTMLElement>(".gal-tarjeta"));
      const ultima = capas[capas.length - 1];

      // La barra de direcciones del celular cambia el alto al scrollear. Todo lo de la pila mide en
      // svh, que no se mueve con ella, así que no hace falta recalcular en cada cambio.
      ScrollTrigger.config({ ignoreMobileResize: true });

      const mm = gsap.matchMedia();

      // Pila: qué tarjeta está arriba, la que ya pasó el 60 % de la pantalla. También con
      // movimiento reducido, porque decide qué videos pueden correr (y ahí no corre ninguno igual).
      mm.add(PILA, () => {
        capas.forEach((capa, i) => {
          ScrollTrigger.create({
            trigger: capa,
            start: "top 60%",
            onEnter: () => setActiva(i),
            onLeaveBack: () => setActiva(Math.max(0, i - 1)),
          });
        });
      });

      // Los dos: el título de la sección. fromTo y no from, porque el guion de antes del pintado ya
      // dejó las líneas abajo (app/page.tsx) y un from tomaría esa posición como destino.
      mm.add(QUIETO, () => {
        gsap.fromTo(
          ".gal-intro .gal-linea",
          { yPercent: ESCONDIDO, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: APERTURA,
            ease: CURVA,
            stagger: 0.15,
            scrollTrigger: {
              trigger: ".gal-intro",
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      mm.add(`${PILA} and ${QUIETO}`, () => {
        capas.forEach((capa, i) => {
          const tarjeta = tarjetas[i];
          if (!tarjeta) return;

          // 1. Mientras sube: desde que su capa asoma abajo hasta que toca arriba.
          gsap
            .timeline({
              scrollTrigger: { trigger: capa, start: "top bottom", end: "top top", scrub: SUAVIZADO },
            })
            .fromTo(
              tarjeta.querySelectorAll(".gal-historia-lente"),
              { scale: ACERCA },
              { scale: 1, ease: "none" },
              0,
            );

          // 2. Al llegar: los textos se abren. Con la tarjeta al 40 % ya se la ve casi entera, así
          // que la apertura no pasa mientras todavía está entrando por abajo.
          gsap.fromTo(
            tarjeta.querySelectorAll(".gal-linea"),
            { yPercent: ESCONDIDO, y: 0 },
            {
              yPercent: 0,
              y: 0,
              duration: APERTURA,
              ease: CURVA,
              stagger: DESFASE,
              scrollTrigger: {
                trigger: capa,
                start: "top 40%",
                toggleActions: "play none none reverse",
              },
            },
          );

          // 3. La van tapando las siguientes: desde que asoma la próxima hasta que llega la última.
          // Cuantas más tiene encima, más se achica, y así se ve el canto de cada una detrás.
          const tapan = capas.length - 1 - i;
          const proxima = capas[i + 1];
          if (tapan > 0 && proxima) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: proxima,
                  start: "top bottom",
                  endTrigger: ultima,
                  end: "top top",
                  scrub: SUAVIZADO,
                },
              })
              .to(tarjeta, { scale: 1 - tapan * ACHIQUE, ease: "none" }, 0)
              .to(tarjeta.querySelector(".gal-tarjeta-velo"), { opacity: tapan * VELO, ease: "none" }, 0);
          }
        });
      });

      mm.add(`${FILA} and ${QUIETO}`, () => {
        const historias = gsap.utils.toArray<HTMLElement>(".gal-historia");
        // Las cuatro suben escalonadas y se abren desde abajo, atadas a la rueda. Terminan de llegar
        // cuando el borde de arriba de la fila pasa el 60 % de la pantalla: para cuando se la puede
        // leer ya están alineadas. Terminando al 35 %, quien frenaba a mitad veía las columnas a
        // distintas alturas, que es justo el desorden que Mateo rechazó (D-027).
        gsap
          .timeline({
            scrollTrigger: { trigger: ".gal-capas", start: "top 95%", end: "top 60%", scrub: SUAVIZADO },
          })
          .fromTo(
            historias,
            { yPercent: SUBE_FILA, clipPath: "inset(100% 0% 0% 0% round 8px)" },
            {
              yPercent: 0,
              clipPath: "inset(0% 0% 0% 0% round 8px)",
              ease: "none",
              stagger: 0.08,
            },
            0,
          )
          .fromTo(
            ".gal-historia-lente",
            { scale: ACERCA },
            { scale: 1, ease: "none", stagger: 0.08 },
            0,
          );

        // Los nombres van abajo de cada toma: se abren cuando el borde de abajo de la fila entra en
        // la pantalla, no antes, así la apertura se ve. (Con "bottom 92%" no se abrían nunca en la
        // posición de reposo a 1440 × 900: la fila termina en y=846 y el disparo pedía 828.)
        gsap.fromTo(
          ".gal-tarjeta .gal-linea",
          { yPercent: ESCONDIDO, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: APERTURA,
            ease: CURVA,
            stagger: 0.06,
            scrollTrigger: {
              trigger: ".gal-capas",
              start: "bottom bottom",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // La fuente del título llega después y cambia los altos: recalcular cuando esté.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="gal gal-pila" id="espacio" aria-labelledby="gal-titulo">
      <header className="gal-intro">
        <h2 id="gal-titulo" className="gal-mascara gal-titulo">
          <span className="gal-linea">{TITULO}</span>
        </h2>
        <p className="gal-mascara gal-bajada">
          <span className="gal-linea">{BAJADA}</span>
        </p>
      </header>

      <div className="gal-capas">
        {ESPACIOS.map((espacio, i) => (
          <div key={espacio.id} className="gal-capa">
            <Tarjeta
              espacio={espacio}
              indice={i}
              total={ESPACIOS.length}
              modo={fila ? "fila" : "pila"}
              activa={activa === i && abierta === null}
              onAbrir={(j) => setAbierta((INICIOS[i] ?? 0) + j)}
              onFinToma={() => finToma(i)}
              onEncima={(dentro) => encima(i, dentro)}
            />
          </div>
        ))}
        {/* La cola deja la pila completa en pantalla un rato antes de irse: sin ella, la última
            tarjeta se va en el mismo instante en que llega. En la fila no existe. */}
        <div className="gal-cola" aria-hidden="true" />
      </div>

      <Visor
        piezas={PIEZAS}
        abierta={abierta}
        onCerrar={() => setAbierta(null)}
        onIr={setAbierta}
      />
    </section>
  );
}
