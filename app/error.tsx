"use client";

// A tab left open across a deploy can call a Server Action id that no longer exists (G-009).
const STALE_ACTION = "Failed to find Server Action";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const stale = error.message.includes(STALE_ACTION);

  return (
    <main className="p-4">
      <p role="alert">{stale ? "Se actualizó la página, reintentá" : "Algo falló. Reintentá."}</p>
      <button
        type="button"
        onClick={() => (stale ? window.location.reload() : retry())}
        className="mt-4 min-h-11 rounded-md border px-4"
      >
        Reintentar
      </button>
    </main>
  );
}
