"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { cancelReservation, createReservation, editReservation, logout, unblockModule } from "@/app/admin/actions";
import { MODULE_WORDS } from "@/components/calendar/month";
import { ConfirmAlert, type AlertMessage } from "@/components/ui/confirm-alert";
import type { ActionResult } from "@/lib/action-result";
import type { Ajustes } from "@/lib/ajustes";
import { todayInBuenosAires, type IsoDate } from "@/lib/dates";
import {
  diaLargo,
  entradaDe,
  horarioTexto,
  moduloTexto,
  nombreTexto,
  telefonoTexto,
  whatsapp,
  type Reserva,
} from "@/lib/reservas";
import { Dialogo } from "./dialogo";
import {
  IconoAfuera,
  IconoCalendario,
  IconoInicio,
  IconoMas,
  IconoPrecio,
  IconoReservas,
  IconoSalir,
  IconoTelefono,
} from "./iconos";
import { NuevaReserva, type DatosReserva } from "./nueva-reserva";

// The frame of the owner panel (D-046): the side menu (a bottom tab bar on the phone), "Nueva reserva"
// always at hand, and the three shared moments every section uses: create, look at, and cancel a
// reservation. Each change saves at once and is confirmed by the alert of D-020, with "Deshacer".
// D-050: and edit one, in the same form as "Nueva reserva", filled in.

type Panel = {
  nuevaReserva: (fecha?: IsoDate) => void;
  verReserva: (reserva: Reserva) => void;
  editarReserva: (reserva: Reserva) => void;
  cancelarReserva: (reserva: Reserva) => void;
  ocupado: boolean;
  /** The modules' hours and prices of the moment (D-053). */
  ajustes: Ajustes;
};

const PanelContexto = createContext<Panel | null>(null);

export function usePanel(): Panel {
  const panel = useContext(PanelContexto);
  if (!panel) throw new Error("usePanel outside PanelMarco");
  return panel;
}

const SECCIONES = [
  { href: "/admin", nombre: "Inicio", Icono: IconoInicio },
  { href: "/admin/reservas", nombre: "Reservas", Icono: IconoReservas },
  { href: "/admin/calendario", nombre: "Calendario", Icono: IconoCalendario },
  { href: "/admin/precios", nombre: "Precios", Icono: IconoPrecio },
] as const;

const STALE_ACTION = "Failed to find Server Action";

// Cerrar sesión (C-10): revoca en el servidor y carga el login como página entera.
async function salir() {
  await logout();
  // Página entera a propósito: una navegación del cliente no correría el guion de entrada del login.
  window.location.replace(new URL("/admin/login", window.location.origin));
}
const capitalizar = (texto: string) => `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
const detalleDe = (date: IsoDate, modulo: string, nombre: string) => `${capitalizar(diaLargo(date))} · ${modulo} · ${nombre}`;

type Deshacer = () => Promise<ActionResult<unknown>>;

/** Only a reservation with its data, from today on: the actions refuse past dates. */
const editable = (reserva: Reserva) => reserva.id !== null && reserva.date >= todayInBuenosAires();

export function PanelMarco({ ajustes, children }: { ajustes: Ajustes; children: ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const [ocupado, startTransition] = useTransition();
  const [nueva, setNueva] = useState<{ fecha: IsoDate | null; vez: number } | null>(null);
  const [detalle, setDetalle] = useState<Reserva | null>(null);
  const [editando, setEditando] = useState<Reserva | null>(null);
  const [aCancelar, setACancelar] = useState<Reserva | null>(null);
  const [aviso, setAviso] = useState<AlertMessage | null>(null);
  const [deshacer, setDeshacer] = useState<Deshacer | null>(null);

  function avisar(tone: AlertMessage["tone"], title: string, detail: string | undefined, undo: Deshacer | null) {
    setDeshacer(() => undo);
    setAviso((actual) => ({ id: (actual?.id ?? 0) + 1, tone, title, detail, canUndo: undo !== null }));
  }

  function correr<T>(accion: () => Promise<ActionResult<T>>, alSalirBien: (data: T | undefined) => void, detalleError: string) {
    startTransition(async () => {
      try {
        const resultado = await accion();
        if (resultado.ok) {
          alSalirBien(resultado.data);
        } else if (resultado.code === "UNAUTHORIZED") {
          router.push("/admin/login?sesion=terminada");
          return;
        } else {
          const titulo =
            resultado.code === "ALREADY_TAKEN"
              ? "Ese módulo ya está reservado."
              : resultado.code === "NOT_FOUND"
                ? "Esa reserva ya estaba cancelada."
                : "Algo falló. Reintentá.";
          avisar("error", titulo, detalleError, null);
        }
      } catch (error) {
        const vieja = error instanceof Error && error.message.includes(STALE_ACTION);
        avisar("error", vieja ? "Se actualizó el panel, reintentá." : "Algo falló. Reintentá.", undefined, null);
      }
      router.refresh();
    });
  }

  function guardar(datos: DatosReserva) {
    const detalleTexto = detalleDe(datos.date, MODULE_WORDS[datos.choice].label, datos.clientName);
    correr(
      () => createReservation(datos),
      (data) => {
        setNueva(null);
        const id = data?.id;
        avisar("success", "Reserva guardada", detalleTexto, id ? () => cancelReservation({ id }) : null);
      },
      detalleTexto,
    );
  }

  // "Deshacer" puts the reservation back as it was.
  function guardarCambios(original: Reserva, datos: DatosReserva) {
    const id = original.id;
    if (!id) return;
    const detalleTexto = detalleDe(datos.date, MODULE_WORDS[datos.choice].label, datos.clientName);
    correr(
      () => editReservation({ ...datos, id }),
      () => {
        setEditando(null);
        avisar("success", "Reserva actualizada", detalleTexto, () => editReservation({ ...entradaDe(original), id }));
      },
      detalleTexto,
    );
  }

  function cancelar(reserva: Reserva) {
    const detalleTexto = detalleDe(reserva.date, moduloTexto(reserva), nombreTexto(reserva));
    setACancelar(null);
    setDetalle(null);
    if (reserva.id) {
      const id = reserva.id;
      const rehacer: Deshacer | null = reserva.clientName ? () => createReservation(entradaDe(reserva)) : null;
      correr(() => cancelReservation({ id }), () => avisar("success", "Reserva cancelada", detalleTexto, rehacer), detalleTexto);
      return;
    }
    // Loaded before D-046: no reservation, only its modules.
    correr(
      async (): Promise<ActionResult> => {
        for (const id of reserva.blockIds) {
          const resultado = await unblockModule({ id });
          if (!resultado.ok) return resultado;
        }
        return { ok: true };
      },
      () => avisar("success", "Reserva cancelada", detalleTexto, null),
      detalleTexto,
    );
  }

  function deshacerUltimo() {
    const accion = deshacer;
    if (!accion) return;
    setDeshacer(null);
    const detalleTexto = aviso?.detail;
    correr(accion, () => avisar("success", "Deshecho", detalleTexto, null), detalleTexto ?? "");
  }

  const panel: Panel = {
    nuevaReserva: (fecha) => setNueva((actual) => ({ fecha: fecha ?? null, vez: (actual?.vez ?? 0) + 1 })),
    verReserva: setDetalle,
    editarReserva: (reserva) => {
      setDetalle(null);
      setEditando(reserva);
    },
    cancelarReserva: setACancelar,
    ocupado,
    ajustes,
  };

  const activa = (href: string) => (href === "/admin" ? ruta === "/admin" : ruta.startsWith(href));

  return (
    <PanelContexto value={panel}>
      <div className="pn">
        <aside className="pn-lateral" aria-label="Panel">
          <p className="pn-marca">
            <span className="pn-marca-nombre">Araucaria</span>
            <span className="pn-marca-panel">Panel</span>
          </p>
          <button type="button" className="pn-boton pn-boton-primario pn-nueva" onClick={() => panel.nuevaReserva()}>
            <IconoMas />
            Nueva reserva
          </button>
          <nav className="pn-menu" aria-label="Secciones">
            {SECCIONES.map(({ href, nombre, Icono }) => (
              <Link key={href} href={href} aria-current={activa(href) ? "page" : undefined}>
                <Icono />
                {nombre}
              </Link>
            ))}
          </nav>
          <div className="pn-lateral-pie">
            <a className="pn-menu-extra" href="/" target="_blank" rel="noopener">
              <IconoAfuera />
              Ver el sitio
            </a>
            {/* C-10: a visible "Cerrar sesión". */}
            <form action={salir}>
              <button type="submit" className="pn-menu-extra">
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <header className="pn-barra-movil">
          <p className="pn-marca">
            <span className="pn-marca-nombre">Araucaria</span>
            <span className="pn-marca-panel">Panel</span>
          </p>
          <div className="pn-barra-movil-acciones">
            <a className="pn-icono-boton" href="/" target="_blank" rel="noopener" aria-label="Ver el sitio">
              <IconoAfuera />
            </a>
            <form action={salir}>
              <button type="submit" className="pn-icono-boton" aria-label="Cerrar sesión">
                <IconoSalir />
              </button>
            </form>
          </div>
        </header>

        <main className="pn-contenido">{children}</main>

        <nav className="pn-pestanas-movil" aria-label="Secciones">
          {SECCIONES.map(({ href, nombre, Icono }) => (
            <Link key={href} href={href} aria-current={activa(href) ? "page" : undefined}>
              <Icono />
              {nombre}
            </Link>
          ))}
          <button type="button" className="pn-pestana-nueva" onClick={() => panel.nuevaReserva()}>
            <IconoMas />
            Nueva
          </button>
        </nav>
      </div>

      <Dialogo
        abierto={nueva !== null}
        amplio
        titulo="Nueva reserva"
        subtitulo="Elegí el día y el módulo. Al guardar, el día se ve ocupado en el sitio."
        alCerrar={() => setNueva(null)}
      >
        <NuevaReserva
            ajustes={ajustes}
          key={nueva?.vez}
          fecha={nueva?.fecha ?? null}
          guardando={ocupado}
          alGuardar={guardar}
          alCancelar={() => setNueva(null)}
        />
      </Dialogo>

      <Dialogo
        abierto={editando !== null}
        amplio
        titulo="Editar reserva"
        subtitulo={editando ? `${nombreTexto(editando)} · ${capitalizar(diaLargo(editando.date))}` : undefined}
        alCerrar={() => setEditando(null)}
      >
        {editando && (
          <NuevaReserva
            ajustes={ajustes}
            key={editando.clave}
            fecha={null}
            inicial={editando}
            guardando={ocupado}
            alGuardar={(datos) => guardarCambios(editando, datos)}
            alCancelar={() => setEditando(null)}
          />
        )}
      </Dialogo>

      <Dialogo
        abierto={detalle !== null}
        titulo={detalle ? nombreTexto(detalle) : "Reserva"}
        subtitulo={detalle ? capitalizar(diaLargo(detalle.date)) : undefined}
        alCerrar={() => setDetalle(null)}
      >
        {detalle && (
          <>
            <dl className="pn-datos">
              <div>
                <dt>Módulo</dt>
                <dd>
                  {moduloTexto(detalle)} <span>· {horarioTexto(detalle, ajustes)}</span>
                </dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>
                  {detalle.clientPhone ? (
                    <a href={whatsapp(detalle.clientPhone)} target="_blank" rel="noopener">
                      <IconoTelefono />
                      {telefonoTexto(detalle.clientPhone)}
                    </a>
                  ) : (
                    <span>No lo cargaste</span>
                  )}
                </dd>
              </div>
              {detalle.notes && (
                <div>
                  <dt>Notas</dt>
                  <dd className="pn-datos-notas">{detalle.notes}</dd>
                </div>
              )}
            </dl>
            <div className="pn-form-acciones">
              <button type="button" className="pn-boton" onClick={() => setDetalle(null)}>
                Cerrar
              </button>
              {editable(detalle) && (
                <button type="button" className="pn-boton" onClick={() => panel.editarReserva(detalle)}>
                  Editar
                </button>
              )}
              <button type="button" className="pn-boton pn-boton-peligro" onClick={() => setACancelar(detalle)}>
                Cancelar reserva
              </button>
            </div>
          </>
        )}
      </Dialogo>

      <Dialogo
        abierto={aCancelar !== null}
        alerta
        titulo="¿Cancelar esta reserva?"
        subtitulo={
          aCancelar
            ? `${nombreTexto(aCancelar)} · ${capitalizar(diaLargo(aCancelar.date))} · ${moduloTexto(aCancelar)}. El día vuelve a verse libre en el sitio.`
            : undefined
        }
        alCerrar={() => setACancelar(null)}
      >
        <div className="pn-form-acciones">
          <button type="button" className="pn-boton" onClick={() => setACancelar(null)}>
            Volver
          </button>
          <button
            type="button"
            className="pn-boton pn-boton-peligro-lleno"
            disabled={ocupado}
            onClick={() => aCancelar && cancelar(aCancelar)}
          >
            Sí, cancelar
          </button>
        </div>
      </Dialogo>

      {aviso && (
        <ConfirmAlert
          key={aviso.id}
          message={aviso}
          onUndo={deshacerUltimo}
          undoDisabled={ocupado}
          onClose={() => setAviso((actual) => (actual?.id === aviso.id ? null : actual))}
        />
      )}
    </PanelContexto>
  );
}
