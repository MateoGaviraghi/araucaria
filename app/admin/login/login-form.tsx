"use client";

import { useActionState, useEffect, useRef } from "react";
import { login } from "@/app/login-action";
import type { ActionResult, ErrorCode } from "@/lib/action-result";

// docs/06-UI-UX.md §5. The login never says more than "wrong password".
const MESSAGES: Partial<Record<ErrorCode, string>> = {
  INVALID_CREDENTIALS: "Contraseña incorrecta.",
  INVALID_INPUT: "Contraseña incorrecta.",
  RATE_LIMITED: "Demasiados intentos. Probá de nuevo más tarde.",
};

// Functional only; the panel's visual design is WU-04.
export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(login, null);
  const message = state && !state.ok ? (MESSAGES[state.code] ?? "Algo falló. Reintentá.") : null;
  const renderedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // C-09 time trap: measured from when the form is usable in the browser until submit.
    if (renderedAtRef.current) renderedAtRef.current.value = String(Date.now());
  }, []);

  return (
    <form action={formAction}>
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={200}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? "login-error" : undefined}
      />

      {/* Honeypot (C-09): off-screen and hidden from assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px]">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />

      {message && (
        <p id="login-error" role="alert">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending}>
        Entrar
      </button>
    </form>
  );
}
