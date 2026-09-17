"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Native <dialog> in the top layer: showModal() keeps focus inside, Escape closes, the page behind is
// inert. Tapping the backdrop closes too. Styles and motion: `.admin-sheet` in app/admin/admin.css.
export function BottomSheet({
  open,
  label,
  onClose,
  children,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="admin-sheet"
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--admin-free-line)]" aria-hidden="true" />
      {children}
    </dialog>
  );
}
