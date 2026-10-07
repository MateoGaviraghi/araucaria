"use server";

import { updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import type { AvailabilityEntry, ModuleCode } from "@/components/calendar/month";
import type { ActionResult } from "@/lib/action-result";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth/config";
import { clientIp, hashIp } from "@/lib/auth/ip";
import {
  AVAILABILITY_TAG,
  deleteBlock,
  deleteReservation,
  getTakenInMonth,
  insertReservation,
  requireAdmin,
  revokeSession,
  updateReservation,
  type DatosDeReserva,
} from "@/lib/dal";
import { isValidIsoDate, isValidIsoMonth, lastBookableDate, todayInBuenosAires } from "@/lib/dates";
import { horarioValido, modulosDeHorario } from "@/lib/reservas";

// Admin Server Actions are public endpoints: requireAdmin() comes first (C-05), then zod (C-08).

const Fecha = z.string().refine(isValidIsoDate);

const ReservaSchema = z
  .object({
    date: Fecha,
    choice: z.enum(["mediodia", "noche", "dia-completo", "personalizado"]),
    // "Personalizado" hours in minutes from 00:00 of the date (D-050); null for the other choices.
    customFrom: z.number().int().nullable(),
    customTo: z.number().int().nullable(),
    clientName: z.string().trim().min(1).max(80),
    // The 10 national digits, without 0 or 15 (the public form's format, D-034); optional (D-046).
    clientPhone: z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ""))
      .refine((digits) => digits === "" || /^[1-9][0-9]{9}$/.test(digits)),
    // Optional (D-050); empty is stored as null.
    notes: z.string().trim().max(500),
  })
  .refine((r) =>
    r.choice === "personalizado"
      ? r.customFrom !== null && r.customTo !== null && horarioValido(r.customFrom, r.customTo)
      : r.customFrom === null && r.customTo === null,
  );

type DatosEntrada = {
  date: string;
  choice: string;
  customFrom: number | null;
  customTo: number | null;
  clientName: string;
  clientPhone: string;
  notes: string;
};

/** Validated input → what the DAL stores. null when it does not pass zod or the bookable range. */
function datosDe(input: DatosEntrada): DatosDeReserva | null {
  const parsed = ReservaSchema.safeParse(input);
  if (!parsed.success || !inRange(parsed.data.date)) return null;
  const { date, choice, customFrom, customTo, clientName, clientPhone, notes } = parsed.data;
  const modules: ModuleCode[] =
    choice === "personalizado"
      ? modulosDeHorario(customFrom!, customTo!)
      : choice === "dia-completo"
        ? ["mediodia", "noche"]
        : [choice];
  return {
    date,
    modules,
    clientName,
    clientPhone: clientPhone ? `+54${clientPhone}` : null,
    notes: notes || null,
    customFrom,
    customTo,
  };
}

const IdSchema = z.object({ id: z.uuid() });

const inRange = (date: string) => {
  const today = todayInBuenosAires();
  return date >= today && date <= lastBookableDate(today);
};

async function ipHash() {
  return hashIp(clientIp(await headers()));
}

export async function createReservation(input: DatosEntrada): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const datos = datosDe(input);
  if (!datos) return { ok: false, code: "INVALID_INPUT" };

  try {
    const outcome = await insertReservation({ ...datos, sessionId: session.sessionId, ipHash: await ipHash() });
    if (outcome === "taken") return { ok: false, code: "ALREADY_TAKEN" };
    // updateTag, not revalidateTag: the next visitor must not get the stale calendar (G-003, D-018).
    updateTag(AVAILABILITY_TAG);
    return { ok: true, data: { id: outcome } };
  } catch (error) {
    console.error("createReservation: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

// "Editar reserva" (D-050): everything can change, the date within the bookable range.
export async function editReservation(input: DatosEntrada & { id: string }): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const id = IdSchema.safeParse({ id: input.id });
  const datos = datosDe(input);
  if (!id.success || !datos) return { ok: false, code: "INVALID_INPUT" };

  try {
    const outcome = await updateReservation({ ...datos, id: id.data.id, sessionId: session.sessionId, ipHash: await ipHash() });
    if (outcome === "taken") return { ok: false, code: "ALREADY_TAKEN" };
    if (outcome === "missing") return { ok: false, code: "NOT_FOUND" };
    updateTag(AVAILABILITY_TAG);
    return { ok: true };
  } catch (error) {
    console.error("editReservation: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

export async function cancelReservation(input: { id: string }): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    const deleted = await deleteReservation({ id: parsed.data.id, sessionId: session.sessionId, ipHash: await ipHash() });
    if (!deleted) return { ok: false, code: "NOT_FOUND" };
    updateTag(AVAILABILITY_TAG);
    return { ok: true };
  } catch (error) {
    console.error("cancelReservation: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

// Modules loaded before D-046 have no reservation: they are freed one by one.
export async function unblockModule(input: { id: string }): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    const deleted = await deleteBlock({ id: parsed.data.id, sessionId: session.sessionId, ipHash: await ipHash() });
    if (!deleted) return { ok: false, code: "NOT_FOUND" };
    updateTag(AVAILABILITY_TAG);
    return { ok: true };
  } catch (error) {
    console.error("unblockModule: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

/**
 * The modules taken in a month, for the calendar of "Nueva reserva" (D-047). Date and module only.
 * `except`: the reservation being edited, whose own modules count as free (D-050).
 */
export async function takenInMonth(input: { month: string; except?: string }): Promise<ActionResult<{ taken: AvailabilityEntry[] }>> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = z.object({ month: z.string().refine(isValidIsoMonth), except: z.uuid().optional() }).safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    return { ok: true, data: { taken: await getTakenInMonth(parsed.data.month, parsed.data.except) } };
  } catch (error) {
    console.error("takenInMonth: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

// The panel then loads /admin/login as a full page (not a client navigation), so the login's
// pre-paint script runs (D-043).
export async function logout(): Promise<void> {
  const session = await requireAdmin();
  if (session) await revokeSession(session.sessionId, await ipHash());
  // cookies().delete() omits Secure, and browsers ignore a `__Host-` cookie without it (G-013).
  (await cookies()).set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
}
