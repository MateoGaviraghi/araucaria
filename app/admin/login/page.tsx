import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";
import { nowMs } from "@/lib/dates";
import { LoginEscena } from "./login-escena";
import { LoginForm } from "./login-form";
import "./login.css";

export const metadata: Metadata = {
  title: "Panel de Araucaria",
  robots: { index: false, follow: false },
};

// Deja la entrada CERRADA antes del primer pintado (mismo método que components/hero/hero-apertura.tsx):
// el telón tapando la foto y los textos abajo. Se quita sola a los 3 s, así un JavaScript que nunca
// corre no deja nada escondido. Con movimiento reducido no hace nada y la pantalla nace completa.
const GUION_LOGIN = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=document.createElement('style');
s.textContent='.lg-telon{transform:none}.lg-sube{transform:translateY(110%)}.lg-bajada,.lg-campo,.lg-accion{opacity:0}.lg-base{transform:scaleX(0)}';
document.head.appendChild(s);
setTimeout(function(){s.remove();},3000);
}catch(e){}})();`;

// Cache Components (D-021): the cookie check and the query string are read at request time, so the
// form only renders once the session has been checked — an open session goes straight to the panel.
export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GUION_LOGIN }} />
      <LoginEscena>
        <Suspense fallback={null}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </LoginEscena>
    </>
  );
}

async function LoginContent({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  if (await requireAdmin()) redirect("/admin");
  const { sesion } = await searchParams;

  return (
    <>
      {sesion === "terminada" && (
        <p className="lg-aviso lg-aviso-info" role="status">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="10" cy="10" r="8.2" />
            <path d="M10 9v5" strokeLinecap="round" />
            <circle cx="10" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          Tu sesión terminó. Entrá de nuevo.
        </p>
      )}
      {/* Request time for the C-09 time trap: it must survive the form reset React does after a
          failed attempt, so it is a prop and not a value written into the DOM (D-021). */}
      <LoginForm renderedAt={nowMs()} />
    </>
  );
}
