import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await requireAdmin()) redirect("/admin");
  const { sesion } = await searchParams;

  return (
    <main>
      <h1>Panel de Araucaria</h1>
      {sesion === "terminada" && <p role="status">Tu sesión terminó. Entrá de nuevo.</p>}
      <LoginForm />
    </main>
  );
}
