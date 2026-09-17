import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { AdminCalendar } from "@/components/calendar/admin-calendar";
import { getBlocksForMonth, getUpcomingBlocks, requireAdmin } from "@/lib/dal";
import { isValidIsoMonth, lastBookableDate, monthOf, todayInBuenosAires } from "@/lib/dates";
import "./admin.css";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Cache Components (D-021): the session and the month data are read at request time, so they live
// inside <Suspense>; the shell around them is part of the prerendered page.
export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="admin-shell">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:px-10 lg:pt-10">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">Panel de Araucaria</h1>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-11 rounded-full px-4 text-sm shadow-[inset_0_0_0_1px_var(--admin-free-line)]"
            >
              Cerrar sesión
            </button>
          </form>
        </header>
        <Suspense fallback={<p className="mt-10 text-[var(--admin-muted)]">Cargando el calendario…</p>}>
          <Calendar searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Calendar({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
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

  const [blocks, upcoming] = await Promise.all([getBlocksForMonth(month), getUpcomingBlocks(today)]);

  return (
    <AdminCalendar
      month={month}
      blocks={blocks}
      upcoming={upcoming}
      today={today}
      lastBookable={lastBookable}
      firstMonth={firstMonth}
      lastMonth={lastMonth}
    />
  );
}
