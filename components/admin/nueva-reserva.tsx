"use client";

import { useEffect, useId, useState } from "react";
import { takenModules } from "@/app/admin/actions";
import { MODULE_ORDER, MODULE_WORDS, type BlockChoice, type ModuleCode } from "@/components/calendar/month";
import { lastBookableDate, todayInBuenosAires, type IsoDate } from "@/lib/dates";
import { HORARIO } from "@/lib/reservas";

export type DatosReserva = { date: IsoDate; choice: BlockChoice; clientName: string; clientPhone: string };

const OPCIONES: BlockChoice[] = ["mediodia", "noche", "dia-completo"];

// "Nueva reserva" (D-046): date, module, name and an optional phone. The modules already taken on the
// chosen date are shown disabled and say so, read from the server when the date changes.
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
  const [date, setDate] = useState<IsoDate>(fecha ?? "");
  const [choice, setChoice] = useState<BlockChoice | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [ocupados, setOcupados] = useState<{ date: IsoDate; modules: ModuleCode[] } | null>(null);
  const [intento, setIntento] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!date) return;
    let vigente = true;
    takenModules({ date }).then((result) => {
      if (vigente && result.ok && result.data) setOcupados({ date, modules: result.data.modules });
    });
    return () => {
      vigente = false;
    };
  }, [date]);

  const tomados = ocupados?.date === date ? ocupados.modules : [];
  const cargando = Boolean(date) && ocupados?.date !== date;
  const libre = (opcion: BlockChoice) =>
    opcion === "dia-completo" ? MODULE_ORDER.every((m) => !tomados.includes(m)) : !tomados.includes(opcion);
  const eleccion = choice && libre(choice) ? choice : null;
  const digitos = clientPhone.replace(/\D/g, "");

  const errores = {
    date: !date ? "Elegí la fecha." : null,
    choice: !eleccion ? "Elegí el módulo." : null,
    clientName: !clientName.trim() ? "Escribí el nombre de quien reserva." : null,
    clientPhone: digitos && !/^[1-9][0-9]{9}$/.test(digitos) ? "Son 10 números, sin el 0 ni el 15." : null,
  };
  const valido = !Object.values(errores).some(Boolean);
  const todosOcupados = Boolean(date) && !cargando && OPCIONES.every((opcion) => !libre(opcion));

  return (
    <form
      className="pn-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setIntento(true);
        if (!valido || !eleccion || guardando) return;
        alGuardar({ date, choice: eleccion, clientName: clientName.trim(), clientPhone: digitos });
      }}
    >
      <div className="pn-campo">
        <label className="pn-campo-etiqueta" htmlFor={`${id}-fecha`}>
          Fecha
        </label>
        <input
          id={`${id}-fecha`}
          className="pn-input"
          type="date"
          min={hoy}
          max={lastBookableDate(hoy)}
          value={date}
          onChange={(event) => setDate(event.currentTarget.value)}
          aria-invalid={intento && errores.date ? true : undefined}
          required
        />
        {intento && errores.date && <p className="pn-campo-error">{errores.date}</p>}
      </div>

      <fieldset className="pn-campo">
        <legend className="pn-campo-etiqueta">Módulo</legend>
        <div className="pn-opciones" aria-busy={cargando || undefined}>
          {OPCIONES.map((opcion) => {
            const disponible = Boolean(date) && !cargando && libre(opcion);
            return (
              <label key={opcion} className="pn-opcion" data-ocupado={date && !cargando && !libre(opcion) ? "" : undefined}>
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
                  {!date ? HORARIO[opcion] : cargando ? "Revisando…" : libre(opcion) ? HORARIO[opcion] : "Ocupado"}
                </span>
              </label>
            );
          })}
        </div>
        {todosOcupados && <p className="pn-campo-nota">Ese día ya está reservado entero.</p>}
        {intento && errores.choice && !todosOcupados && <p className="pn-campo-error">{errores.choice}</p>}
      </fieldset>

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
