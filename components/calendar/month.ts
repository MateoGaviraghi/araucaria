// Pure month logic shared by the owner panel and (WU-05) the public calendar. No React, no I/O.

import type { MODULE_CODES } from "@/lib/db/schema";
import { addDays, firstDayOfMonth, isoWeekday, monthOf, type IsoDate, type IsoMonth } from "@/lib/dates";

export type ModuleCode = (typeof MODULE_CODES)[number];
export type BlockChoice = ModuleCode | "dia-completo";

export const MODULE_ORDER: readonly ModuleCode[] = ["mediodia", "noche"];

// UI vocabulary of docs/06-UI-UX.md §5, with the grammatical gender its messages need.
export const MODULE_WORDS: Record<BlockChoice, { label: string; crossed: string; freed: string }> = {
  mediodia: { label: "Mediodía", crossed: "tachado", freed: "liberado" },
  noche: { label: "Noche", crossed: "tachada", freed: "liberada" },
  "dia-completo": { label: "Día completo", crossed: "tachado", freed: "liberado" },
};

export type Block = { id: string; date: IsoDate; module: ModuleCode };

export type DayStatus = "outside-month" | "past" | "beyond-horizon" | "open";

export type DayCell = {
  date: IsoDate;
  day: number;
  status: DayStatus;
  /** Block id per crossed-out module, null when free. */
  modules: Record<ModuleCode, string | null>;
};

/** Weeks start on Monday, as es-AR does (Intl weekInfo firstDay = 1). */
export function buildMonth(month: IsoMonth, blocks: readonly Block[], today: IsoDate, lastBookable: IsoDate): DayCell[][] {
  const byDate = new Map<IsoDate, Record<ModuleCode, string | null>>();
  for (const block of blocks) {
    const modules = byDate.get(block.date) ?? { mediodia: null, noche: null };
    modules[block.module] = block.id;
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
