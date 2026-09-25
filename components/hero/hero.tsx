import { BAJADA, CTA, RECORRIDO, TITULO } from "./contenido";
import { EntradaTexto } from "./entrada-texto";
import { MediaHero } from "./media-hero";

// HERO de la landing (docs/06-UI-UX.md §2, bloque 2). Elegido por Mateo el 2026-09-21 en la ronda
// de seccion-premium: el titular queda quieto y detrás van cambiando las tomas (referencia SHA),
// con la apertura de Lanserhof. El botón es provisorio hasta su propia ronda de referencias.
export function Hero() {
  return (
    <section className="hero" id="inicio">
      <MediaHero tomas={RECORRIDO} rotar />
      <EntradaTexto className="hero-cuerpo">
        <h1 className="hero-titulo">
          {TITULO.antes}
          <em>{TITULO.destacado}</em>
        </h1>
        <p className="hero-bajada">{BAJADA}</p>
        <div>
          <a className="boton boton-en-oscuro" href="#disponibilidad">
            {CTA}
          </a>
        </div>
      </EntradaTexto>
    </section>
  );
}
