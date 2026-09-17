import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";
import { nowMs } from "@/lib/dates";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Cache Components (D-021): the cookie check and the query string are read at request time, so the
// form only renders once the session has been checked — an open session goes straight to the panel.
export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main>
      <h1>Panel de Araucaria</h1>
      <Suspense fallback={null}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginContent({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  if (await requireAdmin()) redirect("/admin");
  const { sesion } = await searchParams;

  return (
    <>
      {sesion === "terminada" && <p role="status">Tu sesión terminó. Entrá de nuevo.</p>}
      {/* Request time for the C-09 time trap: it must survive the form reset React does after a
          failed attempt, so it is a prop and not a value written into the DOM (D-021). */}
      <LoginForm renderedAt={nowMs()} />
    </>
  );
}
