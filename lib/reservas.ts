// Reservations as the owner panel shows them (D-046). Pure: no React, no I/O, safe in client code.

import { MODULE_ORDER, MODULE_WORDS, type BlockChoice, type Choice, type ModuleCode } from "@/components/calendar/month";
import { ventana, type Ajustes } from "@/lib/ajustes";
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
  notes: string | null;
  /** "Personalizado" hours in minutes from 00:00 of the date (D-050); null otherwise. */
  customFrom: number | null;
  customTo: number | null;
};

/**
 * One row per module, as the database returns it. A "personalizado" reservation that overlaps no
 * module comes as one row with no block (D-050).
 */
export type FilaReserva = {
  blockId: string | null;
  date: IsoDate;
  module: ModuleCode | null;
  reservationId: string | null;
  clientName: string | null;
  clientPhone: string | null;
  notes: string | null;
  customFrom: number | null;
  customTo: number | null;
};

export function agrupar(filas: readonly FilaReserva[]): Reserva[] {
  const porClave = new Map<string, Reserva>();
  for (const fila of filas) {
    const clave = fila.reservationId ?? `b:${fila.blockId}`;
    let reserva = porClave.get(clave);
    if (!reserva) {
      reserva = {
        clave,
        id: fila.reservationId,
        blockIds: [],
        date: fila.date,
        modules: [],
        clientName: fila.clientName,
        clientPhone: fila.clientPhone,
        notes: fila.notes,
        customFrom: fila.customFrom,
        customTo: fila.customTo,
      };
      porClave.set(clave, reserva);
    }
    if (fila.blockId) reserva.blockIds.push(fila.blockId);
    if (fila.module) reserva.modules.push(fila.module);
  }
  for (const reserva of porClave.values()) {
    reserva.modules.sort((a, b) => MODULE_ORDER.indexOf(a) - MODULE_ORDER.indexOf(b));
  }
  return [...porClave.values()];
}

const eleccionDeModulos = (modules: readonly ModuleCode[]): BlockChoice =>
  modules.length === MODULE_ORDER.length ? "dia-completo" : (modules[0] ?? "mediodia");

export const eleccionDe = (reserva: Reserva): Choice =>
  reserva.customFrom !== null ? "personalizado" : eleccionDeModulos(reserva.modules);

/** "10 a 18:30 h": a module's hours as the owner set them in the panel (D-053). */
export const horarioDe = (ajustes: Ajustes, choice: BlockChoice) => horarioDeHoras(ajustes[choice].desde, ajustes[choice].hasta);

// ---- "Personalizado" (D-050): hours agreed on WhatsApp, in minutes from 00:00 of the date.

export const PASO = 30;
/** Starts from 08:00 to 23:30; ends up to 06:00 of the next day (the database checks the same). */
export const DESDE_MIN = 480;
export const DESDE_MAX = 1410;
export const HASTA_MAX = 1800;

export const horarioValido = (desde: number, hasta: number) =>
  desde >= DESDE_MIN && desde <= DESDE_MAX && hasta > desde && hasta <= HASTA_MAX && desde % PASO === 0 && hasta % PASO === 0;

/**
 * The modules a "personalizado" overlaps, which the public calendar shows as taken ("auto", D-050),
 * with the modules' hours of the moment (D-053).
 */
export const modulosDeHorario = (desde: number, hasta: number, ajustes: Ajustes): ModuleCode[] =>
  MODULE_ORDER.filter((m) => desde < ventana(ajustes, m)[1] && hasta > ventana(ajustes, m)[0]);

/** 870 → "14:30", 1560 → "02:00" */
export const hora = (minutos: number) =>
  `${String(Math.floor(minutos / 60) % 24).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;

/** "14 a 21 h", "8:30 a 02 h" (hours after midnight keep their 0). */
function horaCorta(minutos: number) {
  const h = Math.floor(minutos / 60) % 24;
  const texto = minutos >= 1440 ? String(h).padStart(2, "0") : String(h);
  return minutos % 60 === 0 ? texto : `${texto}:${String(minutos % 60).padStart(2, "0")}`;
}
export const horarioDeHoras = (desde: number, hasta: number) => `${horaCorta(desde)} a ${horaCorta(hasta)} h`;

export const horarioTexto = (reserva: Reserva, ajustes: Ajustes) =>
  reserva.customFrom !== null && reserva.customTo !== null
    ? horarioDeHoras(reserva.customFrom, reserva.customTo)
    : horarioDe(ajustes, eleccionDeModulos(reserva.modules));

export const moduloTexto = (reserva: Reserva) => MODULE_WORDS[eleccionDe(reserva)].label;

export const nombreTexto = (reserva: Reserva) => reserva.clientName ?? "Sin datos del cliente";

const DIA_CORTO = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIA_LARGO = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** "Sáb 26/09" */
export const diaCorto = (date: IsoDate) => `${DIA_CORTO[isoWeekday(date)]} ${formatDayMonth(date)}`;

/** "sábado 26/09" */
export const diaLargo = (date: IsoDate) => `${DIA_LARGO[isoWeekday(date)]} ${formatDayMonth(date)}`;

/** "+54 342 123-4567" for reading; the stored value is "+543421234567". */
export function telefonoTexto(phone: string): string {
  const d = phone.replace(/^\+54/, "");
  return `+54 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** WhatsApp chat with the client (the number without "+"). */
export const whatsapp = (phone: string) => `https://wa.me/${phone.replace(/^\+/, "")}`;

export const diasEntre = (desde: IsoDate, hasta: IsoDate) =>
  Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000);

export const cuandoTexto = (n: number) => (n === 0 ? "hoy" : n === 1 ? "mañana" : `en ${n} días`);

/** A saved reservation as the panel's actions take it, to restore it ("Deshacer") or to edit it. */
export const entradaDe = (reserva: Reserva) => ({
  date: reserva.date,
  choice: eleccionDe(reserva),
  customFrom: reserva.customFrom,
  customTo: reserva.customTo,
  clientName: reserva.clientName ?? "",
  clientPhone: reserva.clientPhone?.replace(/^\+54/, "") ?? "",
  notes: reserva.notes ?? "",
});
