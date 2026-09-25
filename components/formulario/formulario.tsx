"use client";

import { useRef, useState } from "react";
import type { Seleccion } from "@/components/calendario/calendario";
import { formatLongDate } from "@/lib/dates";
import { gsap, useGSAP } from "@/lib/gsap";
import { CampoTexto, Contador, Listo, Opciones, Revela } from "./campos";
import { PAGOS, TIPOS, modulo, useConsulta, type Campo } from "./consulta";
import "./formulario.css";

// FORMULARIO de consulta (bloque 6, D-034): "Sigue en la cortina". Continúa adentro del panel del
// calendario: al tocar "Seguir con mis datos", la cortina corre otra vez sobre el día elegido
// (1,1 s power3.inOut) y aparecen tres pasos cortos. Cada paso entra deslizándose en el sentido en
// que se avanza (0,6 s) con sus líneas subiendo desde la máscara (0,07 s entre líneas). Arriba
// queda fija la fecha y el módulo, con "Cambiar". Al enviar se abre WhatsApp con el mensaje armado
// (D-004) y se dibuja un tilde.

const PASOS: { titulo: string; campos: Campo[] }[] = [
  { titulo: "¿Quién consulta?", campos: ["nombre", "apellido", "telefono"] },
  { titulo: "Tu evento", campos: ["tipo", "otro", "personas"] },
  { titulo: "¿Cómo pagarías?", campos: ["pago"] },
];

const quieto = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

const conMayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "sábado 26 de septiembre" */
function fechaCorta(sel: Seleccion) {
  const m = formatLongDate(sel.fecha).match(/^(\S+ \d+ de \S+)/);
  return m ? m[1] : sel.fecha;
}

/** La línea antes del botón: fecha, módulo y precio tal como se van a mandar (06-UI-UX.md §4.2). */
function Resumen({ sel }: { sel: Seleccion }) {
  const m = modulo(sel);
  return (
    <p className="fo-resumen">
      <span>{conMayuscula(formatLongDate(sel.fecha))}</span> · <span>{m.nombre}</span> · <strong>{m.precio}</strong>
    </p>
  );
}

/** Después de enviar (06-UI-UX.md §4.3). */
function Enviado({ sel, url, onEditar }: { sel: Seleccion; url: string; onEditar: () => void }) {
  return (
    <div className="fo-enviado" role="status">
      <p className="fo-enviado-titulo">Te abrimos WhatsApp con tu consulta</p>
      <Resumen sel={sel} />
      <p className="fo-enviado-pasos">Enviá el mensaje y Araucaria te confirma la disponibilidad</p>
      <a className="fo-enviado-link" href={url} target="_blank" rel="noopener">
        Si no se abrió WhatsApp, tocá acá
      </a>
      <button type="button" className="fo-enviado-editar" onClick={onEditar}>
        Editar la consulta
      </button>
    </div>
  );
}

/** Una línea que sube desde su máscara. */
function L({ children }: { children: React.ReactNode }) {
  return (
    <div className="fo-mascara">
      <div className="fo-linea">{children}</div>
    </div>
  );
}

/** `alCambiarPaso`: el calendario vuelve a poner el panel en su lugar en el celular (D-039). */
export function Formulario({ sel, volver, alCambiarPaso }: { sel: Seleccion; volver: () => void; alCambiarPaso?: () => void }) {
  const f = useConsulta(sel);
  const raiz = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState(0);
  const [sentido, setSentido] = useState(1);

  // La cortina de entrada, una sola vez. x: 0 explícito: GSAP no debe heredar un x en px (G-040).
  useGSAP(
    () => {
      if (!quieto()) return;
      gsap.fromTo(raiz.current, { x: 0, xPercent: -101 }, { x: 0, xPercent: 0, duration: 1.1, ease: "power3.inOut" });
    },
    { scope: raiz },
  );

  // Cada paso entra deslizándose y sus líneas suben desde la máscara.
  useGSAP(
    () => {
      const lineas = gsap.utils.toArray<HTMLElement>(".fo-c-paso .fo-linea", raiz.current);
      if (!quieto() || !lineas.length) return;
      const demora = paso === 0 && !f.enviado ? 0.5 : 0;
      gsap.fromTo(".fo-c-paso", { xPercent: 7 * sentido, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: demora });
      gsap.fromTo(lineas, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, delay: demora });
    },
    { scope: raiz, dependencies: [paso, f.enviado] },
  );

  function ir(a: number) {
    setSentido(a > paso ? 1 : -1);
    setPaso(a);
    alCambiarPaso?.();
  }

  function siguiente() {
    if (!f.revisarVarios(PASOS[paso].campos)) return;
    if (paso < PASOS.length - 1) ir(paso + 1);
    else f.enviar();
  }

  return (
    <div ref={raiz} className="fo-c" id="consulta">
      <div className="fo-c-cabeza">
        <p className="fo-c-eleccion">
          {fechaCorta(sel)} · {modulo(sel).nombre}
        </p>
        <button type="button" className="fo-c-cambiar" onClick={volver}>
          Cambiar
        </button>
      </div>

      {f.enviado ? (
        <div className="fo-c-paso">
          <L>
            <Listo />
          </L>
          <L>
            <Enviado sel={sel} url={f.enviado} onEditar={() => f.setEnviado(null)} />
          </L>
        </div>
      ) : (
        <form
          key={paso}
          className="fo-c-paso"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            siguiente();
          }}
        >
          <div className="fo-c-progreso" aria-hidden="true">
            {PASOS.map((_, i) => (
              <span key={i} data-lleno={i <= paso ? "" : undefined} />
            ))}
          </div>
          <L>
            <p className="fo-c-titulo">
              <span className="fo-c-numero">{paso + 1}/3</span> {PASOS[paso].titulo}
            </p>
          </L>

          {paso === 0 ? (
            <>
              <L>
                <CampoTexto f={f} campo="nombre" etiqueta="Nombre" autoComplete="given-name" maxLength={60} />
              </L>
              <L>
                <CampoTexto f={f} campo="apellido" etiqueta="Apellido" autoComplete="family-name" maxLength={60} />
              </L>
              <L>
                <CampoTexto f={f} campo="telefono" etiqueta="Teléfono (celular, sin el 0 ni el 15)" type="tel" autoComplete="tel-national" inputMode="tel" />
              </L>
            </>
          ) : null}

          {paso === 1 ? (
            <>
              <L>
                <Opciones f={f} campo="tipo" etiqueta="¿Qué vas a festejar?" opciones={TIPOS} />
              </L>
              <Revela abierto={f.v.tipo === "Otro"}>
                <CampoTexto f={f} campo="otro" etiqueta="¿Qué evento es?" maxLength={60} />
              </Revela>
              <L>
                <Contador f={f} />
              </L>
            </>
          ) : null}

          {paso === 2 ? (
            <>
              <L>
                <Opciones f={f} campo="pago" etiqueta="Forma de pago" opciones={PAGOS} grande />
              </L>
              <L>
                <Resumen sel={sel} />
              </L>
            </>
          ) : null}

          <div className="fo-c-botones fo-mascara">
            <span className="fo-linea">
              {paso > 0 ? (
                <button type="button" className="fo-c-atras" onClick={() => ir(paso - 1)}>
                  ← Anterior
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="boton boton-en-oscuro">
                {paso < PASOS.length - 1 ? "Siguiente" : "Enviar consulta por WhatsApp"}
              </button>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
