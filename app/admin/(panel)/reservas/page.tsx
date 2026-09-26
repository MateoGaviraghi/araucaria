import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Reservas } from "@/components/admin/secciones";
import { getPastReservations, getUpcomingReservations, requireAdmin } from "@/lib/dal";
import { todayInBuenosAires } from "@/lib/dates";
import { Esqueleto } from "../esqueleto";

export const metadata = { title: "Reservas" };

export default function ReservasPage() {
  return (
    <Suspense fallback={<Esqueleto />}>
      <ReservasDatos />
    </Suspense>
  );
}

async function ReservasDatos() {
  if (!(await requireAdmin())) redirect("/admin/login?sesion=terminada");
  const today = todayInBuenosAires();
  const [proximas, pasadas] = await Promise.all([getUpcomingReservations(today), getPastReservations(today)]);
  return <Reservas proximas={proximas} pasadas={pasadas} />;
}
