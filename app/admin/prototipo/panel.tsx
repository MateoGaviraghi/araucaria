"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ComponentType } from "react";
import { blockModules, logout, unblockModule } from "@/app/admin/actions";
import {
  MODULE_ORDER,
  MODULE_WORDS,
  buildMonth,
  type Block,
  type BlockChoice,
  type DayCell,
  type ModuleCode,
} from "@/components/calendar/month";
import type { ActionResult } from "@/lib/action-result";
import {
  addMonthsToMonth,
  formatDayMonth,
  formatLongDate,
  formatMonthTitle,
  formatWeekdayDayMonth,
  type IsoDate,
  type IsoMonth,
} from "@/lib/dates";
import { DIAGONAL_HINT, DiaDiagonal } from "./dia-diagonal";
import { BARRAS_HINT, DiaBarras } from "./dia-barras";
import { MITADES_HINT, DiaMitades } from "./dia-mitades";
import { Picker } from "./picker";

const VARIANTS: { name: string; Cell: ComponentType<{ cell: DayCell }>; hint: string }[] = [
  { name: "Mitades", Cell: DiaMitades, hint: MITADES_HINT },
  { name: "Diagonal", Cell: DiaDiagonal, hint: DIAGONAL_HINT },
  { name: "Barras", Cell: DiaBarras, hint: BARRAS_HINT },
];

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const STALE_ACTION = "Failed to find Server Action";
const UNDO_MS = 6000;

type Props = {
  initialVariant: number;
  month: IsoMonth;
  blocks: Block[];
  upcoming: Block[];
  today: IsoDate;
  lastBookable: IsoDate;
  firstMonth: IsoMonth;
  lastMonth: IsoMonth;
};

type Undo =
  | { kind: "unblock"; date: IsoDate; modules: ModuleCode[] }
  | { kind: "reblock"; date: IsoDate; module: ModuleCode };

type Notice = { id: number; text: string; tone: "success" | "error"; undo?: Undo };

const capitalize = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const key = (date: IsoDate, module: ModuleCode) => `${date}|${module}`;

function dayLabel(cell: DayCell): string {
  const modules = MODULE_ORDER.map((module) => {
    const words = MODULE_WORDS[module];
    return `${words.label} ${cell.modules[module] ? words.crossed : "libre"}`;
  }).join(", ");
  return `${formatLongDate(cell.date)}: ${modules}`;
}

export function PrototypePanel(props: Props) {
  const [variant, setVariant] = useState(props.initialVariant);
  const [mountKey, setMountKey] = useState(0);
  const select = useCallback((index: number) => {
    setVariant(index);
    setMountKey((k) => k + 1);
  }, []);
  const replay = useCallback(() => setMountKey((k) => k + 1), []);

  return (
    <>
      <Stage key={`${variant}-${mountKey}`} variant={variant} {...props} />
      <Picker names={VARIANTS.map((v) => v.name)} current={variant} onSelect={select} onReplay={replay} />
    </>
  );
}

function Stage({ variant, month, blocks, upcoming, today, lastBookable, firstMonth, lastMonth }: Props & { variant: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<IsoDate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const { Cell, hint } = VARIANTS[variant] ?? VARIANTS[0]!;

  // Optimistic changes survive only until the server sends a different set of blocks.
  const version = useMemo(() => [...blocks, ...upcoming].map((b) => b.id).join(","), [blocks, upcoming]);
  const [optimistic, setOptimistic] = useState<{ version: string; map: Record<string, boolean> }>({ version, map: {} });
  const overrides = useMemo(
    () => (optimistic.version === version ? optimistic.map : {}),
    [optimistic, version],
  );

  const setOverride = (entries: [string, boolean][]) =>
    setOptimistic((previous) => ({
      version,
      map: { ...(previous.version === version ? previous.map : {}), ...Object.fromEntries(entries) },
    }));
  const clearOverride = (keys: string[]) =>
    setOptimistic((previous) => {
      const map = { ...(previous.version === version ? previous.map : {}) };
      for (const k of keys) delete map[k];
      return { version, map };
    });

  const effective = useMemo(() => {
    const apply = (list: Block[], inMonth: (date: IsoDate) => boolean) => {
      const result = list.filter((b) => overrides[key(b.date, b.module)] !== false);
      for (const [k, taken] of Object.entries(overrides)) {
        const [date = "", module = "mediodia"] = k.split("|") as [IsoDate, ModuleCode];
        if (taken && inMonth(date) && !result.some((b) => b.date === date && b.module === module)) {
          result.push({ id: "", date, module });
        }
      }
      return result;
    };
    return {
      blocks: apply(blocks, (date) => date.startsWith(month)),
      upcoming: apply(upcoming, (date) => date >= today).sort((a, b) =>
        a.date === b.date ? a.module.localeCompare(b.module) : a.date.localeCompare(b.date),
      ),
    };
  }, [blocks, upcoming, overrides, month, today]);

  const weeks = useMemo(() => buildMonth(month, effective.blocks, today, lastBookable), [month, effective.blocks, today, lastBookable]);
  const selected = weeks.flat().find((cell) => cell.date === selectedDate && cell.status === "open") ?? null;

  useEffect(() => {
    const dialog = sheetRef.current;
    if (!dialog) return;
    if (sheetOpen && !dialog.open) dialog.showModal();
    if (!sheetOpen && dialog.open) dialog.close();
  }, [sheetOpen]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice((current) => (current?.id === notice.id ? null : current)), UNDO_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  function openDay(cell: DayCell) {
    setSelectedDate(cell.date);
    if (!window.matchMedia("(min-width: 64rem)").matches) setSheetOpen(true);
  }

  function run(
    action: () => Promise<ActionResult>,
    optimisticEntries: [string, boolean][],
    onSuccess: () => Notice,
  ) {
    setOverride(optimisticEntries);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) setNotice(onSuccess());
        else if (result.code === "UNAUTHORIZED") {
          router.push("/admin/login?sesion=terminada");
          return;
        } else {
          clearOverride(optimisticEntries.map(([k]) => k));
          const text =
            result.code === "ALREADY_TAKEN"
              ? "Ese módulo ya estaba tachado."
              : result.code === "NOT_FOUND"
                ? "Ese módulo ya estaba liberado."
                : "Algo falló. Reintentá.";
          setNotice({ id: Date.now(), text, tone: "error" });
        }
      } catch (error) {
        clearOverride(optimisticEntries.map(([k]) => k));
        const stale = error instanceof Error && error.message.includes(STALE_ACTION);
        setNotice({ id: Date.now(), text: stale ? "Se actualizó la página, reintentá" : "Algo falló. Reintentá.", tone: "error" });
      }
      router.refresh();
    });
  }

  function toggle(date: IsoDate, module: ModuleCode, blockId: string | null) {
    const words = MODULE_WORDS[module];
    if (blockId) {
      run(() => unblockModule({ id: blockId }), [[key(date, module), false]], () => ({
        id: Date.now(),
        text: `Listo, ${words.label} del ${formatDayMonth(date)} ${words.freed}.`,
        tone: "success",
        undo: { kind: "reblock", date, module },
      }));
    } else {
      run(() => blockModules({ date, choice: module }), [[key(date, module), true]], () => ({
        id: Date.now(),
        text: `Listo, ${words.label} del ${formatDayMonth(date)} ${words.crossed}.`,
        tone: "success",
        undo: { kind: "unblock", date, modules: [module] },
      }));
    }
  }

  function blockWholeDay(date: IsoDate) {
    const words = MODULE_WORDS["dia-completo" satisfies BlockChoice];
    run(
      () => blockModules({ date, choice: "dia-completo" }),
      MODULE_ORDER.map((module) => [key(date, module), true]),
      () => ({
        id: Date.now(),
        text: `Listo, ${words.label} del ${formatDayMonth(date)} ${words.crossed}.`,
        tone: "success",
        undo: { kind: "unblock", date, modules: [...MODULE_ORDER] },
      }),
    );
  }

  const undoIds = (undo: Undo | undefined): string[] | null => {
    if (!undo || undo.kind !== "unblock") return null;
    const all = [...blocks, ...upcoming];
    const ids = undo.modules.map((module) => all.find((b) => b.date === undo.date && b.module === module)?.id);
    return ids.every(Boolean) ? (ids as string[]) : null;
  };

  function undoLast() {
    const undo = notice?.undo;
    if (!undo) return;
    setNotice(null);
    if (undo.kind === "reblock") {
      run(() => blockModules({ date: undo.date, choice: undo.module }), [[key(undo.date, undo.module), true]], () => ({
        id: Date.now(),
        text: "Deshecho.",
        tone: "success",
      }));
      return;
    }
    const ids = undoIds(undo);
    if (!ids) return;
    run(
      async () => {
        for (const id of ids) {
          const result = await unblockModule({ id });
          if (!result.ok) return result;
        }
        return { ok: true };
      },
      undo.modules.map((module) => [key(undo.date, module), false]),
      () => ({ id: Date.now(), text: "Deshecho.", tone: "success" }),
    );
  }

  const undoReady = notice?.undo ? notice.undo.kind === "reblock" || undoIds(notice.undo) !== null : false;
  const previous = month > firstMonth ? addMonthsToMonth(month, -1) : null;
  const next = month < lastMonth ? addMonthsToMonth(month, 1) : null;
  const href = (target: IsoMonth) => `/admin/prototipo?mes=${target}&v=${variant + 1}`;

  const dayActions = (cell: DayCell) => {
    const bothFree = MODULE_ORDER.every((module) => cell.modules[module] === null);
    return (
      <div>
        <p className="text-sm text-[var(--proto-muted)]">Tocá para tachar o liberar</p>
        <h2 className="mt-0.5 text-xl font-semibold">{capitalize(formatLongDate(cell.date))}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {MODULE_ORDER.map((module) => {
            const blockId = cell.modules[module];
            const taken = blockId !== null;
            return (
              <button
                key={module}
                type="button"
                className="proto-toggle"
                aria-pressed={taken}
                disabled={pending || blockId === ""}
                onClick={() => toggle(cell.date, module, blockId)}
              >
                <span className="text-lg font-semibold">{MODULE_WORDS[module].label}</span>
                <span className="text-sm opacity-80">{taken ? "Tachado" : "Libre"}</span>
              </button>
            );
          })}
        </div>
        {bothFree && (
          <button
            type="button"
            disabled={pending}
            onClick={() => blockWholeDay(cell.date)}
            className="mt-3 min-h-12 w-full rounded-[0.875rem] px-4 text-base font-medium shadow-[inset_0_0_0_1px_var(--proto-free-line)] disabled:opacity-60"
          >
            Tachar el día completo
          </button>
        )}
      </div>
    );
  };

  const undoBar = notice && (
    <div
      key={notice.id}
      role={notice.tone === "error" ? "alert" : "status"}
      className="proto-undo flex min-h-12 items-center justify-between gap-3 rounded-[0.875rem] bg-[var(--proto-ink)] py-1 pl-4 pr-1 text-[var(--proto-taken-ink)]"
    >
      <span className="text-sm">{notice.text}</span>
      {notice.undo && (
        <button
          type="button"
          onClick={undoLast}
          disabled={!undoReady || pending}
          className="min-h-11 shrink-0 rounded-[0.625rem] px-4 text-sm font-semibold underline-offset-4 hover:underline disabled:opacity-50"
        >
          Deshacer
        </button>
      )}
    </div>
  );

  return (
    <div className="proto-shell">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">Panel de Araucaria</h1>
          <form action={logout}>
            <button type="submit" className="min-h-11 rounded-full px-4 text-sm shadow-[inset_0_0_0_1px_var(--proto-free-line)]">
              Cerrar sesión
            </button>
          </form>
        </header>

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
          <section aria-labelledby="proto-month">
            <div className="flex items-center justify-between gap-2">
              <h2 id="proto-month" className="text-2xl font-semibold tracking-tight">
                {formatMonthTitle(month)}
              </h2>
              <div className="flex gap-2">
                {previous ? (
                  <Link href={href(previous)} scroll={false} aria-label="Mes anterior" className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--proto-free-line)]">
                    ←
                  </Link>
                ) : (
                  <span className="size-11" />
                )}
                {next ? (
                  <Link href={href(next)} scroll={false} aria-label="Mes siguiente" className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--proto-free-line)]">
                    →
                  </Link>
                ) : (
                  <span className="size-11" />
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[var(--proto-muted)] lg:gap-2" aria-hidden="true">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>
            <ol className="mt-2 grid grid-cols-7 gap-1 lg:gap-2">
              {weeks.flat().map((cell) =>
                cell.status === "outside-month" ? (
                  <li key={cell.date} aria-hidden="true" />
                ) : (
                  <li key={cell.date}>
                    <button
                      type="button"
                      className="proto-day"
                      disabled={cell.status !== "open"}
                      data-today={cell.date === today ? "" : undefined}
                      data-selected={cell.date === selectedDate ? "" : undefined}
                      aria-label={dayLabel(cell)}
                      onClick={() => openDay(cell)}
                    >
                      <Cell cell={cell} />
                    </button>
                  </li>
                ),
              )}
            </ol>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--proto-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-[var(--proto-free)] shadow-[inset_0_0_0_1px_var(--proto-free-line)]" /> Libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-[var(--proto-taken)]" /> Tachado
              </span>
              <span>{hint}</span>
            </div>
          </section>

          <aside className="mt-10 lg:sticky lg:top-24 lg:mt-0">
            <div className="hidden rounded-[1.25rem] p-5 shadow-[inset_0_0_0_1px_var(--proto-free-line)] lg:block">
              {selected ? dayActions(selected) : <p className="text-[var(--proto-muted)]">Tocá un día del calendario para tachar o liberar.</p>}
            </div>

            <section aria-labelledby="proto-upcoming" className="lg:mt-8">
              <h2 id="proto-upcoming" className="text-lg font-semibold">
                Próximos tachados
              </h2>
              {effective.upcoming.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--proto-muted)]">No hay módulos tachados desde hoy.</p>
              ) : (
                <ul className="mt-2 divide-y divide-[var(--proto-free-line)]">
                  {effective.upcoming.map((block) => (
                    <li key={`${block.date}-${block.module}`} className="flex min-h-14 items-center justify-between gap-3">
                      <span>
                        <span className="font-medium">{capitalize(formatWeekdayDayMonth(block.date))}</span>
                        <span className="text-[var(--proto-muted)]"> · {MODULE_WORDS[block.module].label}</span>
                      </span>
                      <button
                        type="button"
                        disabled={pending || block.id === ""}
                        onClick={() => toggle(block.date, block.module, block.id)}
                        className="min-h-11 rounded-full px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--proto-free-line)] disabled:opacity-60"
                      >
                        Liberar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>

      <dialog
        ref={sheetRef}
        className="proto-sheet"
        aria-label={selected ? capitalize(formatLongDate(selected.date)) : "Día"}
        onClose={() => setSheetOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSheetOpen(false);
        }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--proto-free-line)]" aria-hidden="true" />
        {selected && dayActions(selected)}
        {sheetOpen && undoBar && <div className="mt-4">{undoBar}</div>}
        <button type="button" onClick={() => setSheetOpen(false)} className="mt-3 min-h-11 w-full rounded-[0.875rem] text-sm text-[var(--proto-muted)]">
          Listo
        </button>
      </dialog>

      {!sheetOpen && undoBar && (
        <div className="fixed inset-x-4 bottom-4 z-10 mx-auto max-w-md pb-[env(safe-area-inset-bottom)]">{undoBar}</div>
      )}
    </div>
  );
}
