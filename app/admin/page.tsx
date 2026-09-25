import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { AdminCalendar } from "@/components/calendar/admin-calendar";
import { getBlocksForMonth, getUpcomingBlocks, requireAdmin } from "@/lib/dal";
import { isValidIsoMonth, lastBookableDate, monthOf, todayInBuenosAires } from "@/lib/dates";
import "@/components/ui/boton.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Cache Components (D-021): the session and the month data are read at request time, so they live
// inside <Suspense>; the bar and the skeleton around them are part of the prerendered page (D-045).
export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="pn">
      <header className="pn-barra">
        <h1 className="pn-marca">
          <span className="pn-marca-nombre">Araucaria</span>
          <span className="pn-marca-panel">Panel</span>
        </h1>
        <nav className="pn-barra-acciones" aria-label="Cuenta">
          <a className="pn-accion" href="/" target="_blank" rel="noopener">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M8 4H4.5v11.5H16V12M11 4h5v5M16 4l-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="pn-accion-texto">Ver el sitio</span>
          </a>
          {/* C-10: a visible "Cerrar sesión". */}
          <form action={logout}>
            <button type="submit" className="pn-accion pn-accion-salir">
              Cerrar sesión
            </button>
          </form>
        </nav>
      </header>
      <div className="pn-cuerpo">
        <Suspense fallback={<Esqueleto />}>
          <Calendar searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

// The same places as the real panel, still: nothing blinks while the data arrives.
function Esqueleto() {
  return (
    <div aria-busy="true" aria-label="Cargando el calendario">
      <div className="pn-esq pn-esq-intro" />
      <div className="pn-resumen">
        <div className="pn-esq pn-esq-tarjeta" />
        <div className="pn-esq pn-esq-tarjeta" />
        <div className="pn-esq pn-esq-tarjeta" />
      </div>
      <div className="pn-esq pn-esq-cal" />
    </div>
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
