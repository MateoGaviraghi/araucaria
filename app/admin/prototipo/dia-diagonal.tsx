import type { DayCell } from "@/components/calendar/month";

// Variant 2 · Diagonal (Bookingmood): top-left triangle = Mediodía, bottom-right triangle = Noche.
export function DiaDiagonal({ cell }: { cell: DayCell }) {
  const both = cell.modules.mediodia !== null && cell.modules.noche !== null;
  return (
    <>
      {/* Full layer under the triangles: without it a day with both modules shows an antialiased seam. */}
      <span className="proto-fill absolute inset-0" data-taken={both ? "" : undefined} />
      <span
        className="proto-fill absolute inset-0 [clip-path:polygon(0_0,100%_0,0_100%)]"
        data-taken={cell.modules.mediodia ? "" : undefined}
      />
      <span
        className="proto-fill absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        data-taken={cell.modules.noche ? "" : undefined}
      />
      <span className="proto-number left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{cell.day}</span>
    </>
  );
}

export const DIAGONAL_HINT = "Arriba a la izquierda mediodía · abajo a la derecha noche";
