"use client";

import { useEffect } from "react";

export type ToastMessage = { id: number; text: string; tone: "success" | "error" };

// Announced by screen readers: polite for confirmations, assertive for errors.
export function Toast({ message, onDismiss }: { message: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role={message?.tone === "error" ? "alert" : "status"}
      aria-live={message?.tone === "error" ? "assertive" : "polite"}
      className="fixed inset-x-4 bottom-4 flex justify-center"
    >
      {message && (
        <p key={message.id} className="rounded-md border bg-white px-4 py-3 shadow">
          {message.text}
        </p>
      )}
    </div>
  );
}
