import { formatLongDate, formatMonthTitle, type IsoDate, type IsoMonth } from "@/lib/dates";

// Lo que comparten las piezas del calendario público: el ritmo del movimiento y dos formas de
// partir las fechas para escribirlas en grande.

export const QUIETO = "(prefers-reduced-motion: no-preference)";
export const CURVA = "power3.out";
export const ABRE = 0.9; // s que tarda en abrirse una línea o un número
export const ENTRE_LINEAS = 0.07;
export const ESCONDIDO = 110; // % que baja lo escondido dentro de su máscara

export const quieto = () => window.matchMedia(QUIETO).matches;

/** "Octubre de 2026" → { nombre: "Octubre", anio: "2026" } */
export function partesDelMes(mes: IsoMonth) {
  const [nombre, anio] = formatMonthTitle(mes).split(" de ");
  return { nombre, anio };
}

/** "sábado 18 de octubre de 2026" → sábado · 18 · octubre de 2026 */
export function partesDelDia(fecha: IsoDate) {
  const m = formatLongDate(fecha).match(/^(\S+) (\d+) de (.+)$/);
  return m ? { semana: m[1], numero: m[2], resto: m[3] } : { semana: "", numero: fecha.slice(8), resto: "" };
}

/** El texto vive en .cal-linea y la máscara lo recorta: se abre desde abajo, como en la galería. */
export function Mascara({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`cal-mascara ${className}`}>
      <span className="cal-linea">{children}</span>
    </span>
  );
}
