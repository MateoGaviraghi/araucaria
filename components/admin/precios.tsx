"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { updateModuleSettings } from "@/app/admin/actions";
import { MODULE_WORDS, type BlockChoice } from "@/components/calendar/month";
import { CODIGOS_AJUSTE, PRECIO_MAX, precioTexto, type AjusteModulo, type Ajustes } from "@/lib/ajustes";
import { DESDE_MAX, DESDE_MIN, HASTA_MAX, PASO, hora } from "@/lib/reservas";
import { Cabeza, orden } from "./secciones";
import { SelectorHora } from "./selector-hora";

// "Precios y horarios" (D-053): the owner changes each module's hours and price, for the summer or a
// new price list, without asking anyone. Saving updates the public site at once (calendar, footer,
// the WhatsApp message). Built from the panel's own pieces: the hour dropdown of D-051, the field
// with a fixed prefix of the phone ("$" here), the blocks of every section.

const pasos = (desde: number, hasta: number) => Array.from({ length: (hasta - desde) / PASO + 1 }, (_, i) => desde + i * PASO);
const HORAS_DESDE = pasos(DESDE_MIN, DESDE_MAX).map((m) => ({ valor: m, texto: hora(m) }));
const horasHasta = (desde: number) =>
  pasos(desde + PASO, HASTA_MAX).map((m) => ({
    valor: m,
    texto: hora(m),
    nota: m >= 1440 ? "día siguiente" : undefined,
    notaCorta: m >= 1440 ? "+1 día" : undefined,
  }));

/** "260.000" while typing; the stored value is whole pesos. */
const miles = (pesos: number) => new Intl.NumberFormat("es-AR").format(pesos);
const horarioPublico = (a: AjusteModulo) => `${hora(a.desde)} a ${hora(a.hasta)} hs`;

const iguales = (a: Ajustes, b: Ajustes) =>
  CODIGOS_AJUSTE.every((c) => a[c].desde === b[c].desde && a[c].hasta === b[c].hasta && a[c].precio === b[c].precio);

export function Precios({ ajustes }: { ajustes: Ajustes }) {
  const router = useRouter();
  const id = useId();
  const [guardados, setGuardados] = useState(ajustes);
  const [valores, setValores] = useState(ajustes);
  const [precios, setPrecios] = useState(() =>
    Object.fromEntries(CODIGOS_AJUSTE.map((c) => [c, miles(ajustes[c].precio)])) as Record<BlockChoice, string>,
  );
  const [estado, setEstado] = useState<{ tono: "bien" | "error"; texto: string } | null>(null);
  const [guardando, startTransition] = useTransition();

  const cruce = valores.mediodia.hasta > valores.noche.desde;
  const sinPrecio = CODIGOS_AJUSTE.filter((c) => precios[c].trim() === "");
  const cambios = !iguales(valores, guardados);
  const valido = !cruce && sinPrecio.length === 0;

  function cambiar(codigo: BlockChoice, cambio: Partial<AjusteModulo>) {
    setEstado(null);
    setValores((actual) => {
      const nuevo = { ...actual[codigo], ...cambio };
      if (cambio.desde !== undefined && nuevo.hasta <= nuevo.desde) nuevo.hasta = nuevo.desde + PASO;
      return { ...actual, [codigo]: nuevo };
    });
  }

  function cambiarPrecio(codigo: BlockChoice, texto: string) {
    const digitos = texto.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 8);
    const pesos = Math.min(Number(digitos || 0), PRECIO_MAX);
    setPrecios((actual) => ({ ...actual, [codigo]: digitos ? miles(pesos) : "" }));
    cambiar(codigo, { precio: pesos });
  }

  function guardar() {
    if (!valido || !cambios || guardando) return;
    startTransition(async () => {
      const resultado = await updateModuleSettings(valores).catch(() => null);
      if (resultado?.ok) {
        setGuardados(valores);
        setEstado({ tono: "bien", texto: "Guardado. El sitio ya muestra los horarios y precios nuevos." });
        router.refresh();
      } else if (resultado?.code === "UNAUTHORIZED") {
        router.push("/admin/login?sesion=terminada");
      } else {
        setEstado({ tono: "error", texto: "No se pudo guardar. Revisá los valores y reintentá." });
      }
    });
  }

  function deshacer() {
    setValores(guardados);
    setPrecios(Object.fromEntries(CODIGOS_AJUSTE.map((c) => [c, miles(guardados[c].precio)])) as Record<BlockChoice, string>);
    setEstado(null);
  }

  return (
    <>
      <Cabeza
        titulo="Precios y horarios"
        bajada="Lo que se muestra en el sitio para cada módulo. Al guardar, el sitio se actualiza en el momento."
      />

      <form
        className="pn-precios"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          guardar();
        }}
      >
        <div className="pn-precios-modulos">
          {CODIGOS_AJUSTE.map((codigo, i) => {
            const a = valores[codigo];
            const base = `${id}-${codigo}`;
            return (
              <fieldset key={codigo} className="pn-bloque pn-anima pn-precio" style={orden(i + 1)}>
                <legend className="pn-precio-nombre">{MODULE_WORDS[codigo].label}</legend>
                <div className="pn-horas">
                  <div className="pn-campo">
                    <span className="pn-campo-etiqueta" id={`${base}-desde-etiqueta`}>
                      Desde
                    </span>
                    <SelectorHora
                      id={`${base}-desde`}
                      etiquetaId={`${base}-desde-etiqueta`}
                      valor={a.desde}
                      opciones={HORAS_DESDE}
                      alCambiar={(desde) => cambiar(codigo, { desde })}
                    />
                  </div>
                  <div className="pn-campo">
                    <span className="pn-campo-etiqueta" id={`${base}-hasta-etiqueta`}>
                      Hasta
                    </span>
                    <SelectorHora
                      id={`${base}-hasta`}
                      etiquetaId={`${base}-hasta-etiqueta`}
                      valor={a.hasta}
                      opciones={horasHasta(a.desde)}
                      alCambiar={(hasta) => cambiar(codigo, { hasta })}
                    />
                  </div>
                </div>
                <div className="pn-campo">
                  <label className="pn-campo-etiqueta" htmlFor={`${base}-precio`}>
                    Precio
                  </label>
                  <div className="pn-telefono">
                    <span aria-hidden="true">$</span>
                    <input
                      id={`${base}-precio`}
                      className="pn-input pn-precio-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={precios[codigo]}
                      onChange={(event) => cambiarPrecio(codigo, event.currentTarget.value)}
                      aria-invalid={sinPrecio.includes(codigo) || undefined}
                    />
                  </div>
                  {sinPrecio.includes(codigo) && <p className="pn-campo-error">Escribí el precio.</p>}
                </div>
                <p className="pn-precio-vista">
                  <span>En el sitio</span>
                  {horarioPublico(a)} · {sinPrecio.includes(codigo) ? "—" : precioTexto(a.precio)}
                </p>
              </fieldset>
            );
          })}
        </div>

        {cruce && (
          <p className="pn-campo-error pn-precios-aviso">
            Mediodía tiene que terminar antes de que empiece Noche, o un mismo día se podría reservar dos veces a la misma
            hora.
          </p>
        )}

        <div className="pn-precios-pie pn-anima" style={orden(4)}>
          <p className="pn-precios-estado" role="status" data-tono={estado?.tono}>
            {estado?.texto ?? (cambios ? "Hay cambios sin guardar." : "")}
          </p>
          <div className="pn-form-acciones">
            <button type="button" className="pn-boton" disabled={!cambios || guardando} onClick={deshacer}>
              Deshacer cambios
            </button>
            <button type="submit" className="pn-boton pn-boton-primario" disabled={!cambios || !valido || guardando}>
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
