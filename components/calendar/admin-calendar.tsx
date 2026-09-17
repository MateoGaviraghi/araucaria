"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { blockModules, unblockModule } from "@/app/admin/actions";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmAlert, type AlertMessage } from "@/components/ui/confirm-alert";
import type { ActionResult } from "@/lib/action-result";
import {
  addMonthsToMonth,
  formatLongDate,
  formatMonthTitle,
  formatWeekdayDayMonth,
  type IsoDate,
  type IsoMonth,
} from "@/lib/dates";
import {
  MODULE_ORDER,
  MODULE_WORDS,
  buildMonth,
  type Block,
  type BlockChoice,
  type DayCell,
  type ModuleCode,
} from "./month";

// Owner calendar, "Mitades" (D-019): each day split in two, top = Mediodía, bottom = Noche.
// Tap a day → sheet (phone) or side panel (desktop) with one toggle per module. Every change saves at
// once and is confirmed by a centered, animated alert with "Deshacer" (D-020).

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const STALE_ACTION = "Failed to find Server Action";
const DESKTOP = "(min-width: 64rem)";

type Props = {
  month: IsoMonth;
  blocks: Block[];
  upcoming: Block[];
  today: IsoDate;
  lastBookable: IsoDate;
  firstMonth: IsoMonth;
  lastMonth: IsoMonth;
};

type Undo = { ids: string[] } | { date: IsoDate; module: ModuleCode };
type Success = { title: string; detail: string; undo: Undo | null };

const capitalize = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const slot = (date: IsoDate, module: ModuleCode) => `${date}|${module}`;
// "Sábado 19/09 · Mediodía"
const describe = (date: IsoDate, choice: BlockChoice) =>
  `${capitalize(formatWeekdayDayMonth(date))} · ${MODULE_WORDS[choice].label}`;

function dayLabel(cell: DayCell): string {
  const modules = MODULE_ORDER.map((module) => {
    const words = MODULE_WORDS[module];
    return `${words.label} ${cell.modules[module] ? words.crossed : "libre"}`;
  }).join(", ");
  return `${formatLongDate(cell.date)}: ${modules}`;
}

export function AdminCalendar({ month, blocks, upcoming, today, lastBookable, firstMonth, lastMonth }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<IsoDate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);

  // Optimistic slots survive only until the server sends a different set of blocks.
  const version = useMemo(() => [...blocks, ...upcoming].map((b) => b.id).join(","), [blocks, upcoming]);
  const [optimistic, setOptimistic] = useState<{ version: string; slots: Record<string, boolean> }>({
    version,
    slots: {},
  });
  const overrides = useMemo(
    () => (optimistic.version === version ? optimistic.slots : {}),
    [optimistic, version],
  );

  const setSlots = (entries: [string, boolean][]) =>
    setOptimistic((previous) => ({
      version,
      slots: { ...(previous.version === version ? previous.slots : {}), ...Object.fromEntries(entries) },
    }));
  const clearSlots = (keys: string[]) =>
    setOptimistic((previous) => {
      const slots = { ...(previous.version === version ? previous.slots : {}) };
      for (const key of keys) delete slots[key];
      return { version, slots };
    });

  const effective = useMemo(() => {
    const apply = (list: Block[], belongs: (date: IsoDate) => boolean) => {
      const result = list.filter((b) => overrides[slot(b.date, b.module)] !== false);
      for (const [key, taken] of Object.entries(overrides)) {
        const [date = "", module = "mediodia"] = key.split("|") as [IsoDate, ModuleCode];
        if (taken && belongs(date) && !result.some((b) => b.date === date && b.module === module)) {
          // Empty id: not saved yet, so it cannot be freed until the server answers.
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

  const weeks = useMemo(
    () => buildMonth(month, effective.blocks, today, lastBookable),
    [month, effective.blocks, today, lastBookable],
  );
  const selected = weeks.flat().find((cell) => cell.date === selectedDate && cell.status === "open") ?? null;

  function openDay(cell: DayCell) {
    setSelectedDate(cell.date);
    if (!window.matchMedia(DESKTOP).matches) setSheetOpen(true);
  }

  function showAlert(tone: AlertMessage["tone"], title: string, detail: string | undefined, nextUndo: Undo | null) {
    // One action, one confirmation: the day sheet closes so the alert sits over the updated calendar.
    setSheetOpen(false);
    setUndo(nextUndo);
    // A new id re-mounts the alert so its entrance plays again.
    setAlert((current) => ({ id: (current?.id ?? 0) + 1, tone, title, detail, canUndo: nextUndo !== null }));
  }

  function run<T>(
    action: () => Promise<ActionResult<T>>,
    slots: [string, boolean][],
    detail: string,
    onSuccess: (data: T | undefined) => Success,
  ) {
    setSlots(slots);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) {
          const success = onSuccess(result.data);
          showAlert("success", success.title, success.detail, success.undo);
        } else if (result.code === "UNAUTHORIZED") {
          router.push("/admin/login?sesion=terminada");
          return;
        } else {
          clearSlots(slots.map(([key]) => key));
          const title =
            result.code === "ALREADY_TAKEN"
              ? "Ese módulo ya estaba reservado."
              : result.code === "NOT_FOUND"
                ? "Ese módulo ya estaba liberado."
                : "Algo falló. Reintentá.";
          showAlert("error", title, detail, null);
        }
      } catch (error) {
        clearSlots(slots.map(([key]) => key));
        const stale = error instanceof Error && error.message.includes(STALE_ACTION);
        showAlert("error", stale ? "Se actualizó la página, reintentá" : "Algo falló. Reintentá.", undefined, null);
      }
      router.refresh();
    });
  }

  function toggle(date: IsoDate, module: ModuleCode, blockId: string | null) {
    const detail = describe(date, module);
    if (blockId) {
      run(() => unblockModule({ id: blockId }), [[slot(date, module), false]], detail, () => ({
        title: "Liberado",
        detail,
        undo: { date, module },
      }));
      return;
    }
    run(() => blockModules({ date, choice: module }), [[slot(date, module), true]], detail, (data) => ({
      title: "Reservado",
      detail,
      undo: data ? { ids: data.ids } : null,
    }));
  }

  function blockWholeDay(date: IsoDate) {
    const detail = describe(date, "dia-completo");
    run(
      () => blockModules({ date, choice: "dia-completo" }),
      MODULE_ORDER.map((module) => [slot(date, module), true]),
      detail,
      (data) => ({ title: "Reservado", detail, undo: data ? { ids: data.ids } : null }),
    );
  }

  function undoLast() {
    const last = undo;
    const detail = alert?.detail ?? "";
    if (!last) return;
    setUndo(null);
    if ("date" in last) {
      run(() => blockModules({ date: last.date, choice: last.module }), [[slot(last.date, last.module), true]], detail, () => ({
        title: "Deshecho",
        detail,
        undo: null,
      }));
      return;
    }
    const taken = [...blocks, ...upcoming].filter((b) => last.ids.includes(b.id));
    run(
      async (): Promise<ActionResult> => {
        for (const id of last.ids) {
          const result = await unblockModule({ id });
          if (!result.ok) return result;
        }
        return { ok: true };
      },
      taken.map((b) => [slot(b.date, b.module), false]),
      detail,
      () => ({ title: "Deshecho", detail, undo: null }),
    );
  }

  const previous = month > firstMonth ? addMonthsToMonth(month, -1) : null;
  const next = month < lastMonth ? addMonthsToMonth(month, 1) : null;

  const dayActions = (cell: DayCell) => {
    const bothFree = MODULE_ORDER.every((module) => cell.modules[module] === null);
    return (
      <div>
        <p className="text-sm text-[var(--admin-muted)]">Tocá para reservar o liberar</p>
        <h2 className="mt-0.5 text-xl font-semibold">{capitalize(formatLongDate(cell.date))}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {MODULE_ORDER.map((module) => {
            const blockId = cell.modules[module];
            const taken = blockId !== null;
            return (
              <button
                key={module}
                type="button"
                className="admin-toggle"
                aria-pressed={taken}
                disabled={pending || blockId === ""}
                onClick={() => toggle(cell.date, module, blockId)}
              >
                <span className="text-lg font-semibold">{MODULE_WORDS[module].label}</span>
                <span className="text-sm opacity-80">{taken ? "Reservado" : "Libre"}</span>
              </button>
            );
          })}
        </div>
        {bothFree && (
          <button
            type="button"
            disabled={pending}
            onClick={() => blockWholeDay(cell.date)}
            className="mt-3 min-h-12 w-full rounded-[0.875rem] px-4 text-base font-medium shadow-[inset_0_0_0_1px_var(--admin-free-line)] disabled:opacity-60"
          >
            Reservar el día completo
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
        <section aria-labelledby="admin-month">
          <div className="flex items-center justify-between gap-2">
            <h2 id="admin-month" className="text-2xl font-semibold tracking-tight">
              {formatMonthTitle(month)}
            </h2>
            <div className="flex gap-2">
              {previous ? (
                <Link
                  href={`/admin?mes=${previous}`}
                  scroll={false}
                  aria-label="Mes anterior"
                  className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--admin-free-line)]"
                >
                  ←
                </Link>
              ) : (
                <span className="size-11" />
              )}
              {next ? (
                <Link
                  href={`/admin?mes=${next}`}
                  scroll={false}
                  aria-label="Mes siguiente"
                  className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--admin-free-line)]"
                >
                  →
                </Link>
              ) : (
                <span className="size-11" />
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[var(--admin-muted)] lg:gap-2" aria-hidden="true">
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
                    className="admin-day"
                    disabled={cell.status !== "open"}
                    data-today={cell.date === today ? "" : undefined}
                    data-selected={cell.date === selectedDate ? "" : undefined}
                    aria-label={dayLabel(cell)}
                    onClick={() => openDay(cell)}
                  >
                    <span className="admin-half top-0" data-taken={cell.modules.mediodia !== null ? "" : undefined} />
                    <span className="admin-half bottom-0" data-taken={cell.modules.noche !== null ? "" : undefined} />
                    <span className="absolute inset-x-1 top-1/2 h-px bg-[var(--admin-paper)]" aria-hidden="true" />
                    <span className="admin-day-number">{cell.day}</span>
                  </button>
                </li>
              ),
            )}
          </ol>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--admin-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[var(--admin-free)] shadow-[inset_0_0_0_1px_var(--admin-free-line)]" />{" "}
              Libre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[var(--admin-taken)]" /> Reservado
            </span>
            <span>Arriba mediodía · abajo noche</span>
          </div>
        </section>

        <aside className="mt-10 lg:sticky lg:top-8 lg:mt-0">
          <div className="hidden rounded-[1.25rem] p-5 shadow-[inset_0_0_0_1px_var(--admin-free-line)] lg:block">
            {selected ? (
              dayActions(selected)
            ) : (
              <p className="text-[var(--admin-muted)]">Tocá un día del calendario para reservar o liberar.</p>
            )}
          </div>

          <section aria-labelledby="admin-upcoming" className="lg:mt-8">
            <h2 id="admin-upcoming" className="text-lg font-semibold">
              Próximos reservados
            </h2>
            {effective.upcoming.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--admin-muted)]">No hay módulos reservados desde hoy.</p>
            ) : (
              <ul className="mt-2 divide-y divide-[var(--admin-free-line)]">
                {effective.upcoming.map((block) => (
                  <li key={`${block.date}-${block.module}`} className="flex min-h-14 items-center justify-between gap-3">
                    <span>
                      <span className="font-medium">{capitalize(formatWeekdayDayMonth(block.date))}</span>
                      <span className="text-[var(--admin-muted)]"> · {MODULE_WORDS[block.module].label}</span>
                    </span>
                    <button
                      type="button"
                      disabled={pending || block.id === ""}
                      onClick={() => toggle(block.date, block.module, block.id)}
                      className="min-h-11 rounded-full px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--admin-free-line)] disabled:opacity-60"
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

      <BottomSheet
        open={sheetOpen}
        label={selected ? capitalize(formatLongDate(selected.date)) : "Día"}
        onClose={() => setSheetOpen(false)}
      >
        {selected && dayActions(selected)}
        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          className="mt-3 min-h-11 w-full rounded-[0.875rem] text-sm text-[var(--admin-muted)]"
        >
          Listo
        </button>
      </BottomSheet>

      {alert && (
        <ConfirmAlert
          key={alert.id}
          message={alert}
          onUndo={undoLast}
          undoDisabled={pending}
          onClose={() => setAlert((current) => (current?.id === alert.id ? null : current))}
        />
      )}
    </>
  );
}
