"use client";

import { useEffect } from "react";

export type Notice = { id: number; text: string; tone: "success" | "error"; canUndo: boolean };

export const UNDO_WINDOW_MS = 6000;

// "Listo, … · Deshacer" (D-019). Announced by screen readers; errors assertively.
// Styles and entrance: `.admin-undo` in app/admin/admin.css.
export function UndoBar({
  notice,
  onUndo,
  onExpire,
  undoDisabled,
}: {
  notice: Notice;
  onUndo: () => void;
  onExpire: () => void;
  undoDisabled?: boolean;
}) {
  useEffect(() => {
    const timer = setTimeout(onExpire, UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [notice.id, onExpire]);

  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className="admin-undo flex min-h-12 items-center justify-between gap-3 rounded-[0.875rem] bg-[var(--admin-ink)] py-1 pl-4 pr-1 text-[var(--admin-taken-ink)]"
    >
      <span className="text-sm">{notice.text}</span>
      {notice.canUndo && (
        <button
          type="button"
          onClick={onUndo}
          disabled={undoDisabled}
          className="min-h-11 shrink-0 rounded-[0.625rem] px-4 text-sm font-semibold underline-offset-4 hover:underline disabled:opacity-50"
        >
          Deshacer
        </button>
      )}
    </div>
  );
}
