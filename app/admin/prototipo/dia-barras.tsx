import type { DayCell } from "@/components/calendar/month";

// Variant 3 · Barras: a clean number on top and two thick bars below, left = Mediodía, right = Noche.
export function DiaBarras({ cell }: { cell: DayCell }) {
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--proto-paper)] shadow-[inset_0_0_0_1px_var(--proto-free-line)]">
      <span className="text-base font-semibold tabular-nums">{cell.day}</span>
      <span className="flex w-[70%] gap-1" aria-hidden="true">
        <span
          className="proto-fill h-2 flex-1 rounded-full shadow-[inset_0_0_0_1px_var(--proto-free-line)]"
          data-taken={cell.modules.mediodia ? "" : undefined}
        />
        <span
          className="proto-fill h-2 flex-1 rounded-full shadow-[inset_0_0_0_1px_var(--proto-free-line)]"
          data-taken={cell.modules.noche ? "" : undefined}
        />
      </span>
    </span>
  );
}

export const BARRAS_HINT = "Barra izquierda mediodía · derecha noche";
