"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { blockModules, unblockModule } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast, type ToastMessage } from "@/components/ui/toast";
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
import {
  MODULE_ORDER,
  MODULE_WORDS,
  availableChoices,
  buildMonth,
  type Block,
  type BlockChoice,
  type DayCell,
  type ModuleCode,
} from "./month";

// Functional owner calendar (docs/06-UI-UX.md §5). Visual design is a seccion-premium round.

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const STALE_ACTION = "Failed to find Server Action";

type Props = {
  month: IsoMonth;
  blocks: Block[];
  today: IsoDate;
  lastBookable: IsoDate;
  firstMonth: IsoMonth;
  lastMonth: IsoMonth;
};

type Target =
  | { kind: "day"; cell: DayCell }
  | { kind: "unblock"; cell: DayCell; module: ModuleCode; blockId: string }
  | null;

const capitalize = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

function dayLabel(cell: DayCell): string {
  const modules = MODULE_ORDER.map((module) => {
    const words = MODULE_WORDS[module];
    return `${words.label} ${cell.modules[module] ? words.crossed : "libre"}`;
  }).join(", ");
  return `${formatLongDate(cell.date)}: ${modules}${cell.status === "past" ? " (ya pasó)" : ""}`;
}

export function AdminCalendar({ month, blocks, today, lastBookable, firstMonth, lastMonth }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<Target>(null);
  const [choice, setChoice] = useState<BlockChoice | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const weeks = useMemo(() => buildMonth(month, blocks, today, lastBookable), [month, blocks, today, lastBookable]);
  const dismissToast = useCallback(() => setToast(null), []);

  const notify = (text: string, tone: ToastMessage["tone"]) => setToast({ id: Date.now(), text, tone });

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) notify(success, "success");
        else if (result.code === "UNAUTHORIZED") {
          router.push("/admin/login?sesion=terminada");
          return;
        } else if (result.code === "ALREADY_TAKEN") notify("Ese módulo ya estaba tachado.", "error");
        else if (result.code === "NOT_FOUND") notify("Ese módulo ya estaba liberado.", "error");
        else notify("Algo falló. Reintentá.", "error");
      } catch (error) {
        const stale = error instanceof Error && error.message.includes(STALE_ACTION);
        notify(stale ? "Se actualizó la página, reintentá" : "Algo falló. Reintentá.", "error");
      } finally {
        setTarget(null);
        setChoice(null);
      }
      router.refresh();
    });
  }

  function confirmBlock() {
    if (target?.kind !== "day" || !choice) return;
    const { date } = target.cell;
    const words = MODULE_WORDS[choice];
    run(() => blockModules({ date, choice }), `Listo, ${words.label} del ${formatDayMonth(date)} ${words.crossed}.`);
  }

  function confirmUnblock() {
    if (target?.kind !== "unblock") return;
    const { date } = target.cell;
    const words = MODULE_WORDS[target.module];
    const id = target.blockId;
    run(() => unblockModule({ id }), `Listo, ${words.label} del ${formatDayMonth(date)} ${words.freed}.`);
  }

  const previous = month > firstMonth ? addMonthsToMonth(month, -1) : null;
  const next = month < lastMonth ? addMonthsToMonth(month, 1) : null;
  const dayChoices = target?.kind === "day" ? availableChoices(target.cell) : [];
  const dayCrossed =
    target?.kind === "day" ? MODULE_ORDER.filter((module) => target.cell.modules[module] !== null) : [];

  return (
    <section aria-labelledby="month-title" className="mt-6">
      <div className="flex items-center justify-between gap-2">
        {previous ? (
          <Link href={`/admin?mes=${previous}`} scroll={false} className="flex min-h-11 items-center rounded-md border px-3">
            ← Anterior
          </Link>
        ) : (
          <span className="min-h-11 px-3" />
        )}
        <h2 id="month-title" className="text-lg font-semibold">
          {formatMonthTitle(month)}
        </h2>
        {next ? (
          <Link href={`/admin?mes=${next}`} scroll={false} className="flex min-h-11 items-center rounded-md border px-3">
            Siguiente →
          </Link>
        ) : (
          <span className="min-h-11 px-3" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-0.5 text-center text-xs" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <ol className="mt-1 grid grid-cols-7 gap-0.5">
        {weeks.flat().map((cell) =>
          cell.status === "outside-month" ? (
            <li key={cell.date} aria-hidden="true" />
          ) : (
            <li key={cell.date}>
              <button
                type="button"
                disabled={cell.status !== "open"}
                aria-label={dayLabel(cell)}
                onClick={() => {
                  setChoice(null);
                  setTarget({ kind: "day", cell });
                }}
                className="flex min-h-16 w-full min-w-11 flex-col items-center justify-center rounded-md border py-1 disabled:opacity-40"
              >
                <span className="font-semibold">{cell.day}</span>
                <span className="flex gap-1 text-[0.65rem]">
                  {MODULE_ORDER.map((module) => (
                    <span key={module} className={cell.modules[module] ? "line-through" : ""}>
                      {MODULE_WORDS[module].label.charAt(0)}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ),
        )}
      </ol>
      <p className="mt-2 text-xs">M = Mediodía · N = Noche · tachado = ocupado</p>

      <ConfirmDialog
        open={target?.kind === "day"}
        title={target?.kind === "day" ? capitalize(formatLongDate(target.cell.date)) : ""}
        confirmLabel={dayChoices.length > 0 ? "Tachar" : undefined}
        confirmDisabled={!choice}
        pending={pending}
        onConfirm={confirmBlock}
        onClose={() => setTarget((current) => (current?.kind === "day" ? null : current))}
      >
        {dayChoices.length > 0 && (
          <fieldset>
            <legend className="font-medium">Tachar</legend>
            {dayChoices.map((option) => (
              <label key={option} className="mt-2 flex min-h-11 items-center gap-3">
                <input
                  type="radio"
                  name="choice"
                  value={option}
                  checked={choice === option}
                  onChange={() => setChoice(option)}
                  className="size-5"
                />
                {MODULE_WORDS[option].label}
              </label>
            ))}
          </fieldset>
        )}
        {dayCrossed.length > 0 && target?.kind === "day" && (
          <div className="mt-4">
            <p className="font-medium">Tachados</p>
            {dayCrossed.map((module) => (
              <div key={module} className="mt-2 flex min-h-11 items-center justify-between gap-3">
                <span className="line-through">{MODULE_WORDS[module].label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setTarget({ kind: "unblock", cell: target.cell, module, blockId: target.cell.modules[module] ?? "" })
                  }
                  className="min-h-11 rounded-md border px-4"
                >
                  Liberar
                </button>
              </div>
            ))}
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={target?.kind === "unblock"}
        title={
          target?.kind === "unblock"
            ? `¿Liberar ${MODULE_WORDS[target.module].label} del ${formatWeekdayDayMonth(target.cell.date)}?`
            : ""
        }
        confirmLabel="Liberar"
        pending={pending}
        onConfirm={confirmUnblock}
        onClose={() => setTarget((current) => (current?.kind === "unblock" ? null : current))}
      />

      <Toast message={toast} onDismiss={dismissToast} />
    </section>
  );
}
