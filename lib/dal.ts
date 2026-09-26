import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, gt, gte, isNotNull, isNull, lt, lte, or, sql } from "drizzle-orm";
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
import { adminAudit, adminCredential, adminSessions, loginAttempts, moduleBlocks, reservations } from "@/lib/db/schema";
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
    // D-046: the client's name and phone are kept until 90 days after the date; the modules stay.
    db
      .update(reservations)
      .set({ clientName: null, clientPhone: null })
      .where(and(lt(reservations.date, sql`current_date - 90`), or(isNotNull(reservations.clientName), isNotNull(reservations.clientPhone)))),
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

// ---- Reservations (owner panel, D-046). Callers run requireAdmin() first.

const filaReserva = {
  blockId: moduleBlocks.id,
  date: moduleBlocks.date,
  module: moduleBlocks.module,
  reservationId: moduleBlocks.reservationId,
  clientName: reservations.clientName,
  clientPhone: reservations.clientPhone,
};

async function leerReservas(where: ReturnType<typeof and>, orden: "asc" | "desc", limite: number): Promise<Reserva[]> {
  const filas: FilaReserva[] = await db
    .select(filaReserva)
    .from(moduleBlocks)
    .leftJoin(reservations, eq(reservations.id, moduleBlocks.reservationId))
    .where(where)
    .orderBy(orden === "asc" ? asc(moduleBlocks.date) : desc(moduleBlocks.date), asc(moduleBlocks.module))
    .limit(limite);
  return agrupar(filas);
}

/** Every reservation of a month, in date order. */
export function getReservationsForMonth(month: IsoMonth): Promise<Reserva[]> {
  return leerReservas(
    and(gte(moduleBlocks.date, firstDayOfMonth(month)), lt(moduleBlocks.date, firstDayOfMonth(addMonthsToMonth(month, 1)))),
    "asc",
    200,
  );
}

/** From today on, in date order. The bookable range is 12 months, so 800 modules is every one. */
export function getUpcomingReservations(today: IsoDate): Promise<Reserva[]> {
  return leerReservas(and(gte(moduleBlocks.date, today)), "asc", 800);
}

/** Before today, newest first. */
export function getPastReservations(today: IsoDate, limite = 200): Promise<Reserva[]> {
  return leerReservas(and(lt(moduleBlocks.date, today)), "desc", limite);
}

/** The modules already taken on one date (for the "Nueva reserva" form). */
export async function getTakenModules(date: IsoDate): Promise<ModuleCode[]> {
  const filas = await db.select({ module: moduleBlocks.module }).from(moduleBlocks).where(eq(moduleBlocks.date, date));
  return filas.map((fila) => fila.module);
}

function isUniqueViolation(error: unknown): boolean {
  for (let current: unknown = error; current; current = (current as { cause?: unknown }).cause) {
    if ((current as { code?: unknown }).code === "23505") return true;
  }
  return false;
}

// The reservation, its one or two modules and the audit row in one batch (one transaction on the HTTP
// driver): "día completo" is atomic and the unique (date, module) constraint decides conflicts (D-003,
// G-006). The audit row carries no name or phone: it is kept 12 months, the client data only 90 days.
export async function insertReservation(input: {
  date: IsoDate;
  modules: ModuleCode[];
  clientName: string;
  clientPhone: string | null;
  sessionId: string;
  ipHash: string;
}): Promise<string | "taken"> {
  const id = randomUUID();
  try {
    await db.batch([
      db.insert(reservations).values({ id, date: input.date, clientName: input.clientName, clientPhone: input.clientPhone }),
      db.insert(moduleBlocks).values(input.modules.map((module) => ({ date: input.date, module, reservationId: id }))),
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
