import { connection } from "next/server";
import { getAvailability } from "@/lib/dal";
import { lastBookableDate, todayInBuenosAires } from "@/lib/dates";
import { Calendario } from "./calendario";
import "./calendario.css";

// El lado del servidor del calendario. "Hoy" se calcula en Buenos Aires en cada pedido (la regla
// de medianoche, docs/03-ARCHITECTURE.md), y la lectura de la base está en caché con la etiqueta
// `availability` (D-021): el panel la invalida cada vez que se reserva o se libera algo.
// Va dentro de <Suspense> en app/page.tsx: el resto de la página sale prearmado.

export async function Disponibilidad() {
  await connection();
  const today = todayInBuenosAires();
  const entradas = await getAvailability(today);
  return <Calendario today={today} lastBookable={lastBookableDate(today)} entradas={entradas} />;
}

/** Mientras llega la disponibilidad: el mismo lugar y el mismo fondo, para que nada salte. */
export function DisponibilidadEsperando() {
  return <section id="disponibilidad" className="cal" aria-busy="true" aria-label="Disponibilidad" />;
}
