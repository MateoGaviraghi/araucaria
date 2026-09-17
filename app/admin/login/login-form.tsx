"use client";

import { useActionState } from "react";
import { login } from "@/app/login-action";
import type { ActionResult, ErrorCode } from "@/lib/action-result";

// docs/06-UI-UX.md §5. The login never says more than "wrong password".
const MESSAGES: Partial<Record<ErrorCode, string>> = {
  INVALID_CREDENTIALS: "Contraseña incorrecta.",
  INVALID_INPUT: "Contraseña incorrecta.",
  RATE_LIMITED: "Demasiados intentos. Probá de nuevo más tarde.",
};

// Functional only; the panel's visual design is a seccion-premium round.
export function LoginForm({ renderedAt }: { renderedAt: number }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(login, null);
  const message = state && !state.ok ? (MESSAGES[state.code] ?? "Algo falló. Reintentá.") : null;

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
      {/* Controlled on purpose: React resets the form after each submit and would wipe a value set on the DOM. */}
      <input type="hidden" name="renderedAt" value={renderedAt} readOnly />

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
