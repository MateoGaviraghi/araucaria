// Pure month logic shared by the owner panel and (WU-05) the public calendar. No React, no I/O.

import type { MODULE_CODES } from "@/lib/db/schema";
import { addDays, firstDayOfMonth, isoWeekday, monthOf, type IsoDate, type IsoMonth } from "@/lib/dates";

export type ModuleCode = (typeof MODULE_CODES)[number];
export type BlockChoice = ModuleCode | "dia-completo";

export const MODULE_ORDER: readonly ModuleCode[] = ["mediodia", "noche"];

// UI vocabulary of docs/06-UI-UX.md §5 ("Reservado", D-020), with the grammatical gender it needs.
export const MODULE_WORDS: Record<BlockChoice, { label: string; crossed: string; freed: string }> = {
  mediodia: { label: "Mediodía", crossed: "reservado", freed: "liberado" },
  noche: { label: "Noche", crossed: "reservada", freed: "liberada" },
  "dia-completo": { label: "Día completo", crossed: "reservado", freed: "liberado" },
};

export type Block = { id: string; date: IsoDate; module: ModuleCode };

/** What the public read returns: only date and module, never ids (08-SECURITY.md C-15). */
export type AvailabilityEntry = { date: IsoDate; module: ModuleCode };

/** Stands in for the id of a public block, which has none. */
export const TAKEN = "taken";

export type DayStatus = "outside-month" | "past" | "beyond-horizon" | "open";

export type DayCell = {
  date: IsoDate;
  day: number;
  status: DayStatus;
  /** Block id per crossed-out module, null when free. */
  modules: Record<ModuleCode, string | null>;
};

/** Weeks start on Monday, as es-AR does (Intl weekInfo firstDay = 1). */
export function buildMonth(
  month: IsoMonth,
  blocks: readonly (Block | AvailabilityEntry)[],
  today: IsoDate,
  lastBookable: IsoDate,
): DayCell[][] {
  const byDate = new Map<IsoDate, Record<ModuleCode, string | null>>();
  for (const block of blocks) {
    const modules = byDate.get(block.date) ?? { mediodia: null, noche: null };
    modules[block.module] = "id" in block ? block.id : TAKEN;
    byDate.set(block.date, modules);
  }

  const first = firstDayOfMonth(month);
  let cursor = addDays(first, 1 - isoWeekday(first));
  const weeks: DayCell[][] = [];

  do {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const status: DayStatus =
        monthOf(cursor) !== month ? "outside-month" : cursor < today ? "past" : cursor > lastBookable ? "beyond-horizon" : "open";
      week.push({
        date: cursor,
        day: Number(cursor.slice(8, 10)),
        status,
        modules: byDate.get(cursor) ?? { mediodia: null, noche: null },
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  } while (monthOf(cursor) === month);

  return weeks;
}

/** Choices still possible on a day: a module when it is free, "día completo" only when both are. */
export function availableChoices(cell: DayCell): BlockChoice[] {
  const free = MODULE_ORDER.filter((module) => cell.modules[module] === null);
  return free.length === MODULE_ORDER.length ? [...free, "dia-completo"] : free;
}

// ---- Public calendar (docs/06-UI-UX.md §3). "unknown" is what a visitor sees when the availability
// read failed: every date stays selectable and the page shows the notice (G-003 is about the opposite
// risk — showing a taken date as free — which only the owner's discipline prevents).

export type PublicDayState = "past" | "beyond-horizon" | "free" | "partial" | "full" | "unknown";

export function publicDayState(cell: DayCell, availabilityLoaded: boolean): PublicDayState {
  if (cell.status === "past") return "past";
  if (cell.status === "beyond-horizon") return "beyond-horizon";
  if (!availabilityLoaded) return "unknown";
  const taken = MODULE_ORDER.filter((module) => cell.modules[module] !== null).length;
  if (taken === 0) return "free";
  return taken === MODULE_ORDER.length ? "full" : "partial";
}

/** A visitor can pick the day unless it is past, beyond the horizon, or fully taken. */
export function isSelectableDay(state: PublicDayState): boolean {
  return state === "free" || state === "partial" || state === "unknown";
}

/** Modules a visitor can ask for: each free one, plus "día completo" only when both are free. */
export function enabledChoices(cell: DayCell, availabilityLoaded: boolean): BlockChoice[] {
  if (!availabilityLoaded) return [...MODULE_ORDER, "dia-completo"];
  return availableChoices(cell);
}
