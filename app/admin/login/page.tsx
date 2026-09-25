import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";
import { nowMs } from "@/lib/dates";
import { LoginEscena } from "./login-escena";
import { LoginForm, Marca } from "./login-form";
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

// D-044: el formulario va en el shell estático y se ve al instante, aunque la base esté dormida (su primer
// arranque tarda unos 3 s). Dos partes llegan transmitidas por separado, a la hora del pedido (D-021):
// la revisión de la sesión, que manda directo al panel si ya hay una abierta, y la hora del servidor
// para la trampa C-09. Pedir la sesión al abrir la página despierta la base mientras se escribe.
export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GUION_LOGIN }} />
      <LoginEscena>
        <Suspense fallback={null}>
          <Sesion searchParams={searchParams} />
        </Suspense>
        <LoginForm>
          <Suspense fallback={null}>
            <MarcaDeTiempo />
          </Suspense>
        </LoginForm>
      </LoginEscena>
    </>
  );
}

async function Sesion({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  if (await requireAdmin()) redirect("/admin");
  const { sesion } = await searchParams;
  if (sesion !== "terminada") return null;

  return (
    <p className="lg-aviso lg-aviso-info" role="status">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="10" cy="10" r="8.2" />
        <path d="M10 9v5" strokeLinecap="round" />
        <circle cx="10" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      Tu sesión terminó. Entrá de nuevo.
    </p>
  );
}

// Request time for the C-09 time trap: read when the request arrives, never at build time.
async function MarcaDeTiempo() {
  await connection();
  return <Marca valor={nowMs()} />;
}
