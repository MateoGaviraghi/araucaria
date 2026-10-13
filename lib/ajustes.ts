// The hours and prices of the three modules, which the owner edits in the panel (D-053). Pure: no
// React, no I/O, safe in client code. The database row is the source; AJUSTES_INICIALES is only the
// fallback when it cannot be read, with the values of docs/01-CONTEXT.md (the client, 2026-10-13).

import type { BlockChoice, ModuleCode } from "@/components/calendar/month";

/** Minutes from 00:00 of the date; past 1440 is the next day. `precio` in whole pesos. */
export type AjusteModulo = { desde: number; hasta: number; precio: number };
export type Ajustes = Record<BlockChoice, AjusteModulo>;

export const CODIGOS_AJUSTE: readonly BlockChoice[] = ["mediodia", "noche", "dia-completo"];

export const AJUSTES_INICIALES: Ajustes = {
  mediodia: { desde: 600, hasta: 1110, precio: 260_000 },
  noche: { desde: 1200, hasta: 1560, precio: 260_000 },
  "dia-completo": { desde: 600, hasta: 1560, precio: 500_000 },
};

export const PRECIO_MAX = 99_999_999;

/** Where a module sits, for what a "personalizado" overlaps (D-050). */
export const ventana = (ajustes: Ajustes, modulo: ModuleCode): readonly [number, number] => [
  ajustes[modulo].desde,
  ajustes[modulo].hasta,
];

/** "$260.000" */
export const precioTexto = (pesos: number) => `$${new Intl.NumberFormat("es-AR").format(pesos)}`;
