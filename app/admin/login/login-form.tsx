"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { login } from "@/app/login-action";
import type { ActionResult, ErrorCode } from "@/lib/action-result";
import { gsap, useGSAP } from "@/lib/gsap";
import { conMovimiento, desdeElInicio } from "./login-escena";

// docs/06-UI-UX.md §5. The login never says more than "wrong password".
const MESSAGES: Partial<Record<ErrorCode, string>> = {
  INVALID_CREDENTIALS: "Contraseña incorrecta.",
  INVALID_INPUT: "Contraseña incorrecta.",
  RATE_LIMITED: "Demasiados intentos. Probá de nuevo más tarde.",
};

// D-043: el campo es el de la consulta pública (subrayado, la etiqueta sube) y el botón es el del sitio.
// Con un error el campo tiembla una vez y el aviso lleva su dibujo: se ve de reojo, no solo por el color.
export function LoginForm({ renderedAt }: { renderedAt: number }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(login, null);
  const message = state && !state.ok ? (MESSAGES[state.code] ?? "Algo falló. Reintentá.") : null;
  // "Tiene algo escrito desde la última respuesta": React vacía el campo con cada respuesta sin avisar
  // al onChange, así que lo escrito se ata a esa respuesta y deja de valer cuando llega otra.
  const [escritoEn, setEscritoEn] = useState<ActionResult | null | undefined>(undefined);
  const lleno = escritoEn === state;
  const [ver, setVer] = useState(false);
  const raiz = useRef<HTMLFormElement>(null);
  const campo = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const aviso = useRef<HTMLParagraphElement>(null);

  // La parte del formulario en la entrada, en el mismo reloj que la escena.
  useGSAP(
    () => {
      const pasado = desdeElInicio();
      if (!conMovimiento()) return;
      const q = gsap.utils.selector(raiz);
      const desde = (t: number) => Math.max(0, t - pasado);
      gsap.fromTo(q(".lg-campo"), { opacity: 0 }, { opacity: 1, duration: 0.7, delay: desde(0.85), ease: "power2.out" });
      gsap.fromTo(q(".lg-base"), { scaleX: 0 }, { scaleX: 1, duration: 1, delay: desde(0.85), ease: "expo.out" });
      gsap.fromTo(q(".lg-accion"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, delay: desde(1), ease: "power3.out" });
    },
    { scope: raiz },
  );

  // Cada respuesta del servidor: React ya vació el campo y el cursor vuelve a él para reintentar.
  // Con error, el temblor y el aviso.
  useEffect(() => {
    if (!state || state.ok) return;
    entrada.current?.focus();
    if (!conMovimiento()) return;
    gsap.fromTo(
      campo.current,
      { x: 0 },
      { keyframes: { x: [0, -9, 8, -6, 4, -2, 0] }, duration: 0.45, ease: "power1.out" },
    );
    gsap.fromTo(aviso.current, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" });
  }, [state]);

  return (
    <form ref={raiz} className="lg-form" action={formAction}>
      <div
        ref={campo}
        className="lg-campo"
        data-lleno={lleno ? "" : undefined}
        data-error={message ? "" : undefined}
      >
        <label className="lg-etiqueta" htmlFor="password">
          Contraseña
        </label>
        <input
          ref={entrada}
          className="lg-input"
          id="password"
          name="password"
          type={ver ? "text" : "password"}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          maxLength={200}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? "login-error" : undefined}
          onChange={(e) => setEscritoEn(e.currentTarget.value.length > 0 ? state : undefined)}
        />
        <span className="lg-base" aria-hidden="true" />
        <span className="lg-foco" aria-hidden="true" />
        <button
          className="lg-ver"
          type="button"
          aria-controls="password"
          aria-pressed={ver}
          onClick={() => {
            setVer((v) => !v);
            entrada.current?.focus();
          }}
        >
          {ver ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {/* Honeypot (C-09): off-screen and hidden from assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px]">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {/* Controlled on purpose: React resets the form after each submit and would wipe a value set on the DOM. */}
      <input type="hidden" name="renderedAt" value={renderedAt} readOnly />

      {message && (
        <p ref={aviso} id="login-error" className="lg-aviso lg-aviso-error" role="alert">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="10" cy="10" r="8.2" />
            <path d="M10 5.6v5.4" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          {message}
        </p>
      )}

      <div className="lg-accion">
        <button className="boton boton-en-oscuro" type="submit" disabled={pending} aria-busy={pending || undefined}>
          {pending ? "Entrando…" : "Entrar"}
          {!pending && (
            <svg className="lg-flecha" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 10h11M11 5.5 15.5 10 11 14.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
