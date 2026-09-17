import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { AdminCalendar } from "@/components/calendar/admin-calendar";
import { getBlocksForMonth, requireAdmin } from "@/lib/dal";
import { isValidIsoMonth, lastBookableDate, monthOf, todayInBuenosAires } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Functional panel; the visual design is a seccion-premium round (D-018).
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login?sesion=terminada");

  const today = todayInBuenosAires();
  const lastBookable = lastBookableDate(today);
  const firstMonth = monthOf(today);
  const lastMonth = monthOf(lastBookable);

  // The panel shows the bookable range only: current month to 12 months ahead (D-018).
  const { mes } = await searchParams;
  const requested = typeof mes === "string" && isValidIsoMonth(mes) ? mes : firstMonth;
  const month = requested < firstMonth ? firstMonth : requested > lastMonth ? lastMonth : requested;

  const blocks = await getBlocksForMonth(month);

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Panel de Araucaria</h1>
        <form action={logout}>
          <button type="submit" className="min-h-11 rounded-md border px-4">
            Cerrar sesión
          </button>
        </form>
      </header>
      <AdminCalendar
        month={month}
        blocks={blocks}
        today={today}
        lastBookable={lastBookable}
        firstMonth={firstMonth}
        lastMonth={lastMonth}
      />
    </main>
  );
}
