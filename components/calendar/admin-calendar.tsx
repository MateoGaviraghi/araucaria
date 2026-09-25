"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type CSSProperties } from "react";
import { blockModules, unblockModule } from "@/app/admin/actions";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmAlert, type AlertMessage } from "@/components/ui/confirm-alert";
import type { ActionResult } from "@/lib/action-result";
import {
  addDays,
  addMonthsToMonth,
  formatDayMonth,
  formatLongDate,
  formatMonthTitle,
  formatWeekdayDayMonth,
  isoWeekday,
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
// Layout and look: D-045 (summary on top, the month, the day panel and the list of what is reserved).

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const WEEKDAY_SHORT = ["", "lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
// docs/01-CONTEXT.md, modules and prices.
const HOURS: Record<ModuleCode, string> = { mediodia: "10 a 17 h", noche: "19 a 02 h" };
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

// "Viernes 3 de octubre" (the year only adds noise inside the bookable range).
const longDay = (date: IsoDate) => capitalize(formatLongDate(date).replace(/ de \d{4}$/, ""));
const daysBetween = (from: IsoDate, to: IsoDate) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
const inDays = (n: number) => (n === 0 ? "hoy" : n === 1 ? "mañana" : `en ${n} días`);

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
  // A day of the week strip can be in another month: its modules come from the upcoming list.
  const cellFor = (date: IsoDate): DayCell => {
    const inMonth = weeks.flat().find((cell) => cell.date === date && cell.status !== "outside-month");
    if (inMonth) return inMonth;
    const modules: DayCell["modules"] = { mediodia: null, noche: null };
    for (const block of effective.upcoming) if (block.date === date) modules[block.module] = block.id;
    const status = date < today ? "past" : date > lastBookable ? "beyond-horizon" : "open";
    return { date, day: Number(date.slice(8, 10)), status, modules };
  };
  const selectedCell = selectedDate ? cellFor(selectedDate) : null;
  const selected = selectedCell?.status === "open" ? selectedCell : null;

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
  const [monthName = ""] = formatMonthTitle(month).split(" de ");

  // ---- Summary: what the owner wants to know when opening the panel.
  const byDate = new Map<IsoDate, Block[]>();
  for (const block of effective.upcoming) byDate.set(block.date, [...(byDate.get(block.date) ?? []), block]);
  const upcomingDays = [...byDate.entries()];
  const [nextDate, nextBlocks] = upcomingDays[0] ?? [null, []];
  const nextWhat =
    nextBlocks.length === MODULE_ORDER.length
      ? "Día completo"
      : nextBlocks.map((block) => MODULE_WORDS[block.module].label).join(" y ");
  const monthCells = weeks.flat().filter((cell) => cell.status !== "outside-month");
  const reservedInMonth = effective.blocks.length;
  const freeDaysLeft = monthCells.filter(
    (cell) => cell.status === "open" && MODULE_ORDER.every((module) => cell.modules[module] === null),
  ).length;
  const week = Array.from({ length: 7 }, (_, i) => cellFor(addDays(today, i)));

  const halves = (cell: DayCell, withText: boolean) =>
    MODULE_ORDER.map((module) => (
      <span key={module} className="pn-mitad" data-reservado={cell.modules[module] !== null ? "" : undefined}>
        {withText && cell.modules[module] !== null && <span className="pn-mitad-txt">{MODULE_WORDS[module].label}</span>}
      </span>
    ));

  const dayActions = (cell: DayCell) => {
    const bothFree = MODULE_ORDER.every((module) => cell.modules[module] === null);
    return (
      <div>
        <p className="pn-etiqueta">Día elegido</p>
        <h2 className="pn-dia-fecha">{longDay(cell.date)}</h2>
        <div className="pn-modulos">
          {MODULE_ORDER.map((module) => {
            const blockId = cell.modules[module];
            const taken = blockId !== null;
            return (
              <button
                key={module}
                type="button"
                className="pn-modulo"
                aria-pressed={taken}
                disabled={pending || blockId === ""}
                onClick={() => toggle(cell.date, module, blockId)}
              >
                <span className="pn-modulo-nombre">{MODULE_WORDS[module].label}</span>
                <span className="pn-modulo-horas">{HOURS[module]}</span>
                <span className="pn-estado">
                  <EstadoMarca reservado={taken} />
                  {taken ? "Reservado" : "Libre"}
                </span>
              </button>
            );
          })}
        </div>
        {bothFree && (
          <div className="pn-dia-completo">
            <button type="button" className="boton boton-en-oscuro" disabled={pending} onClick={() => blockWholeDay(cell.date)}>
              Reservar el día completo
            </button>
          </div>
        )}
        <p className="pn-ayuda">Cada toque se guarda enseguida, y lo podés deshacer desde el aviso.</p>
      </div>
    );
  };

  return (
    <>
      <p className="pn-intro pn-anima">
        Hoy es <strong>{formatLongDate(today).replace(/ de \d{4}$/, "")}</strong>
      </p>

      <div className="pn-resumen">
        <section className="pn-tarjeta pn-tarjeta-solida pn-anima" style={orden(1)} aria-labelledby="pn-proximo">
          <h2 id="pn-proximo" className="pn-etiqueta">
            Lo próximo reservado
          </h2>
          {nextDate ? (
            <>
              <p className="pn-cifra">
                {capitalize(WEEKDAY_SHORT[isoWeekday(nextDate)] ?? "")} {formatDayMonth(nextDate)}
              </p>
              <p className="pn-tarjeta-pie">
                <strong>{nextWhat}</strong> · {inDays(daysBetween(today, nextDate))}
              </p>
            </>
          ) : (
            <>
              <p className="pn-cifra">Nada</p>
              <p className="pn-tarjeta-pie">No hay módulos reservados desde hoy.</p>
            </>
          )}
        </section>

        <section className="pn-tarjeta pn-anima" style={orden(2)} aria-labelledby="pn-mes-resumen">
          <h2 id="pn-mes-resumen" className="pn-etiqueta">
            En {monthName.toLowerCase()}
          </h2>
          <p className="pn-cifra">
            {reservedInMonth}
            <small>{reservedInMonth === 1 ? "módulo reservado" : "módulos reservados"}</small>
          </p>
          <p className="pn-tarjeta-pie">
            <strong>{freeDaysLeft}</strong> {freeDaysLeft === 1 ? "día libre entero" : "días libres enteros"} de acá a fin de mes
          </p>
        </section>

        <section className="pn-tarjeta pn-anima" style={orden(3)} aria-labelledby="pn-semana">
          <h2 id="pn-semana" className="pn-etiqueta">
            Los próximos 7 días
          </h2>
          <div className="pn-semana">
            {week.map((cell) => (
              <button
                key={cell.date}
                type="button"
                className="pn-semana-dia"
                data-hoy={cell.date === today ? "" : undefined}
                aria-label={dayLabel(cell)}
                disabled={cell.status !== "open"}
                onClick={() => openDay(cell)}
              >
                <span className="pn-semana-nombre">{WEEKDAY_SHORT[isoWeekday(cell.date)]}</span>
                <span className="pn-semana-mitades">
                  {halves(cell, false)}
                  <span className="pn-semana-num">{cell.day}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="pn-principal">
        <section className="pn-cal pn-anima" style={orden(4)} aria-labelledby="admin-month">
          <div className="pn-cal-cabeza">
            <h2 id="admin-month" className="pn-mes">
              {monthName}
              <small>{month.slice(0, 4)}</small>
            </h2>
            <div className="pn-nav">
              {month !== firstMonth && (
                <Link href="/admin" scroll={false} className="pn-nav-boton">
                  Hoy
                </Link>
              )}
              {previous ? (
                <Link href={`/admin?mes=${previous}`} scroll={false} aria-label="Mes anterior" className="pn-nav-boton">
                  <Flecha izquierda />
                </Link>
              ) : (
                <span className="pn-nav-boton" aria-disabled="true" aria-label="Mes anterior">
                  <Flecha izquierda />
                </span>
              )}
              {next ? (
                <Link href={`/admin?mes=${next}`} scroll={false} aria-label="Mes siguiente" className="pn-nav-boton">
                  <Flecha />
                </Link>
              ) : (
                <span className="pn-nav-boton" aria-disabled="true" aria-label="Mes siguiente">
                  <Flecha />
                </span>
              )}
            </div>
          </div>

          <div className="pn-semanario" aria-hidden="true">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <ol className="pn-dias">
            {weeks.flat().map((cell, index) =>
              cell.status === "outside-month" ? (
                <li key={cell.date} aria-hidden="true" />
              ) : (
                <li key={cell.date} style={orden(index)}>
                  <button
                    type="button"
                    className="pn-dia"
                    disabled={cell.status !== "open"}
                    data-hoy={cell.date === today ? "" : undefined}
                    data-elegido={cell.date === selectedDate ? "" : undefined}
                    aria-label={dayLabel(cell)}
                    aria-pressed={cell.date === selectedDate}
                    onClick={() => openDay(cell)}
                  >
                    {halves(cell, true)}
                    <span className="pn-num">{cell.day}</span>
                  </button>
                </li>
              ),
            )}
          </ol>

          <p className="pn-leyenda">
            <span>
              <span className="pn-muestra" /> Libre
            </span>
            <span>
              <span className="pn-muestra" data-reservado="" /> Reservado
            </span>
            <span>Arriba mediodía · abajo noche</span>
          </p>
        </section>

        <aside className="pn-lado pn-anima" style={orden(5)}>
          <div className="pn-bloque pn-panel">
            {selected ? (
              dayActions(selected)
            ) : (
              <>
                <p className="pn-etiqueta">Día elegido</p>
                <p className="pn-vacio">Tocá un día del calendario, o de los próximos 7 días, para reservar o liberar sus módulos.</p>
              </>
            )}
          </div>

          <section className="pn-bloque" aria-labelledby="admin-upcoming">
            <h2 id="admin-upcoming" className="pn-bloque-titulo">
              Próximos reservados
              {effective.upcoming.length > 0 && (
                <small>
                  {effective.upcoming.length} {effective.upcoming.length === 1 ? "módulo" : "módulos"}
                </small>
              )}
            </h2>
            {upcomingDays.length === 0 ? (
              <p className="pn-vacio">No hay módulos reservados desde hoy.</p>
            ) : (
              <ul className="pn-lista">
                {upcomingDays.map(([date, list]) => (
                  <li key={date} className="pn-item">
                    <p className="pn-item-fecha">
                      <span>{WEEKDAY_SHORT[isoWeekday(date)]}</span>
                      <strong>{formatDayMonth(date)}</strong>
                    </p>
                    <div className="pn-item-modulos">
                      {list.map((block) => (
                        <div key={block.module} className="pn-item-modulo">
                          <span>{MODULE_WORDS[block.module].label}</span>
                          <button
                            type="button"
                            className="pn-liberar"
                            disabled={pending || block.id === ""}
                            aria-label={`Liberar ${MODULE_WORDS[block.module].label} del ${formatWeekdayDayMonth(block.date)}`}
                            onClick={() => toggle(block.date, block.module, block.id)}
                          >
                            Liberar
                          </button>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <BottomSheet open={sheetOpen} label={selected ? longDay(selected.date) : "Día"} onClose={() => setSheetOpen(false)}>
        {selected && dayActions(selected)}
        <button type="button" className="pn-sheet-cerrar" onClick={() => setSheetOpen(false)}>
          Cerrar
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

// Entrance order for the CSS stagger in admin.css (`--i`).
const orden = (i: number) => ({ "--i": i }) as CSSProperties;

// The state said with a drawing too: an empty circle is free, a tick is reserved.
function EstadoMarca({ reservado }: { reservado: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={reservado ? 1.8 : 1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="8.2" />
      {reservado && <path d="M6.2 10.4 8.8 13l5-5.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function Flecha({ izquierda }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path
        d={izquierda ? "M16 10H4.5M9 5.5 4.5 10 9 14.5" : "M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
