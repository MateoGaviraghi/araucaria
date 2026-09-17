"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  /** Omit to show only "Cancelar" (e.g. a day with nothing left to confirm). */
  confirmLabel?: string;
  confirmDisabled?: boolean;
  pending?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
};

// Native <dialog>: showModal() traps focus, Escape closes and the page behind becomes inert.
// Functional styling only; the visual design is a seccion-premium round.
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmDisabled,
  pending,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-lg p-5 backdrop:bg-black/50"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      {children && <div className="mt-4">{children}</div>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="min-h-11 rounded-md border px-4">
          Cancelar
        </button>
        {confirmLabel && onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled || pending}
            className="min-h-11 rounded-md border px-4 font-semibold disabled:opacity-50"
          >
            {pending ? "Guardando…" : confirmLabel}
          </button>
        )}
      </div>
    </dialog>
  );
}
