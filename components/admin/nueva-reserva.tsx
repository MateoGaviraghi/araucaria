"use client";

import { useEffect, useId, useState } from "react";
import { takenInMonth } from "@/app/admin/actions";
import {
  MODULE_ORDER,
  MODULE_WORDS,
  buildMonth,
  type AvailabilityEntry,
  type BlockChoice,
  type ModuleCode,
} from "@/components/calendar/month";
import {
  addMonthsToMonth,
  formatLongDate,
  formatMonthTitle,
  lastBookableDate,
  monthOf,
  todayInBuenosAires,
  type IsoDate,
  type IsoMonth,
} from "@/lib/dates";
import { HORARIO } from "@/lib/reservas";
import { IconoFlecha } from "./iconos";

export type DatosReserva = { date: IsoDate; choice: BlockChoice; clientName: string; clientPhone: string };

const OPCIONES: BlockChoice[] = ["mediodia", "noche", "dia-completo"];
const SEMANA = ["L", "M", "M", "J", "V", "S", "D"];
const SEMANA_LARGA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const capitalizar = (texto: string) => `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;

// "Nueva reserva" (D-046, D-047): the month on one side, the chosen day's modules on the other, as in
// Origin UI's Appointment picker. Full days are struck out, days with something reserved carry a dot,
// and the modules already taken say "Ocupado": the owner picks a date already seeing what is free.
export function NuevaReserva({
  fecha,
  guardando,
  alGuardar,
  alCancelar,
}: {
  fecha: IsoDate | null;
  guardando: boolean;
  alGuardar: (datos: DatosReserva) => void;
  alCancelar: () => void;
}) {
  const hoy = todayInBuenosAires();
  const ultimo = lastBookableDate(hoy);
  const primerMes = monthOf(hoy);
  const ultimoMes = monthOf(ultimo);

  const [mes, setMes] = useState<IsoMonth>(monthOf(fecha ?? hoy));
  const [date, setDate] = useState<IsoDate | null>(fecha);
  const [choice, setChoice] = useState<BlockChoice | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [ocupados, setOcupados] = useState<{ mes: IsoMonth; lista: AvailabilityEntry[] } | null>(null);
  const [intento, setIntento] = useState(false);
  const id = useId();

  useEffect(() => {
    let vigente = true;
    takenInMonth({ month: mes }).then((result) => {
      if (vigente && result.ok && result.data) setOcupados({ mes, lista: result.data.taken });
    });
    return () => {
      vigente = false;
    };
  }, [mes]);

  const cargando = ocupados?.mes !== mes;
  const semanas = buildMonth(mes, cargando ? [] : (ocupados?.lista ?? []), hoy, ultimo);
  const celdaElegida = date ? semanas.flat().find((c) => c.date === date && c.status !== "outside-month") : undefined;
  // The chosen day can be in another month than the one on screen: its modules are unknown until it is shown.
  const tomados: ModuleCode[] | null = celdaElegida && !cargando ? MODULE_ORDER.filter((m) => celdaElegida.modules[m] !== null) : null;
  const libre = (opcion: BlockChoice) =>
    tomados !== null && (opcion === "dia-completo" ? MODULE_ORDER.every((m) => !tomados.includes(m)) : !tomados.includes(opcion));
  const eleccion = choice && libre(choice) ? choice : null;
  const digitos = clientPhone.replace(/\D/g, "");
  const [nombreMes = ""] = formatMonthTitle(mes).split(" de ");

  const errores = {
    date: !date ? "Elegí un día en el calendario." : null,
    choice: date && !eleccion ? "Elegí el módulo." : null,
    clientName: !clientName.trim() ? "Escribí el nombre de quien reserva." : null,
    clientPhone: digitos && !/^[1-9][0-9]{9}$/.test(digitos) ? "Son 10 números, sin el 0 ni el 15." : null,
  };
  const valido = !Object.values(errores).some(Boolean);

  function elegirDia(nueva: IsoDate) {
    setDate(nueva);
    setChoice(null);
  }

  return (
    <form
      className="pn-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setIntento(true);
        if (!valido || !eleccion || !date || guardando) return;
        alGuardar({ date, choice: eleccion, clientName: clientName.trim(), clientPhone: digitos });
      }}
    >
      <div className="pn-agendar">
        <div className="pn-cal-mini" aria-busy={cargando || undefined}>
          <div className="pn-cal-mini-cabeza">
            <button
              type="button"
              className="pn-icono-boton"
              aria-label="Mes anterior"
              disabled={mes <= primerMes}
              onClick={() => setMes(addMonthsToMonth(mes, -1))}
            >
              <IconoFlecha izquierda />
            </button>
            <p className="pn-cal-mini-mes" id={`${id}-mes`} aria-live="polite">
              {nombreMes} {mes.slice(0, 4)}
            </p>
            <button
              type="button"
              className="pn-icono-boton"
              aria-label="Mes siguiente"
              disabled={mes >= ultimoMes}
              onClick={() => setMes(addMonthsToMonth(mes, 1))}
            >
              <IconoFlecha />
            </button>
          </div>
          <div className="pn-cal-mini-semana" aria-hidden="true">
            {SEMANA.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="pn-cal-mini-dias" role="group" aria-labelledby={`${id}-mes`}>
            {semanas.flat().map((cell, i) => {
              if (cell.status === "outside-month") return <span key={cell.date} aria-hidden="true" />;
              const reservados = MODULE_ORDER.filter((m) => cell.modules[m] !== null).length;
              const lleno = reservados === MODULE_ORDER.length;
              const abierto = cell.status === "open" && !lleno && !cargando;
              const estado =
                cell.status === "past"
                  ? "ya pasó"
                  : cell.status === "beyond-horizon"
                    ? "fuera de fecha"
                    : cargando
                      ? "revisando"
                      : lleno
                        ? "completo"
                        : reservados
                          ? "con un módulo reservado"
                          : "libre";
              return (
                <button
                  key={cell.date}
                  type="button"
                  className="pn-cal-mini-dia"
                  data-hoy={cell.date === hoy ? "" : undefined}
                  data-elegido={cell.date === date ? "" : undefined}
                  data-lleno={lleno ? "" : undefined}
                  data-algo={!lleno && reservados ? "" : undefined}
                  disabled={!abierto}
                  aria-pressed={cell.date === date}
                  aria-label={`${SEMANA_LARGA[i % 7]} ${cell.day}, ${estado}`}
                  onClick={() => elegirDia(cell.date)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
          <p className="pn-cal-mini-leyenda">
            <span>
              <i data-algo="" aria-hidden="true" /> Algo reservado
            </span>
            <span>
              <s aria-hidden="true">12</s> Completo
            </span>
          </p>
          {intento && errores.date && <p className="pn-campo-error">{errores.date}</p>}
        </div>

        <fieldset className="pn-campo pn-agendar-modulos">
          <legend className="pn-campo-etiqueta">
            {date ? capitalizar(formatLongDate(date).replace(/ de \d{4}$/, "")) : "Elegí un día"}
          </legend>
          {!date ? (
            <p className="pn-campo-nota">Tocá un día del calendario para ver sus módulos.</p>
          ) : (
            <div className="pn-opciones">
              {OPCIONES.map((opcion) => {
                const disponible = libre(opcion);
                return (
                  <label
                    key={opcion}
                    className="pn-opcion"
                    data-ocupado={tomados !== null && !disponible ? "" : undefined}
                  >
                    <input
                      type="radio"
                      name={`${id}-modulo`}
                      value={opcion}
                      checked={eleccion === opcion}
                      disabled={!disponible}
                      onChange={() => setChoice(opcion)}
                    />
                    <span className="pn-opcion-nombre">{MODULE_WORDS[opcion].label}</span>
                    <span className="pn-opcion-detalle">{tomados === null ? "Revisando…" : disponible ? HORARIO[opcion] : "Ocupado"}</span>
                  </label>
                );
              })}
            </div>
          )}
          {intento && errores.choice && <p className="pn-campo-error">{errores.choice}</p>}
        </fieldset>
      </div>

      <div className="pn-form-fila">
        <div className="pn-campo">
          <label className="pn-campo-etiqueta" htmlFor={`${id}-nombre`}>
            Nombre de quien reserva
          </label>
          <input
            id={`${id}-nombre`}
            className="pn-input"
            type="text"
            autoComplete="off"
            maxLength={80}
            value={clientName}
            onChange={(event) => setClientName(event.currentTarget.value)}
            aria-invalid={intento && errores.clientName ? true : undefined}
            required
          />
          {intento && errores.clientName && <p className="pn-campo-error">{errores.clientName}</p>}
        </div>

        <div className="pn-campo">
          <label className="pn-campo-etiqueta" htmlFor={`${id}-telefono`}>
            Teléfono <span className="pn-opcional">(opcional)</span>
          </label>
          <div className="pn-telefono">
            <span aria-hidden="true">+54</span>
            <input
              id={`${id}-telefono`}
              className="pn-input"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="342 516 2081"
              maxLength={16}
              value={clientPhone}
              onChange={(event) => setClientPhone(event.currentTarget.value)}
              aria-invalid={intento && errores.clientPhone ? true : undefined}
              aria-describedby={`${id}-telefono-ayuda`}
            />
          </div>
          <p id={`${id}-telefono-ayuda`} className="pn-campo-nota">
            Celular con característica, sin el 0 ni el 15.
          </p>
          {intento && errores.clientPhone && <p className="pn-campo-error">{errores.clientPhone}</p>}
        </div>
      </div>

      <div className="pn-form-acciones">
        <button type="button" className="pn-boton" onClick={alCancelar}>
          Volver
        </button>
        <button type="submit" className="pn-boton pn-boton-primario" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar reserva"}
        </button>
      </div>
    </form>
  );
}
