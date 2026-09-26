import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Inicio } from "@/components/admin/secciones";
import { getReservationsForMonth, getUpcomingReservations, requireAdmin } from "@/lib/dal";
import { monthOf, todayInBuenosAires } from "@/lib/dates";
import { Esqueleto } from "./esqueleto";

export const metadata = { title: "Inicio" };

export default function InicioPage() {
  return (
    <Suspense fallback={<Esqueleto tarjetas={3} />}>
      <InicioDatos />
    </Suspense>
  );
}

async function InicioDatos() {
  if (!(await requireAdmin())) redirect("/admin/login?sesion=terminada");
  const today = todayInBuenosAires();
  const [proximas, delMes] = await Promise.all([getUpcomingReservations(today), getReservationsForMonth(monthOf(today))]);
  return <Inicio today={today} proximas={proximas} delMes={delMes} />;
}
