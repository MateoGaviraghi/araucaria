import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Calendario } from "@/components/admin/secciones";
import { getReservationsForMonth, requireAdmin } from "@/lib/dal";
import { isValidIsoMonth, lastBookableDate, monthOf, todayInBuenosAires } from "@/lib/dates";
import { Esqueleto } from "../esqueleto";

export const metadata = { title: "Calendario" };

export default function CalendarioPage({ searchParams }: PageProps<"/admin/calendario">) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <CalendarioDatos searchParams={searchParams} />
    </Suspense>
  );
}

async function CalendarioDatos({ searchParams }: { searchParams: PageProps<"/admin/calendario">["searchParams"] }) {
  if (!(await requireAdmin())) redirect("/admin/login?sesion=terminada");
  const today = todayInBuenosAires();
  const lastBookable = lastBookableDate(today);
  const firstMonth = monthOf(today);
  const lastMonth = monthOf(lastBookable);

  // The bookable range only: current month to 12 months ahead (D-018).
  const { mes } = await searchParams;
  const requested = typeof mes === "string" && isValidIsoMonth(mes) ? mes : firstMonth;
  const month = requested < firstMonth ? firstMonth : requested > lastMonth ? lastMonth : requested;

  const reservas = await getReservationsForMonth(month);
  return (
    <Calendario
      month={month}
      reservas={reservas}
      today={today}
      lastBookable={lastBookable}
      firstMonth={firstMonth}
      lastMonth={lastMonth}
    />
  );
}
