"use server";

import { updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import type { ModuleCode } from "@/components/calendar/month";
import type { ActionResult } from "@/lib/action-result";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth/config";
import { clientIp, hashIp } from "@/lib/auth/ip";
import {
  AVAILABILITY_TAG,
  deleteBlock,
  deleteReservation,
  getTakenModules,
  insertReservation,
  requireAdmin,
  revokeSession,
} from "@/lib/dal";
import { isValidIsoDate, lastBookableDate, todayInBuenosAires } from "@/lib/dates";

// Admin Server Actions are public endpoints: requireAdmin() comes first (C-05), then zod (C-08).

const Fecha = z.string().refine(isValidIsoDate);

const ReservaSchema = z.object({
  date: Fecha,
  choice: z.enum(["mediodia", "noche", "dia-completo"]),
  clientName: z.string().trim().min(1).max(80),
  // The 10 national digits, without 0 or 15 (the public form's format, D-034); optional (D-046).
  clientPhone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((digits) => digits === "" || /^[1-9][0-9]{9}$/.test(digits)),
});

const IdSchema = z.object({ id: z.uuid() });

const inRange = (date: string) => {
  const today = todayInBuenosAires();
  return date >= today && date <= lastBookableDate(today);
};

async function ipHash() {
  return hashIp(clientIp(await headers()));
}

export async function createReservation(input: {
  date: string;
  choice: string;
  clientName: string;
  clientPhone: string;
}): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = ReservaSchema.safeParse(input);
  if (!parsed.success || !inRange(parsed.data.date)) return { ok: false, code: "INVALID_INPUT" };
  const { date, choice, clientName, clientPhone } = parsed.data;

  try {
    const modules: ModuleCode[] = choice === "dia-completo" ? ["mediodia", "noche"] : [choice];
    const outcome = await insertReservation({
      date,
      modules,
      clientName,
      clientPhone: clientPhone ? `+54${clientPhone}` : null,
      sessionId: session.sessionId,
      ipHash: await ipHash(),
    });
    if (outcome === "taken") return { ok: false, code: "ALREADY_TAKEN" };
    // updateTag, not revalidateTag: the next visitor must not get the stale calendar (G-003, D-018).
    updateTag(AVAILABILITY_TAG);
    return { ok: true, data: { id: outcome } };
  } catch (error) {
    console.error("createReservation: unexpected failure", error);
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

/** Which modules are already taken on a date, for the "Nueva reserva" form. */
export async function takenModules(input: { date: string }): Promise<ActionResult<{ modules: ModuleCode[] }>> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = z.object({ date: Fecha }).safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    return { ok: true, data: { modules: await getTakenModules(parsed.data.date) } };
  } catch (error) {
    console.error("takenModules: unexpected failure", error);
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
