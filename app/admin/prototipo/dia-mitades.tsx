import type { DayCell } from "@/components/calendar/month";

// Variant 1 · Mitades: top half = Mediodía, bottom half = Noche (the day read top to bottom, like the hours).
export function DiaMitades({ cell }: { cell: DayCell }) {
  return (
    <>
      <span className="proto-fill absolute inset-x-0 top-0 h-1/2" data-taken={cell.modules.mediodia ? "" : undefined} />
      <span className="proto-fill absolute inset-x-0 bottom-0 h-1/2" data-taken={cell.modules.noche ? "" : undefined} />
      <span className="absolute inset-x-1 top-1/2 h-px bg-[var(--proto-paper)]" aria-hidden="true" />
      <span className="proto-number left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{cell.day}</span>
    </>
  );
}

export const MITADES_HINT = "Arriba mediodía · abajo noche";
