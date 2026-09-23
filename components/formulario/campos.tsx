"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CAPACIDAD, DIGITOS, PREFIJO, digitos, normalizarTelefono, type Campo, type Consulta, type Valores } from "./consulta";

// Las piezas animadas del formulario (D-034). Mateo: "no me gustan los rellenos, les faltan
// animaciones… dale ese toque realmente wow".

const quieto = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

function Aviso({ f, campo }: { f: Consulta; campo: Campo }) {
  return f.errores[campo] ? (
    <span className="fx-error" role="alert">
      {f.errores[campo]}
    </span>
  ) : null;
}

// ---- Teléfono: +54 fijo adelante y un medidor que se llena con cada número y se vuelve un tilde
// con los 10 (Mateo: "que vaya poniendo la animación de que la cantidad de números está bien").

function Medidor({ telefono }: { telefono: string }) {
  const d = digitos(telefono);
  const estado = d > DIGITOS ? "demasiado" : d === DIGITOS ? "completo" : d >= DIGITOS - 2 ? "casi" : "corto";
  return (
    <span className="fx-medidor-caja">
      <span className="fx-medidor" data-estado={d ? estado : undefined} aria-hidden="true">
        <span className="fx-medidor-barra">
          <span style={{ transform: `scaleX(${Math.min(d / DIGITOS, 1)})` }} />
        </span>
        <span className="fx-medidor-cuenta">
          {d}/{DIGITOS}
        </span>
        <svg className="fx-medidor-tilde" viewBox="0 0 20 20">
          <path d="M4 10.5l4 4 8-9" />
        </svg>
      </span>
      {estado === "demasiado" ? <span className="fx-medidor-aviso">Sobran números: fijate de no poner el 15.</span> : null}
    </span>
  );
}

// ---- Campo de texto: la etiqueta vive adentro, grande; al tocar sube y se achica (0,5 s), y la
// línea de abajo se dibuja de izquierda a derecha (0,6 s). Un error la pinta y la sacude.

type TextoProps = {
  f: Consulta;
  campo: "nombre" | "apellido" | "telefono" | "otro";
  etiqueta: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function CampoTexto({ f, campo, etiqueta, ...resto }: TextoProps) {
  const valor = f.v[campo as keyof Valores];
  const esTelefono = campo === "telefono";
  return (
    <label
      className="fx-campo"
      data-lleno={valor || esTelefono ? "" : undefined}
      data-error={f.errores[campo] ? "" : undefined}
      data-prefijo={esTelefono ? "" : undefined}
    >
      <span className="fx-caja">
        {esTelefono ? (
          <span className="fx-prefijo" aria-hidden="true">
            {PREFIJO}
          </span>
        ) : null}
        <input
          ref={f.registrar(campo)}
          className="fx-input"
          value={valor}
          placeholder=" "
          onChange={(e) => f.cambiar(campo, esTelefono ? normalizarTelefono(e.target.value) : e.target.value)}
          onBlur={() => f.revisar(campo)}
          aria-invalid={Boolean(f.errores[campo])}
          {...resto}
        />
        <span className="fx-etiqueta">{etiqueta}</span>
        <span className="fx-base" aria-hidden="true" />
        <span className="fx-foco" aria-hidden="true" />
      </span>
      {esTelefono ? <Medidor telefono={String(valor)} /> : null}
      <Aviso f={f} campo={campo} />
    </label>
  );
}

// ---- Opciones: una luz se desliza hasta la elegida (0,55 s power3.out).

type OpcionesProps = {
  f: Consulta;
  campo: "tipo" | "pago";
  etiqueta: string;
  opciones: readonly string[];
  grande?: boolean;
};

export function Opciones({ f, campo, etiqueta, opciones, grande = false }: OpcionesProps) {
  const caja = useRef<HTMLDivElement>(null);
  const luz = useRef<HTMLSpanElement>(null);
  const valor = f.v[campo];

  useGSAP(
    () => {
      const el = caja.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!luz.current) return;
      if (!el) {
        gsap.set(luz.current, { opacity: 0 });
        return;
      }
      const donde = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
      const primera = Number(gsap.getProperty(luz.current, "opacity")) === 0;
      if (primera || !quieto()) gsap.set(luz.current, { ...donde, opacity: 1, scale: primera && quieto() ? 0.6 : 1 });
      gsap.to(luz.current, { ...donde, opacity: 1, scale: 1, duration: quieto() ? 0.55 : 0, ease: primera ? "back.out(1.6)" : "power3.out", overwrite: true });
    },
    { dependencies: [valor] },
  );

  return (
    <fieldset className="fx-grupo" data-error={f.errores[campo] ? "" : undefined}>
      <legend className="fx-leyenda">{etiqueta}</legend>
      <div ref={caja} className="fx-opciones" data-grande={grande ? "" : undefined}>
        <span ref={luz} className="fx-luz" aria-hidden="true" />
        {opciones.map((o, i) => (
          <button
            key={o}
            ref={i === 0 ? f.registrar(campo) : undefined}
            type="button"
            className="fx-opcion"
            aria-pressed={valor === o}
            onClick={() => f.cambiar(campo, o, true)}
          >
            {o}
          </button>
        ))}
      </div>
      <Aviso f={f} campo={campo} />
    </fieldset>
  );
}

// ---- "Otro": el campo para escribir qué van a festejar se abre debajo (0,6 s) y toma el foco.

export function Revela({ abierto, children }: { abierto: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const primera = useRef(true);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const d = quieto() && !primera.current ? 0.6 : 0;
      primera.current = false;
      if (abierto) {
        gsap.fromTo(el, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: d, ease: "power3.out", onComplete: () => el.querySelector("input")?.focus() });
      } else gsap.to(el, { height: 0, opacity: 0, duration: d * 0.6, ease: "power2.in" });
    },
    { dependencies: [abierto] },
  );
  return (
    <div ref={ref} className="fx-revela" inert={!abierto} style={{ height: 0, opacity: 0 }}>
      {children}
    </div>
  );
}

// ---- Contador de personas. Mateo, con la captura de un contador de votos: "va a decir el número,
// que podés editarlo manualmente, al lado 'personas', y botón de subir o bajar". El número rueda
// hacia arriba o hacia abajo (0,45 s) y la flecha del botón tocado da un saltito en su sentido.

export function Contador({ f }: { f: Consulta }) {
  const n = Math.min(CAPACIDAD, Math.max(0, Number(f.v.personas) || 0));
  const numero = useRef<HTMLSpanElement>(null);
  const antes = useRef(n);

  useGSAP(
    () => {
      const previo = antes.current;
      antes.current = n;
      if (!numero.current || previo === n || !quieto()) return;
      gsap.fromTo(numero.current, { yPercent: n > previo ? 70 : -70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    },
    { dependencies: [n] },
  );

  function poner(k: number, flecha?: Element | null) {
    f.cambiar("personas", String(Math.min(CAPACIDAD, Math.max(1, k))), true);
    if (flecha && quieto()) gsap.fromTo(flecha, { y: k > n ? -6 : 6 }, { y: 0, duration: 0.5, ease: "back.out(3)" });
  }

  return (
    <div className="fx-contador" data-error={f.errores.personas ? "" : undefined}>
      <span className="fx-leyenda" id="fx-contador">
        ¿Cuántas personas?
      </span>
      <div className="fx-contador-tarjeta">
        <span className="fx-contador-valor">
          <span className="fx-contador-caja">
            <span ref={numero} className="fx-contador-numero">
              <input
                ref={f.registrar("personas")}
                aria-labelledby="fx-contador"
                inputMode="numeric"
                value={f.v.personas}
                placeholder="0"
                size={2}
                onBlur={() => f.revisar("personas")}
                onChange={(e) => f.cambiar("personas", e.target.value.replace(/\D/g, "").slice(0, 2))}
                aria-invalid={Boolean(f.errores.personas)}
              />
            </span>
          </span>
          <span className="fx-contador-palabra">{n === 1 ? "persona" : "personas"}</span>
        </span>
        <span className="fx-contador-botones">
          <button
            type="button"
            className="fx-contador-boton"
            data-sube=""
            onClick={(e) => poner(n + 1, e.currentTarget.firstElementChild)}
            disabled={n >= CAPACIDAD}
            aria-label="Una persona más"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="fx-contador-boton"
            onClick={(e) => poner(n - 1, e.currentTarget.firstElementChild)}
            disabled={n <= 1}
            aria-label="Una persona menos"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </span>
      </div>
      <span className="fx-contador-pie">Hasta {CAPACIDAD} personas</span>
      <Aviso f={f} campo="personas" />
    </div>
  );
}

// ---- Listo: al enviar, un círculo y un tilde se dibujan (DrawSVG, como la alerta del panel D-020).

export function Listo() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (!quieto()) return;
      gsap
        .timeline()
        .fromTo(".fx-listo-aro", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "power2.inOut" })
        .fromTo(".fx-listo-tilde", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.35, ease: "power2.out" }, 0.45);
    },
    { scope: ref },
  );
  return (
    <svg ref={ref} className="fx-listo" viewBox="0 0 52 52" aria-hidden="true">
      <circle className="fx-listo-aro" cx="26" cy="26" r="24" />
      <path className="fx-listo-tilde" d="M15 27 l7 7 l15 -16" />
    </svg>
  );
}
