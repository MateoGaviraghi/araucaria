import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Functional shell only; the month calendar and the visual design arrive in WU-04.
export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login?sesion=terminada");

  return (
    <main>
      <header>
        <h1>Panel de Araucaria</h1>
        <form action={logout}>
          <button type="submit">Cerrar sesión</button>
        </form>
      </header>
    </main>
  );
}
