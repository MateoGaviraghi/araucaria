import type { Choice } from "@/components/calendar/month";
import { hora } from "@/lib/reservas";
import { precioTexto, type Ajustes } from "@/lib/ajustes";

// Lo que se puede pedir en el salón: los tres módulos, con el horario y el precio que la dueña carga en
// el panel (D-053, "Precios y horarios"), más "Personalizado", otro horario que se arregla por WhatsApp
// (D-050). El texto de `horario` es el que va al mensaje de WhatsApp (docs/05-API-CONTRACTS.md §3).
// Si el precio incluye IVA y hasta cuándo vale: {{CONFIRMAR}} (CI-05).

export type Modulo = { codigo: Choice; nombre: string; horario: string; precio: string };

const NOMBRES = { mediodia: "Mediodía", noche: "Noche", "dia-completo": "Día completo" } as const;

/** "10:00 a 18:30 hs" */
const horario = (desde: number, hasta: number) => `${hora(desde)} a ${hora(hasta)} hs`;

export function modulosDe(ajustes: Ajustes): Modulo[] {
  return [
    ...(["mediodia", "noche", "dia-completo"] as const).map((codigo) => ({
      codigo,
      nombre: NOMBRES[codigo],
      horario: horario(ajustes[codigo].desde, ajustes[codigo].hasta),
      precio: precioTexto(ajustes[codigo].precio),
    })),
    { codigo: "personalizado", nombre: "Personalizado", horario: "Horario a coordinar", precio: "A coordinar" },
  ];
}
