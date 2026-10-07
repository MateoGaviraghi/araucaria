"use client";

import { useEffect, useId, useState } from "react";
import { takenInMonth } from "@/app/admin/actions";
import {
  MODULE_ORDER,
  MODULE_WORDS,
  buildMonth,
  type AvailabilityEntry,
  type Choice,
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
import {
  DESDE_MAX,
  DESDE_MIN,
  HASTA_MAX,
  HORARIO,
  PASO,
  VENTANA,
  eleccionDe,
  hora,
  horarioDeHoras,
  modulosDeHorario,
  type Reserva,
} from "@/lib/reservas";
import { IconoFlecha } from "./iconos";
import { SelectorHora } from "./selector-hora";

export type DatosReserva = {
  date: IsoDate;
  choice: Choice;
  /** "Personalizado" hours in minutes from 00:00 of the date (D-050); null otherwise. */
  customFrom: number | null;
  customTo: number | null;
  clientName: string;
  clientPhone: string;
  notes: string;
};

const OPCIONES: Choice[] = ["mediodia", "noche", "dia-completo", "personalizado"];
const NOTAS_MAX = 500;

/** From..to in steps of PASO minutes. */
const pasos = (desde: number, hasta: number) => Array.from({ length: (hasta - desde) / PASO + 1 }, (_, i) => desde + i * PASO);
const HORAS_DESDE = pasos(DESDE_MIN, DESDE_MAX);

/** "Mediodía y Noche" */
const modulosEnPalabras = (modules: readonly ModuleCode[]) => modules.map((m) => MODULE_WORDS[m].label).join(" y ");
const SEMANA = ["L", "M", "M", "J", "V", "S", "D"];
const SEMANA_LARGA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const capitalizar = (texto: string) => `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;

// "Nueva reserva" (D-046, D-047): the month on one side, the chosen day's modules on the other, as in
// Origin UI's Appointment picker. Full days are struck out, days with something reserved carry a dot,
// and the modules already taken say "Ocupado": the owner picks a date already seeing what is free.
// D-050: a fourth choice, "Personalizado", with the hours agreed on WhatsApp; the notes; and the same
// form, filled in, edits a reservation (`inicial`), whose own modules then count as free.
export function NuevaReserva({
  fecha,
  inicial,
  guardando,
  alGuardar,
  alCancelar,
}: {
  fecha: IsoDate | null;
  inicial?: Reserva;
  guardando: boolean;
  alGuardar: (datos: DatosReserva) => void;
  alCancelar: () => void;
}) {
  const hoy = todayInBuenosAires();
  const ultimo = lastBookableDate(hoy);
  const primerMes = monthOf(hoy);
  const ultimoMes = monthOf(ultimo);

  const [mes, setMes] = useState<IsoMonth>(monthOf(inicial?.date ?? fecha ?? hoy));
  const [date, setDate] = useState<IsoDate | null>(inicial?.date ?? fecha);
  const [choice, setChoice] = useState<Choice | null>(inicial ? eleccionDe(inicial) : null);
  const [desde, setDesde] = useState<number | null>(inicial?.customFrom ?? null);
  const [hasta, setHasta] = useState<number | null>(inicial?.customTo ?? null);
  const [clientName, setClientName] = useState(inicial?.clientName ?? "");
  const [clientPhone, setClientPhone] = useState(inicial?.clientPhone?.replace(/^\+54/, "") ?? "");
  const [notes, setNotes] = useState(inicial?.notes ?? "");
  const [ocupados, setOcupados] = useState<{ mes: IsoMonth; lista: AvailabilityEntry[] } | null>(null);
  const [intento, setIntento] = useState(false);
  const id = useId();

  useEffect(() => {
    let vigente = true;
    takenInMonth({ month: mes, except: inicial?.id ?? undefined }).then((result) => {
      if (vigente && result.ok && result.data) setOcupados({ mes, lista: result.data.taken });
    });
    return () => {
      vigente = false;
    };
  }, [mes, inicial?.id]);

  const cargando = ocupados?.mes !== mes;
  const semanas = buildMonth(mes, cargando ? [] : (ocupados?.lista ?? []), hoy, ultimo);
  const celdaElegida = date ? semanas.flat().find((c) => c.date === date && c.status !== "outside-month") : undefined;
  // The chosen day can be in another month than the one on screen: its modules are unknown until it is shown.
  const tomados: ModuleCode[] | null = celdaElegida && !cargando ? MODULE_ORDER.filter((m) => celdaElegida.modules[m] !== null) : null;
  // "Personalizado" fits any open day; whether its hours fit is checked below.
  const libre = (opcion: Choice) =>
    tomados !== null &&
    (opcion === "personalizado" ||
      (opcion === "dia-completo" ? MODULE_ORDER.every((m) => !tomados.includes(m)) : !tomados.includes(opcion)));
  const eleccion = choice && libre(choice) ? choice : null;
  const personalizado = eleccion === "personalizado";
  const conHoras = desde !== null && hasta !== null;
  const ocupa = conHoras ? modulosDeHorario(desde, hasta) : [];
  const pisa = ocupa.filter((m) => tomados?.includes(m));
  // An hour inside a module already taken: a start can't be in [inicio, fin), an end in (inicio, fin].
  const pisaHora = (minutos: number, extremo: "desde" | "hasta") =>
    (tomados ?? []).some((m) => {
      const [inicio, fin] = VENTANA[m];
      return extremo === "desde" ? minutos >= inicio && minutos < fin : minutos > inicio && minutos <= fin;
    });
  const digitos = clientPhone.replace(/\D/g, "");
  const [nombreMes = ""] = formatMonthTitle(mes).split(" de ");

  const errores = {
    date: !date ? "Elegí un día en el calendario." : null,
    choice: date && !eleccion ? "Elegí el módulo." : null,
    horas: !personalizado
      ? null
      : !conHoras
        ? "Elegí desde y hasta qué hora."
        : pisa.length
          ? `Ese horario se superpone con ${modulosEnPalabras(pisa)}, ya reservado.`
          : null,
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
        alGuardar({
          date,
          choice: eleccion,
          customFrom: personalizado ? desde : null,
          customTo: personalizado ? hasta : null,
          clientName: clientName.trim(),
          clientPhone: digitos,
          notes: notes.trim(),
        });
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
                    <span className="pn-opcion-detalle">
                      {tomados === null
                        ? "Revisando…"
                        : !disponible
                          ? "Ocupado"
                          : opcion !== "personalizado"
                            ? HORARIO[opcion]
                            : conHoras
                              ? horarioDeHoras(desde, hasta)
                              : "Otro horario"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {intento && errores.choice && <p className="pn-campo-error">{errores.choice}</p>}
          {personalizado && (
            <div className="pn-horas">
              <div className="pn-campo">
                <span className="pn-campo-etiqueta" id={`${id}-desde-etiqueta`}>
                  Desde
                </span>
                <SelectorHora
                  id={`${id}-desde`}
                  etiquetaId={`${id}-desde-etiqueta`}
                  valor={desde}
                  opciones={HORAS_DESDE.map((m) => ({ valor: m, texto: hora(m), apagada: pisaHora(m, "desde") }))}
                  invalido={Boolean(intento && errores.horas && desde === null)}
                  alCambiar={(nuevo) => {
                    setDesde(nuevo);
                    if (hasta !== null && hasta <= nuevo) setHasta(null);
                  }}
                />
              </div>
              <div className="pn-campo">
                <span className="pn-campo-etiqueta" id={`${id}-hasta-etiqueta`}>
                  Hasta
                </span>
                <SelectorHora
                  id={`${id}-hasta`}
                  etiquetaId={`${id}-hasta-etiqueta`}
                  valor={hasta}
                  opciones={pasos((desde ?? DESDE_MIN) + PASO, HASTA_MAX).map((m) => ({
                    valor: m,
                    texto: hora(m),
                    nota: m >= 1440 ? "día siguiente" : undefined,
                    notaCorta: m >= 1440 ? "+1 día" : undefined,
                    apagada: pisaHora(m, "hasta"),
                  }))}
                  invalido={Boolean(intento && errores.horas && hasta === null)}
                  alCambiar={setHasta}
                />
              </div>
              {conHoras && !pisa.length && (
                <p className="pn-campo-nota pn-horas-nota">
                  {ocupa.length
                    ? `En el sitio se ve ocupado: ${modulosEnPalabras(ocupa)}.`
                    : "No pisa ningún módulo: en el sitio el día sigue libre."}
                </p>
              )}
              {intento && errores.horas && <p className="pn-campo-error pn-horas-nota">{errores.horas}</p>}
            </div>
          )}
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
              placeholder="342 123 4567"
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

      <div className="pn-campo">
        <label className="pn-campo-etiqueta" htmlFor={`${id}-notas`}>
          Notas <span className="pn-opcional">(opcional)</span>
        </label>
        <textarea
          id={`${id}-notas`}
          className="pn-input pn-notas"
          rows={3}
          maxLength={NOTAS_MAX}
          placeholder="Lo que tengas que recordar de esta reserva"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          aria-describedby={`${id}-notas-ayuda`}
        />
        <p id={`${id}-notas-ayuda`} className="pn-campo-nota">
          Se borran solas 90 días después de la fecha, como el nombre y el teléfono.
        </p>
      </div>

      <div className="pn-form-acciones">
        <button type="button" className="pn-boton" onClick={alCancelar}>
          Volver
        </button>
        <button type="submit" className="pn-boton pn-boton-primario" disabled={guardando}>
          {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Guardar reserva"}
        </button>
      </div>
    </form>
  );
}
