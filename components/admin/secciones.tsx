"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { MODULE_ORDER, buildMonth, type DayCell } from "@/components/calendar/month";
import {
  addDays,
  addMonthsToMonth,
  formatLongDate,
  formatMonthTitle,
  isoWeekday,
  monthOf,
  type IsoDate,
  type IsoMonth,
} from "@/lib/dates";
import {
  HORARIO,
  cuandoTexto,
  diaCorto,
  diaLargo,
  diasEntre,
  eleccionDe,
  moduloTexto,
  nombreTexto,
  telefonoTexto,
  whatsapp,
  type Reserva,
} from "@/lib/reservas";
import { IconoBuscar, IconoFlecha, IconoMas, IconoTelefono } from "./iconos";
import { usePanel } from "./panel-marco";

// The three sections of the owner panel (D-046). Everything is said in words: a reservation reads
// "Noche · Juan Pérez", never a colour or a half of a square.

const orden = (i: number) => ({ "--i": i }) as CSSProperties;
const sinAnio = (date: IsoDate) => formatLongDate(date).replace(/ de \d{4}$/, "");
const DIA_SEMANA = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function Cabeza({ titulo, bajada, children }: { titulo: string; bajada: string; children?: React.ReactNode }) {
  return (
    <header className="pn-cabeza pn-anima">
      <div>
        <h1 className="pn-titulo">{titulo}</h1>
        <p className="pn-bajada">{bajada}</p>
      </div>
      {children && <div className="pn-cabeza-acciones">{children}</div>}
    </header>
  );
}

function BotonNueva({ fecha, texto = "Nueva reserva" }: { fecha?: IsoDate; texto?: string }) {
  const { nuevaReserva } = usePanel();
  return (
    <button type="button" className="pn-boton pn-boton-primario" onClick={() => nuevaReserva(fecha)}>
      <IconoMas />
      {texto}
    </button>
  );
}

function Telefono({ phone }: { phone: string | null }) {
  if (!phone) return <span className="pn-apagado">Sin teléfono</span>;
  return (
    <a className="pn-telefono-link" href={whatsapp(phone)} target="_blank" rel="noopener">
      <IconoTelefono />
      {telefonoTexto(phone)}
    </a>
  );
}

function Modulo({ reserva }: { reserva: Reserva }) {
  return (
    <span className="pn-modulo-texto">
      {moduloTexto(reserva.modules)} <span>{HORARIO[eleccionDe(reserva.modules)]}</span>
    </span>
  );
}

/** One reservation in a list: date, who, module, phone and "Cancelar". */
function FilaReserva({ reserva, pasada = false }: { reserva: Reserva; pasada?: boolean }) {
  const { verReserva, cancelarReserva, ocupado } = usePanel();
  return (
    <li className="pn-fila">
      <button type="button" className="pn-fila-fecha" onClick={() => verReserva(reserva)} aria-label={`Ver la reserva de ${nombreTexto(reserva)}`}>
        <span>{DIA_SEMANA[isoWeekday(reserva.date)]}</span>
        <strong>{reserva.date.slice(8, 10)}/{reserva.date.slice(5, 7)}</strong>
      </button>
      <div className="pn-fila-datos">
        <p className="pn-fila-nombre" data-sin-datos={reserva.clientName ? undefined : ""}>
          {nombreTexto(reserva)}
        </p>
        <p className="pn-fila-meta">
          <Modulo reserva={reserva} />
          <Telefono phone={reserva.clientPhone} />
        </p>
      </div>
      {!pasada && (
        <button type="button" className="pn-boton pn-boton-peligro" disabled={ocupado} onClick={() => cancelarReserva(reserva)}>
          Cancelar
        </button>
      )}
    </li>
  );
}

// ---------------------------------------------------------------- Inicio

export function Inicio({
  today,
  proximas,
  delMes,
}: {
  today: IsoDate;
  proximas: Reserva[];
  delMes: Reserva[];
}) {
  const { nuevaReserva, verReserva } = usePanel();
  const siguiente = proximas[0] ?? null;
  const mes = monthOf(today);
  const [nombreMes = ""] = formatMonthTitle(mes).split(" de ");

  const libres = buildMonth(mes, delMes.flatMap((r) => r.modules.map((module) => ({ date: r.date, module }))), today, addDays(today, 400))
    .flat()
    .filter((c) => c.status === "open" && MODULE_ORDER.every((m) => c.modules[m] === null)).length;

  const semana = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return { date, reservas: proximas.filter((r) => r.date === date) };
  });

  return (
    <>
      <Cabeza titulo="Inicio" bajada={`Hoy es ${sinAnio(today)}`}>
        <BotonNueva />
      </Cabeza>

      <div className="pn-tarjetas">
        <section className="pn-tarjeta pn-tarjeta-solida pn-anima" style={orden(1)} aria-labelledby="pn-t1">
          <h2 id="pn-t1" className="pn-etiqueta">
            Próxima reserva
          </h2>
          {siguiente ? (
            <button type="button" className="pn-tarjeta-accion" onClick={() => verReserva(siguiente)}>
              <span className="pn-cifra">{diaCorto(siguiente.date)}</span>
              <span className="pn-tarjeta-pie">
                <strong>{moduloTexto(siguiente.modules)}</strong> · {nombreTexto(siguiente)} · {cuandoTexto(diasEntre(today, siguiente.date))}
              </span>
            </button>
          ) : (
            <>
              <p className="pn-cifra">Ninguna</p>
              <p className="pn-tarjeta-pie">No hay reservas desde hoy.</p>
            </>
          )}
        </section>

        <section className="pn-tarjeta pn-anima" style={orden(2)} aria-labelledby="pn-t2">
          <h2 id="pn-t2" className="pn-etiqueta">
            Reservas en {nombreMes.toLowerCase()}
          </h2>
          <p className="pn-cifra">{delMes.length}</p>
          <p className="pn-tarjeta-pie">{delMes.filter((r) => r.date >= today).length} desde hoy hasta fin de mes</p>
        </section>

        <section className="pn-tarjeta pn-anima" style={orden(3)} aria-labelledby="pn-t3">
          <h2 id="pn-t3" className="pn-etiqueta">
            Días libres en {nombreMes.toLowerCase()}
          </h2>
          <p className="pn-cifra">{libres}</p>
          <p className="pn-tarjeta-pie">sin nada reservado, de hoy a fin de mes</p>
        </section>
      </div>

      <div className="pn-inicio-cuerpo">
        <section className="pn-bloque pn-anima" style={orden(4)} aria-labelledby="pn-semana">
          <div className="pn-bloque-cabeza">
            <h2 id="pn-semana" className="pn-bloque-titulo">
              Los próximos 7 días
            </h2>
            <Link className="pn-link" href="/admin/calendario">
              Ver el calendario
            </Link>
          </div>
          <ol className="pn-semana">
            {semana.map(({ date, reservas }) => (
              <li key={date} className="pn-semana-dia" data-hoy={date === today ? "" : undefined}>
                <p className="pn-semana-fecha">
                  <span>{date === today ? "Hoy" : DIA_SEMANA[isoWeekday(date)]}</span>
                  <strong>{Number(date.slice(8, 10))}</strong>
                </p>
                <div className="pn-semana-reservas">
                  {reservas.map((r) => (
                    <button key={r.clave} type="button" className="pn-chip" onClick={() => verReserva(r)}>
                      <strong>{moduloTexto(r.modules)}</strong>
                      <span>{nombreTexto(r)}</span>
                    </button>
                  ))}
                  {reservas.flatMap((r) => r.modules).length < MODULE_ORDER.length && (
                    <button type="button" className="pn-libre" onClick={() => nuevaReserva(date)}>
                      {reservas.length ? "Reservar lo libre" : "Libre · reservar"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="pn-bloque pn-anima" style={orden(5)} aria-labelledby="pn-proximas">
          <div className="pn-bloque-cabeza">
            <h2 id="pn-proximas" className="pn-bloque-titulo">
              Próximas reservas
            </h2>
            <Link className="pn-link" href="/admin/reservas">
              Ver todas
            </Link>
          </div>
          {proximas.length === 0 ? (
            <p className="pn-vacio">Todavía no hay reservas. Cargá la primera con «Nueva reserva».</p>
          ) : (
            <ul className="pn-lista">
              {proximas.slice(0, 5).map((r) => (
                <FilaReserva key={r.clave} reserva={r} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Reservas

export function Reservas({ proximas, pasadas }: { proximas: Reserva[]; pasadas: Reserva[] }) {
  const [pestana, setPestana] = useState<"proximas" | "pasadas">("proximas");
  const [busqueda, setBusqueda] = useState("");
  const lista = pestana === "proximas" ? proximas : pasadas;
  const termino = busqueda.trim().toLowerCase();
  const filtradas = termino
    ? lista.filter((r) => (r.clientName ?? "").toLowerCase().includes(termino) || (r.clientPhone ?? "").includes(termino.replace(/\D/g, "") || "—"))
    : lista;

  return (
    <>
      <Cabeza titulo="Reservas" bajada="Todas las reservas del salón, con quién reservó y su teléfono.">
        <BotonNueva />
      </Cabeza>

      <section className="pn-bloque pn-anima" style={orden(1)} aria-label="Lista de reservas">
        <div className="pn-herramientas">
          <div className="pn-pestanas" role="tablist" aria-label="Qué reservas ver">
            <button type="button" role="tab" aria-selected={pestana === "proximas"} onClick={() => setPestana("proximas")}>
              Próximas <span>{proximas.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={pestana === "pasadas"} onClick={() => setPestana("pasadas")}>
              Pasadas <span>{pasadas.length}</span>
            </button>
          </div>
          <label className="pn-buscar">
            <IconoBuscar />
            <span className="pn-oculto">Buscar por nombre o teléfono</span>
            <input type="search" placeholder="Buscar por nombre o teléfono" value={busqueda} onChange={(e) => setBusqueda(e.currentTarget.value)} />
          </label>
        </div>

        {filtradas.length === 0 ? (
          <p className="pn-vacio">
            {termino
              ? "Ninguna reserva coincide con la búsqueda."
              : pestana === "proximas"
                ? "No hay reservas desde hoy. Cargá una con «Nueva reserva»."
                : "Todavía no hay reservas pasadas."}
          </p>
        ) : (
          <ul className="pn-lista" role="tabpanel">
            {filtradas.map((r) => (
              <FilaReserva key={r.clave} reserva={r} pasada={pestana === "pasadas"} />
            ))}
          </ul>
        )}
        {pestana === "pasadas" && (
          <p className="pn-campo-nota">El nombre y el teléfono se borran solos 90 días después de cada fecha.</p>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------- Calendario

const SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function Calendario({
  month,
  reservas,
  today,
  lastBookable,
  firstMonth,
  lastMonth,
}: {
  month: IsoMonth;
  reservas: Reserva[];
  today: IsoDate;
  lastBookable: IsoDate;
  firstMonth: IsoMonth;
  lastMonth: IsoMonth;
}) {
  const { nuevaReserva, verReserva } = usePanel();
  const semanas = buildMonth(month, reservas.flatMap((r) => r.modules.map((module) => ({ date: r.date, module }))), today, lastBookable);
  const delDia = (date: IsoDate) => reservas.filter((r) => r.date === date);
  const lleno = (cell: DayCell) => MODULE_ORDER.every((m) => cell.modules[m] !== null);
  const [nombreMes = ""] = formatMonthTitle(month).split(" de ");
  const anterior = month > firstMonth ? addMonthsToMonth(month, -1) : null;
  const siguiente = month < lastMonth ? addMonthsToMonth(month, 1) : null;
  // En el celular la agenda arranca hoy: los días que ya pasaron empujarían hoy hacia abajo, y sus
  // reservas están en Reservas › Pasadas.
  const dias = semanas.flat().filter((c) => c.status !== "outside-month" && c.status !== "past");

  const navegacion = (
    <div className="pn-nav">
      {month !== firstMonth && (
        <Link href="/admin/calendario" scroll={false} className="pn-boton">
          Hoy
        </Link>
      )}
      {anterior ? (
        <Link href={`/admin/calendario?mes=${anterior}`} scroll={false} aria-label="Mes anterior" className="pn-icono-boton pn-icono-borde">
          <IconoFlecha izquierda />
        </Link>
      ) : (
        <span className="pn-icono-boton pn-icono-borde" aria-disabled="true" aria-label="Mes anterior">
          <IconoFlecha izquierda />
        </span>
      )}
      {siguiente ? (
        <Link href={`/admin/calendario?mes=${siguiente}`} scroll={false} aria-label="Mes siguiente" className="pn-icono-boton pn-icono-borde">
          <IconoFlecha />
        </Link>
      ) : (
        <span className="pn-icono-boton pn-icono-borde" aria-disabled="true" aria-label="Mes siguiente">
          <IconoFlecha />
        </span>
      )}
    </div>
  );

  return (
    <>
      <Cabeza titulo="Calendario" bajada="Tocá una reserva para verla o cancelarla; tocá un día libre para reservarlo.">
        <BotonNueva />
      </Cabeza>

      <section className="pn-bloque pn-cal pn-anima" style={orden(1)} aria-labelledby="pn-mes">
        <div className="pn-cal-cabeza">
          <h2 id="pn-mes" className="pn-mes">
            {nombreMes} <small>{month.slice(0, 4)}</small>
          </h2>
          {navegacion}
        </div>

        {/* Escritorio: la grilla del mes, con cada reserva escrita adentro del día. */}
        <div className="pn-grilla-cabeza" aria-hidden="true">
          {SEMANA.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <ol className="pn-grilla">
          {semanas.flat().map((cell, i) =>
            cell.status === "outside-month" ? (
              <li key={cell.date} className="pn-celda" data-fuera="" aria-hidden="true" />
            ) : (
              <li
                key={cell.date}
                className="pn-celda"
                style={orden(i)}
                data-pasado={cell.status === "past" ? "" : undefined}
                data-hoy={cell.date === today ? "" : undefined}
              >
                <span className="pn-celda-num">{cell.day}</span>
                <div className="pn-celda-reservas">
                  {delDia(cell.date).map((r) => (
                    <button key={r.clave} type="button" className="pn-chip" onClick={() => verReserva(r)}>
                      <strong>{moduloTexto(r.modules)}</strong>
                      <span>{nombreTexto(r)}</span>
                    </button>
                  ))}
                </div>
                {cell.status === "open" && !lleno(cell) && (
                  <button
                    type="button"
                    className="pn-celda-agregar"
                    aria-label={`Reservar el ${diaLargo(cell.date)}`}
                    onClick={() => nuevaReserva(cell.date)}
                  >
                    <IconoMas />
                    <span>Reservar</span>
                  </button>
                )}
              </li>
            ),
          )}
        </ol>

        {/* Celular: el mismo mes como agenda, un renglón por día. */}
        <ol className="pn-agenda">
          {dias.map((cell) => {
            const lista = delDia(cell.date);
            return (
              <li
                key={cell.date}
                className="pn-agenda-dia"
                data-pasado={cell.status === "past" ? "" : undefined}
                data-hoy={cell.date === today ? "" : undefined}
              >
                <p className="pn-agenda-fecha">
                  <span>{DIA_SEMANA[isoWeekday(cell.date)]}</span>
                  <strong>{cell.day}</strong>
                </p>
                <div className="pn-agenda-reservas">
                  {lista.map((r) => (
                    <button key={r.clave} type="button" className="pn-chip" onClick={() => verReserva(r)}>
                      <strong>{moduloTexto(r.modules)}</strong>
                      <span>{nombreTexto(r)}</span>
                    </button>
                  ))}
                  {cell.status === "open" && !lleno(cell) ? (
                    <button type="button" className="pn-libre" onClick={() => nuevaReserva(cell.date)}>
                      {lista.length ? "Reservar lo libre" : "Libre · reservar"}
                    </button>
                  ) : (
                    lista.length === 0 && <span className="pn-apagado">{cell.status === "past" ? "Ya pasó" : "—"}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

