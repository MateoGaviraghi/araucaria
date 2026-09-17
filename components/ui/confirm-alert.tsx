"use client";

import { useEffect, useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export type AlertMessage = {
  id: number;
  tone: "success" | "error";
  title: string;
  detail?: string;
  canUndo: boolean;
};

export const ALERT_AUTO_CLOSE_MS = 4000;

const REDUCED = "(prefers-reduced-motion: reduce)";

// Apple-style confirmation (D-020): a centered card over a dimmed page, a ring and a check (or a
// cross) drawn with GSAP DrawSVG, then the text. Closes by itself after 4 s unless the pointer or
// keyboard focus is on it. A modal <dialog>: Escape closes it and focus returns where it was.
// Styles: `.admin-alert` in app/admin/admin.css.
export function ConfirmAlert({
  message,
  onUndo,
  onClose,
  undoDisabled,
}: {
  message: AlertMessage;
  onUndo: () => void;
  onClose: () => void;
  undoDisabled?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remaining = useRef(ALERT_AUTO_CLOSE_MS);
  const startedAt = useRef(0);
  const titleId = useId();
  const detailId = useId();

  const { contextSafe } = useGSAP(
    () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (!dialog.open) dialog.showModal();
      cardRef.current?.focus();

      if (window.matchMedia(REDUCED).matches) {
        gsap.fromTo([".admin-alert-overlay", ".admin-alert-card"], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .fromTo(".admin-alert-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
        .fromTo(".admin-alert-card", { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out" }, 0)
        .fromTo(".admin-alert-ring", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, ease: "power2.inOut" }, 0.1)
        .fromTo(".admin-alert-mark", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.35 }, 0.55)
        .fromTo(".admin-alert-text", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06 }, 0.45);
    },
    { scope: dialogRef },
  );

  // Wrapped with contextSafe when it runs (not during render), so the tweens are scoped and cleaned up.
  function dismiss() {
    if (closing.current) return;
    closing.current = true;
    if (timer.current) clearTimeout(timer.current);
    const reduce = window.matchMedia(REDUCED).matches;
    contextSafe(() => {
      gsap.to(".admin-alert-card", { autoAlpha: 0, scale: reduce ? 1 : 0.98, duration: 0.2, ease: "power2.out" });
      gsap.to(".admin-alert-overlay", {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.out",
        onComplete: () => {
          dialogRef.current?.close();
          onClose();
        },
      });
    })();
  }

  const startTimer = () => {
    if (closing.current) return;
    if (timer.current) clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = setTimeout(dismiss, remaining.current);
  };
  const pauseTimer = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current = Math.max(800, remaining.current - (Date.now() - startedAt.current));
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // The timer starts once per alert; the component is keyed by message id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="admin-alert"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={message.detail ? detailId : undefined}
      data-tone={message.tone}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className="admin-alert-overlay" onClick={dismiss} aria-hidden="true" />
      <div
        ref={cardRef}
        tabIndex={-1}
        className="admin-alert-card"
        onPointerEnter={pauseTimer}
        onPointerLeave={startTimer}
        onFocus={(event) => {
          if (event.target !== cardRef.current) pauseTimer();
        }}
        onBlur={(event) => {
          if (!cardRef.current?.contains(event.relatedTarget as Node | null)) startTimer();
        }}
      >
        <div className="admin-alert-body">
          <svg className="admin-alert-icon" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="admin-alert-ring" cx="26" cy="26" r="23" />
            {message.tone === "success" ? (
              <path className="admin-alert-mark" d="M15 27 L22.5 34.5 L37.5 19" />
            ) : (
              <path className="admin-alert-mark" d="M19 19 L33 33 M33 19 L19 33" />
            )}
          </svg>
          <h2 id={titleId} className="admin-alert-text admin-alert-title">
            {message.title}
          </h2>
          {message.detail && (
            <p id={detailId} className="admin-alert-text admin-alert-detail">
              {message.detail}
            </p>
          )}
        </div>
        <div className="admin-alert-text admin-alert-actions" data-count={message.canUndo ? 2 : 1}>
          {message.canUndo && (
            <button
              type="button"
              disabled={undoDisabled}
              onClick={() => {
                onUndo();
                dismiss();
              }}
            >
              Deshacer
            </button>
          )}
          <button type="button" className="admin-alert-primary" onClick={dismiss}>
            Listo
          </button>
        </div>
      </div>
    </dialog>
  );
}
