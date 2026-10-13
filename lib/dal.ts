import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, eq, gt, gte, isNotNull, isNull, lt, lte, ne, or, sql, type SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  GLOBAL_WINDOW_MINUTES,
  PER_IP_WINDOW_MINUTES,
  SESSION_COOKIE,
  SESSION_DAYS,
} from "@/lib/auth/config";
import { hashSessionToken, isWellFormedSessionToken } from "@/lib/auth/tokens";
import type { AvailabilityEntry, ModuleCode } from "@/components/calendar/month";
import { addMonthsToMonth, firstDayOfMonth, lastBookableDate, type IsoDate, type IsoMonth } from "@/lib/dates";
import { db } from "@/lib/db/client";
import { adminAudit, adminCredential, adminSessions, loginAttempts, moduleBlocks, moduleSettings, reservations } from "@/lib/db/schema";
import { AJUSTES_INICIALES, CODIGOS_AJUSTE, type Ajustes } from "@/lib/ajustes";
import { agrupar, type FilaReserva, type Reserva } from "@/lib/reservas";

// The only module that imports the database client (docs/09-RULES.md §2).

// Cache tag of the public availability read (docs/03-ARCHITECTURE.md §Rendering and caching).
export const AVAILABILITY_TAG = "availability";

export type AdminSession = { sessionId: string };

// C-05: the first call of every admin Server Action and admin page data read.
export const requireAdmin = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !isWellFormedSessionToken(token)) return null;

  const [session] = await db
    .select({ id: adminSessions.id })
    .from(adminSessions)
    // A rotated password bumps credential_version, which kills every older session.
    .innerJoin(adminCredential, eq(adminCredential.credentialVersion, adminSessions.credentialVersion))
    .where(
      and(
        eq(adminSessions.tokenHash, hashSessionToken(token)),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, sql`now()`),
      ),
    )
    .limit(1);

  return session ? { sessionId: session.id } : null;
});

export async function countRecentFailures(ipHash: string): Promise<{ perIp: number; global: number }> {
  const [row] = await db
    .select({
      perIp: sql<number>`count(*) filter (where ${loginAttempts.ipHash} = ${ipHash} and ${loginAttempts.at} > now() - make_interval(mins => ${PER_IP_WINDOW_MINUTES}))`.mapWith(Number),
      global: sql<number>`count(*)`.mapWith(Number),
    })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.success, false),
        gt(loginAttempts.at, sql`now() - make_interval(mins => ${GLOBAL_WINDOW_MINUTES})`),
      ),
    );
  return { perIp: row?.perIp ?? 0, global: row?.global ?? 0 };
}

export async function getCredential(): Promise<{ passwordHash: string; credentialVersion: number } | null> {
  const [row] = await db
    .select({ passwordHash: adminCredential.passwordHash, credentialVersion: adminCredential.credentialVersion })
    .from(adminCredential)
    .where(eq(adminCredential.id, 1))
    .limit(1);
  return row ?? null;
}

export async function recordLockedLogin(ipHash: string, scope: "ip" | "global"): Promise<void> {
  await db.insert(adminAudit).values({ action: "login_locked", detail: { scope }, ipHash });
}

export async function recordFailedLogin(ipHash: string): Promise<void> {
  await db.batch([
    db.insert(loginAttempts).values({ ipHash, success: false }),
    db.insert(adminAudit).values({ action: "login_fail", ipHash }),
  ]);
}

// Session, attempt and audit in one batch (a single transaction on the HTTP driver), so login_ok
// always carries the session id. The version is the one the password was verified against: if the
// password rotates meanwhile, this session is born invalid.
export async function createLoginSession(input: {
  ipHash: string;
  tokenHash: string;
  credentialVersion: number;
}): Promise<void> {
  const sessionId = randomUUID();
  await db.batch([
    db.insert(adminSessions).values({
      id: sessionId,
      tokenHash: input.tokenHash,
      credentialVersion: input.credentialVersion,
      expiresAt: sql`now() + make_interval(days => ${SESSION_DAYS})`,
    }),
    db.insert(loginAttempts).values({ ipHash: input.ipHash, success: true }),
    db.insert(adminAudit).values({ action: "login_ok", ipHash: input.ipHash, sessionId }),
  ]);
}

// docs/04-DATA-MODEL.md §Purges: run inside a successful login, no cron.
export async function purgeAfterLogin(): Promise<void> {
  await db.batch([
    db.delete(loginAttempts).where(lt(loginAttempts.at, sql`now() - interval '24 hours'`)),
    db.delete(adminSessions).where(or(lt(adminSessions.expiresAt, sql`now()`), isNotNull(adminSessions.revokedAt))),
    db.delete(adminAudit).where(lt(adminAudit.at, sql`now() - interval '12 months'`)),
    // D-046, D-050: the client's name, phone and the notes are kept until 90 days after the date; the
    // modules and the hours stay.
    db
      .update(reservations)
      .set({ clientName: null, clientPhone: null, notes: null })
      .where(
        and(
          lt(reservations.date, sql`current_date - 90`),
          or(isNotNull(reservations.clientName), isNotNull(reservations.clientPhone), isNotNull(reservations.notes)),
        ),
      ),
  ]);
}

// ---- Availability (public read). No session: it returns only date and module (C-15).

// Cached under the `availability` tag; every block/unblock calls updateTag, so a change is visible on
// the next request (G-003). The `hours` profile is the ceiling if a row is ever edited outside the app.
async function readAvailability(today: IsoDate): Promise<AvailabilityEntry[]> {
  "use cache";
  cacheTag(AVAILABILITY_TAG);
  cacheLife("hours");

  return db
    .select({ date: moduleBlocks.date, module: moduleBlocks.module })
    .from(moduleBlocks)
    .where(and(gte(moduleBlocks.date, today), lte(moduleBlocks.date, lastBookableDate(today))))
    .orderBy(asc(moduleBlocks.date), asc(moduleBlocks.module));
}

/** null when the database could not be read: the page still renders and says so (03-ARCHITECTURE.md). */
export async function getAvailability(today: IsoDate): Promise<AvailabilityEntry[] | null> {
  try {
    return await readAvailability(today);
  } catch (error) {
    console.error("getAvailability: availability unavailable", error);
    return null;
  }
}

// ---- Hours and prices of the modules (D-053). Public, no session: the site and the panel read them.

// Cached under the `modulos` tag, so the static shell carries them and "Guardar" in the panel
// (updateTag) shows the new values on the next request. If the table cannot be read, the values of
// docs/01-CONTEXT.md, and only for an hour.
export const MODULOS_TAG = "modulos";

export async function getModuleSettings(): Promise<Ajustes> {
  "use cache";
  cacheTag(MODULOS_TAG);
  try {
    const filas = await db.select().from(moduleSettings);
    cacheLife("days");
    const ajustes: Ajustes = { ...AJUSTES_INICIALES };
    for (const f of filas) ajustes[f.code] = { desde: f.startMin, hasta: f.endMin, precio: f.price };
    return ajustes;
  } catch (error) {
    console.error("getModuleSettings: settings unavailable, using the defaults", error);
    cacheLife("hours");
    return AJUSTES_INICIALES;
  }
}

/** The three rows and the audit in one batch. The audit keeps the new values (no personal data). */
export async function saveModuleSettings(ajustes: Ajustes, input: { sessionId: string; ipHash: string }): Promise<void> {
  const filas = CODIGOS_AJUSTE.map((code) => ({
    code,
    startMin: ajustes[code].desde,
    endMin: ajustes[code].hasta,
    price: ajustes[code].precio,
  }));
  await db.batch([
    db
      .insert(moduleSettings)
      .values(filas)
      .onConflictDoUpdate({
        target: moduleSettings.code,
        set: {
          startMin: sql`excluded.start_min`,
          endMin: sql`excluded.end_min`,
          price: sql`excluded.price`,
          updatedAt: sql`now()`,
        },
      }),
    db.insert(adminAudit).values({ action: "settings", detail: { ajustes }, ipHash: input.ipHash, sessionId: input.sessionId }),
  ]);
}

// ---- Reservations (owner panel, D-046). Callers run requireAdmin() first.

type Rango = { desde?: IsoDate; antesDe?: IsoDate };

function enRango(columna: typeof reservations.date | typeof moduleBlocks.date, rango: Rango): SQL | undefined {
  return and(rango.desde ? gte(columna, rango.desde) : undefined, rango.antesDe ? lt(columna, rango.antesDe) : undefined);
}

// From the reservations, so a "personalizado" that blocks no module is listed too (D-050), plus the
// modules loaded before D-046, which have no reservation.
async function leerReservas(rango: Rango, orden: "asc" | "desc", limite: number): Promise<Reserva[]> {
  const [conDatos, sueltos] = await Promise.all([
    db
      .select({
        blockId: moduleBlocks.id,
        date: reservations.date,
        module: moduleBlocks.module,
        reservationId: reservations.id,
        clientName: reservations.clientName,
        clientPhone: reservations.clientPhone,
        notes: reservations.notes,
        customFrom: reservations.customFrom,
        customTo: reservations.customTo,
      })
      .from(reservations)
      .leftJoin(moduleBlocks, eq(moduleBlocks.reservationId, reservations.id))
      .where(enRango(reservations.date, rango))
      .limit(limite),
    db
      .select({ blockId: moduleBlocks.id, date: moduleBlocks.date, module: moduleBlocks.module })
      .from(moduleBlocks)
      .where(and(isNull(moduleBlocks.reservationId), enRango(moduleBlocks.date, rango)))
      .limit(limite),
  ]);
  const filas: FilaReserva[] = [
    ...conDatos,
    ...sueltos.map((f) => ({ ...f, reservationId: null, clientName: null, clientPhone: null, notes: null, customFrom: null, customTo: null })),
  ];
  const inicio = (r: Reserva) => r.customFrom ?? (r.modules[0] === "noche" ? 1140 : 600);
  const signo = orden === "asc" ? 1 : -1;
  return agrupar(filas)
    .sort((a, b) => signo * (a.date.localeCompare(b.date) || inicio(a) - inicio(b)))
    .slice(0, limite);
}

/** Every reservation of a month, in date order. */
export function getReservationsForMonth(month: IsoMonth): Promise<Reserva[]> {
  return leerReservas({ desde: firstDayOfMonth(month), antesDe: firstDayOfMonth(addMonthsToMonth(month, 1)) }, "asc", 200);
}

/** From today on, in date order. The bookable range is 12 months, so 800 rows is every one. */
export function getUpcomingReservations(today: IsoDate): Promise<Reserva[]> {
  return leerReservas({ desde: today }, "asc", 800);
}

/** Before today, newest first. */
export function getPastReservations(today: IsoDate, limite = 200): Promise<Reserva[]> {
  return leerReservas({ antesDe: today }, "desc", limite);
}

/**
 * Every module taken in a month, for the calendar of "Nueva reserva" (D-047). While editing, the
 * reservation's own modules count as free (D-050).
 */
export function getTakenInMonth(month: IsoMonth, except?: string): Promise<AvailabilityEntry[]> {
  return db
    .select({ date: moduleBlocks.date, module: moduleBlocks.module })
    .from(moduleBlocks)
    .where(
      and(
        enRango(moduleBlocks.date, { desde: firstDayOfMonth(month), antesDe: firstDayOfMonth(addMonthsToMonth(month, 1)) }),
        except ? or(isNull(moduleBlocks.reservationId), ne(moduleBlocks.reservationId, except)) : undefined,
      ),
    )
    .orderBy(asc(moduleBlocks.date), asc(moduleBlocks.module));
}

function hasCode(error: unknown, code: string): boolean {
  for (let current: unknown = error; current; current = (current as { cause?: unknown }).cause) {
    if ((current as { code?: unknown }).code === code) return true;
  }
  return false;
}

const isUniqueViolation = (error: unknown) => hasCode(error, "23505");

/** What the owner loads in "Nueva reserva" and "Editar reserva". */
export type DatosDeReserva = {
  date: IsoDate;
  /** The modules it blocks: one, both, or for a "personalizado" the ones its hours overlap (maybe none). */
  modules: ModuleCode[];
  clientName: string;
  clientPhone: string | null;
  notes: string | null;
  customFrom: number | null;
  customTo: number | null;
};

type Batch = [BatchItem<"pg">, ...BatchItem<"pg">[]];

const filaDeReserva = (datos: DatosDeReserva) => ({
  date: datos.date,
  clientName: datos.clientName,
  clientPhone: datos.clientPhone,
  notes: datos.notes,
  customFrom: datos.customFrom,
  customTo: datos.customTo,
});

const bloquesDe = (id: string, datos: DatosDeReserva) =>
  datos.modules.length
    ? [db.insert(moduleBlocks).values(datos.modules.map((module) => ({ date: datos.date, module, reservationId: id })))]
    : [];

// The reservation, its one or two modules and the audit row in one batch (one transaction on the HTTP
// driver): "día completo" is atomic and the unique (date, module) constraint decides conflicts (D-003,
// G-006). The audit row carries no name or phone: it is kept 12 months, the client data only 90 days.
export async function insertReservation(input: DatosDeReserva & { sessionId: string; ipHash: string }): Promise<string | "taken"> {
  const id = randomUUID();
  try {
    await db.batch([
      db.insert(reservations).values({ id, ...filaDeReserva(input) }),
      ...bloquesDe(id, input),
      db.insert(adminAudit).values({
        action: "block",
        detail: { date: input.date, modules: input.modules, reservation: id },
        ipHash: input.ipHash,
        sessionId: input.sessionId,
      }),
    ]);
    return id;
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
}

// The reservation, its modules and the audit row in one batch (one transaction): the old modules go and
// the new ones come in, so a taken date fails as a whole and nothing changes (D-050). The audit row is
// written only if the reservation still exists, and like "block" it carries no name, phone or notes.
export async function updateReservation(
  input: DatosDeReserva & { id: string; sessionId: string; ipHash: string },
): Promise<"ok" | "taken" | "missing"> {
  const detalle = JSON.stringify({ date: input.date, modules: input.modules, reservation: input.id });
  const batch: Batch = [
    db.update(reservations).set(filaDeReserva(input)).where(eq(reservations.id, input.id)).returning({ id: reservations.id }),
    db.delete(moduleBlocks).where(eq(moduleBlocks.reservationId, input.id)),
    ...bloquesDe(input.id, input),
    db.execute(sql`
      insert into ${adminAudit} (action, detail, ip_hash, session_id)
      select 'edit', ${detalle}::jsonb, ${input.ipHash}, ${input.sessionId}
      where exists (select 1 from ${reservations} where ${reservations.id} = ${input.id})
    `),
  ];
  try {
    const [actualizadas] = (await db.batch(batch)) as unknown as [{ id: string }[]];
    return actualizadas.length ? "ok" : "missing";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    // Its new modules point to a reservation cancelled meanwhile.
    if (hasCode(error, "23503")) return "missing";
    throw error;
  }
}

// Deleting the reservation deletes its modules (on delete cascade); audited in the same statement.
// null when it no longer exists.
export async function deleteReservation(input: { id: string; sessionId: string; ipHash: string }): Promise<{ date: IsoDate } | null> {
  const result = await db.execute<{ date: IsoDate }>(sql`
    with modulos as (
      select coalesce(jsonb_agg(${moduleBlocks.module} order by ${moduleBlocks.module}), '[]'::jsonb) as lista
      from ${moduleBlocks} where ${moduleBlocks.reservationId} = ${input.id}
    ),
    deleted as (
      delete from ${reservations} where ${reservations.id} = ${input.id}
      returning ${reservations.date}
    )
    insert into ${adminAudit} (action, detail, ip_hash, session_id)
    select 'unblock', jsonb_build_object('date', deleted.date, 'modules', modulos.lista, 'reservation', ${input.id}::text), ${input.ipHash}, ${input.sessionId}
    from deleted, modulos
    returning detail ->> 'date' as date
  `);
  return result.rows[0] ?? null;
}

// Delete and audit in one statement; null when the block no longer exists.
export async function deleteBlock(input: {
  id: string;
  sessionId: string;
  ipHash: string;
}): Promise<{ date: IsoDate; module: ModuleCode } | null> {
  const result = await db.execute<{ date: IsoDate; module: ModuleCode }>(sql`
    with deleted as (
      delete from ${moduleBlocks} where ${moduleBlocks.id} = ${input.id}
      returning ${moduleBlocks.date}, ${moduleBlocks.module}
    )
    insert into ${adminAudit} (action, detail, ip_hash, session_id)
    select 'unblock', jsonb_build_object('date', deleted.date, 'module', deleted.module), ${input.ipHash}, ${input.sessionId}
    from deleted
    returning detail ->> 'date' as date, detail ->> 'module' as module
  `);
  return result.rows[0] ?? null;
}

export async function revokeSession(sessionId: string, ipHash: string): Promise<void> {
  await db.batch([
    db
      .update(adminSessions)
      .set({ revokedAt: sql`now()` })
      .where(and(eq(adminSessions.id, sessionId), isNull(adminSessions.revokedAt))),
    db.insert(adminAudit).values({ action: "logout", ipHash, sessionId }),
  ]);
}
