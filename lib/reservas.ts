// Reservations as the owner panel shows them (D-046). Pure: no React, no I/O, safe in client code.

import { MODULE_ORDER, MODULE_WORDS, type BlockChoice, type ModuleCode } from "@/components/calendar/month";
import { formatDayMonth, isoWeekday, type IsoDate } from "@/lib/dates";

export type Reserva = {
  /** Stable key: the reservation id, or "b:" + block id for modules loaded before D-046. */
  clave: string;
  /** null for modules loaded before D-046, which have no client data. */
  id: string | null;
  blockIds: string[];
  date: IsoDate;
  modules: ModuleCode[];
  clientName: string | null;
  clientPhone: string | null;
};

/** One row per module, as the database returns it. */
export type FilaReserva = {
  blockId: string;
  date: IsoDate;
  module: ModuleCode;
  reservationId: string | null;
  clientName: string | null;
  clientPhone: string | null;
};

export function agrupar(filas: readonly FilaReserva[]): Reserva[] {
  const porClave = new Map<string, Reserva>();
  for (const fila of filas) {
    const clave = fila.reservationId ?? `b:${fila.blockId}`;
    const actual = porClave.get(clave);
    if (actual) {
      actual.blockIds.push(fila.blockId);
      actual.modules.push(fila.module);
      continue;
    }
    porClave.set(clave, {
      clave,
      id: fila.reservationId,
      blockIds: [fila.blockId],
      date: fila.date,
      modules: [fila.module],
      clientName: fila.clientName,
      clientPhone: fila.clientPhone,
    });
  }
  for (const reserva of porClave.values()) {
    reserva.modules.sort((a, b) => MODULE_ORDER.indexOf(a) - MODULE_ORDER.indexOf(b));
  }
  return [...porClave.values()];
}

export const eleccionDe = (modules: readonly ModuleCode[]): BlockChoice =>
  modules.length === MODULE_ORDER.length ? "dia-completo" : (modules[0] ?? "mediodia");

// docs/01-CONTEXT.md, modules and prices.
export const HORARIO: Record<BlockChoice, string> = {
  mediodia: "10 a 17 h",
  noche: "19 a 02 h",
  "dia-completo": "10 a 02 h",
};

export const moduloTexto = (modules: readonly ModuleCode[]) => MODULE_WORDS[eleccionDe(modules)].label;

export const nombreTexto = (reserva: Reserva) => reserva.clientName ?? "Sin datos del cliente";

const DIA_CORTO = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIA_LARGO = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** "Sáb 26/09" */
export const diaCorto = (date: IsoDate) => `${DIA_CORTO[isoWeekday(date)]} ${formatDayMonth(date)}`;

/** "sábado 26/09" */
export const diaLargo = (date: IsoDate) => `${DIA_LARGO[isoWeekday(date)]} ${formatDayMonth(date)}`;

/** "+54 342 516-2081" for reading; the stored value is "+543425162081". */
export function telefonoTexto(phone: string): string {
  const d = phone.replace(/^\+54/, "");
  return `+54 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** WhatsApp chat with the client (the number without "+"). */
export const whatsapp = (phone: string) => `https://wa.me/${phone.replace(/^\+/, "")}`;

export const diasEntre = (desde: IsoDate, hasta: IsoDate) =>
  Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000);

export const cuandoTexto = (n: number) => (n === 0 ? "hoy" : n === 1 ? "mañana" : `en ${n} días`);
