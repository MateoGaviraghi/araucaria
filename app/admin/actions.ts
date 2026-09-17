"use server";

import { updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { BlockChoice, ModuleCode } from "@/components/calendar/month";
import type { ActionResult } from "@/lib/action-result";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth/config";
import { clientIp, hashIp } from "@/lib/auth/ip";
import { AVAILABILITY_TAG, deleteBlock, insertBlocks, requireAdmin, revokeSession } from "@/lib/dal";
import { isValidIsoDate, lastBookableDate, todayInBuenosAires } from "@/lib/dates";

// Admin Server Actions are public endpoints: requireAdmin() comes first (C-05), then zod (C-08).

const BlockSchema = z.object({
  date: z.string().refine(isValidIsoDate),
  choice: z.enum(["mediodia", "noche", "dia-completo"]),
});

const UnblockSchema = z.object({ id: z.uuid() });

export async function blockModules(input: { date: string; choice: BlockChoice }): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = BlockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };
  const { date, choice } = parsed.data;
  const today = todayInBuenosAires();
  if (date < today || date > lastBookableDate(today)) return { ok: false, code: "INVALID_INPUT" };

  try {
    const modules: ModuleCode[] = choice === "dia-completo" ? ["mediodia", "noche"] : [choice];
    const outcome = await insertBlocks({
      date,
      modules,
      sessionId: session.sessionId,
      ipHash: hashIp(clientIp(await headers())),
    });
    if (outcome === "taken") return { ok: false, code: "ALREADY_TAKEN" };
    // updateTag, not revalidateTag: the next visitor must not get the stale calendar (G-003, D-018).
    updateTag(AVAILABILITY_TAG);
    return { ok: true };
  } catch (error) {
    console.error("blockModules: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

export async function unblockModule(input: { id: string }): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const parsed = UnblockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  try {
    const deleted = await deleteBlock({
      id: parsed.data.id,
      sessionId: session.sessionId,
      ipHash: hashIp(clientIp(await headers())),
    });
    if (!deleted) return { ok: false, code: "NOT_FOUND" };
    updateTag(AVAILABILITY_TAG);
    return { ok: true };
  } catch (error) {
    console.error("unblockModule: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
}

export async function logout(): Promise<void> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  await revokeSession(session.sessionId, hashIp(clientIp(await headers())));
  // cookies().delete() omits Secure, and browsers ignore a `__Host-` cookie without it (G-013).
  (await cookies()).set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  redirect("/admin/login");
}
