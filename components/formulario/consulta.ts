"use client";

import { useRef, useState } from "react";
import type { Seleccion } from "@/components/calendario/calendario";
import { MODULOS } from "@/content/modulos";
import { formatLongDate } from "@/lib/dates";

// El formulario de consulta (bloque 6, D-034): los campos y sus reglas (docs/06-UI-UX.md §4.1, con
// su texto de error literal), el mensaje exacto de WhatsApp (docs/05-API-CONTRACTS.md §3) y el
// pase a wa.me (D-004). Nada se guarda ni sale a un servidor.

export const TIPOS = ["Cumpleaños", "Evento infantil", "Reunión", "Taller", "Celebración", "Otro"] as const;
export const PAGOS = ["Efectivo", "Transferencia"] as const;
export const CAPACIDAD = 35; // docs/01-CONTEXT.md

// El teléfono lleva +54 fijo adelante (Mateo: "tiene que aparecer el +54 por default, porque si
// pongo mi número completo me sale el error"). Un número argentino sin el 0 ni el 15 tiene siempre
// 10 dígitos (código de área + número): se exige exactamente eso, no los 8 a 15 de 06-UI-UX.md
// §4.1 (Mateo: "dice 11/10 y da correcto"). Lo que agregan el autocompletado o el pegado — el +54,
// el 9 de celular, el 0 de larga distancia — se saca solo.
export const PREFIJO = "+54";
export const DIGITOS = 10;

export function normalizarTelefono(valor: string) {
  const internacional = valor.trim().startsWith("+");
  let d = valor.replace(/\D/g, "");
  if (internacional || d.length > DIGITOS + 1) {
    if (d.startsWith("549") && d.length >= DIGITOS + 3) d = d.slice(3);
    else if (d.startsWith("54") && d.length >= DIGITOS + 2) d = d.slice(2);
  }
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 15);
}

export const digitos = (telefono: string) => telefono.replace(/\D/g, "").length;

export type Campo = "nombre" | "apellido" | "telefono" | "tipo" | "otro" | "personas" | "fecha" | "pago";
export const ORDEN: readonly Campo[] = ["nombre", "apellido", "telefono", "tipo", "otro", "personas", "fecha", "pago"];

// `otro`: qué van a festejar cuando eligen "Otro" (Mateo: "si pongo otro no salta el campo de qué
// otro"). Cambia el mensaje de 05-API-CONTRACTS.md §3: "Tipo de evento: Otro (bautismo)".
export type Valores = { nombre: string; apellido: string; telefono: string; tipo: string; otro: string; personas: string; pago: string };
const VACIO: Valores = { nombre: "", apellido: "", telefono: "", tipo: "", otro: "", personas: "", pago: "" };

const ERROR: Record<Campo, string> = {
  nombre: "Escribí tu nombre",
  apellido: "Escribí tu apellido",
  telefono: "Revisá el teléfono",
  tipo: "Elegí el tipo de evento",
  otro: "Contanos qué vas a festejar",
  personas: "La capacidad máxima es de 35 personas",
  fecha: "Elegí una fecha y un módulo disponibles",
  pago: "Elegí cómo pagarías",
};

function valido(campo: Campo, v: Valores, sel: Seleccion | null): boolean {
  switch (campo) {
    case "nombre":
    case "apellido": {
      const t = v[campo].trim();
      return t.length >= 1 && t.length <= 60;
    }
    case "telefono":
      return /^\d+$/.test(v.telefono) && v.telefono.length === DIGITOS;
    case "tipo":
      return (TIPOS as readonly string[]).includes(v.tipo);
    case "otro": {
      if (v.tipo !== "Otro") return true;
      const t = v.otro.trim();
      return t.length >= 1 && t.length <= 60;
    }
    case "personas": {
      const n = Number(v.personas);
      return Number.isInteger(n) && n >= 1 && n <= CAPACIDAD;
    }
    case "fecha":
      return sel !== null;
    case "pago":
      return (PAGOS as readonly string[]).includes(v.pago);
  }
}

export function modulo(sel: Seleccion) {
  return MODULOS.find((m) => m.codigo === sel.modulo)!;
}

/** "Noche (19:00 a 02:00 hs)" */
export const moduloEtiqueta = (sel: Seleccion) => `${modulo(sel).nombre} (${modulo(sel).horario})`;

/** El mensaje exacto de docs/05-API-CONTRACTS.md §3. */
export function mensaje(v: Valores, sel: Seleccion | null, falta = "…") {
  const o = (s: string) => s.trim() || falta;
  return [
    "Hola Araucaria! Quiero consultar por el salón para un evento.",
    "",
    `Nombre: ${v.nombre.trim() || v.apellido.trim() ? `${v.nombre.trim()} ${v.apellido.trim()}`.trim() : falta}`,
    `Teléfono: ${v.telefono.trim() ? `${PREFIJO} ${v.telefono.trim()}` : falta}`,
    `Tipo de evento: ${v.tipo === "Otro" && v.otro.trim() ? `Otro (${v.otro.trim()})` : o(v.tipo)}`,
    `Cantidad de personas: ${o(v.personas)}`,
    `Fecha: ${sel ? formatLongDate(sel.fecha) : falta}`,
    `Módulo: ${sel ? moduloEtiqueta(sel) : falta}`,
    `Valor: ${sel ? modulo(sel).precio : falta}`,
    `Forma de pago: ${o(v.pago)}`,
    "",
    "¿Está disponible?",
  ].join("\n");
}

// El número sale de la variable pública de Vercel (docs/07-INFRASTRUCTURE.md), nunca escrito acá.
const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const hayNumero = NUMERO.length > 0;
export const enlace = (texto: string) => `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;

/** Estado del formulario: valores, errores (al salir del campo y al enviar) y el envío. */
export function useConsulta(sel: Seleccion | null) {
  const [v, setV] = useState<Valores>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [enviado, setEnviado] = useState<string | null>(null); // el enlace que se abrió
  const refs = useRef<Partial<Record<Campo, HTMLElement | null>>>({});

  const revisar = (campo: Campo, valores = v) =>
    setErrores((e) => ({ ...e, [campo]: valido(campo, valores, sel) ? undefined : ERROR[campo] }));

  function cambiar(campo: keyof Valores, valor: string, alInstante = false) {
    const nuevos = { ...v, [campo]: valor };
    setV(nuevos);
    // Los campos que se eligen tocando (tipo, pago) se revisan en el acto; los que se escriben, al salir.
    if (alInstante || errores[campo]) revisar(campo, nuevos);
  }

  /** Revisa varios campos juntos, marca los errores y lleva el foco al primero que falla. */
  function revisarVarios(campos: readonly Campo[]): boolean {
    const nuevos: Partial<Record<Campo, string>> = {};
    for (const c of campos) nuevos[c] = valido(c, v, sel) ? undefined : ERROR[c];
    setErrores((e) => ({ ...e, ...nuevos }));
    const primero = campos.find((c) => nuevos[c]);
    if (primero) refs.current[primero]?.focus();
    return !primero;
  }

  function enviar(): boolean {
    if (!revisarVarios(ORDEN)) return false;
    const url = enlace(mensaje(v, sel));
    window.open(url, "_blank", "noopener");
    setEnviado(url);
    return true;
  }

  const registrar = (campo: Campo) => (el: HTMLElement | null) => {
    refs.current[campo] = el;
  };

  return { v, errores, enviado, setEnviado, cambiar, revisar, revisarVarios, enviar, registrar };
}

export type Consulta = ReturnType<typeof useConsulta>;
