import type { BlockChoice } from "@/components/calendar/month";

// Los tres módulos que alquila el salón. Horarios y precios: docs/01-CONTEXT.md, la única fuente.
// El texto de `horario` es el que va al mensaje de WhatsApp (docs/05-API-CONTRACTS.md §3).
// Si el precio incluye IVA y hasta cuándo vale: {{CONFIRMAR}} (CI-05).

export type Modulo = { codigo: BlockChoice; nombre: string; horario: string; precio: string };

export const MODULOS: readonly Modulo[] = [
  { codigo: "mediodia", nombre: "Mediodía", horario: "10:00 a 17:00 hs", precio: "$240.000" },
  { codigo: "noche", nombre: "Noche", horario: "19:00 a 02:00 hs", precio: "$240.000" },
  { codigo: "dia-completo", nombre: "Día completo", horario: "10:00 a 02:00 hs", precio: "$400.000" },
];
