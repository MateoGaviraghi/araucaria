import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, eq, gt, gte, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  GLOBAL_WINDOW_MINUTES,
  PER_IP_WINDOW_MINUTES,
  SESSION_COOKIE,
  SESSION_DAYS,
} from "@/lib/auth/config";
import { hashSessionToken, isWellFormedSessionToken } from "@/lib/auth/tokens";
import type { Block, ModuleCode } from "@/components/calendar/month";
import { addMonthsToMonth, firstDayOfMonth, type IsoDate, type IsoMonth } from "@/lib/dates";
import { db } from "@/lib/db/client";
import { adminAudit, adminCredential, adminSessions, loginAttempts, moduleBlocks } from "@/lib/db/schema";

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
  ]);
}

// ---- Availability (owner panel). Callers run requireAdmin() first.

export async function getBlocksForMonth(month: IsoMonth): Promise<Block[]> {
  return db
    .select({ id: moduleBlocks.id, date: moduleBlocks.date, module: moduleBlocks.module })
    .from(moduleBlocks)
    .where(
      and(
        gte(moduleBlocks.date, firstDayOfMonth(month)),
        lt(moduleBlocks.date, firstDayOfMonth(addMonthsToMonth(month, 1))),
      ),
    )
    .orderBy(asc(moduleBlocks.date), asc(moduleBlocks.module));
}

function isUniqueViolation(error: unknown): boolean {
  for (let current: unknown = error; current; current = (current as { cause?: unknown }).cause) {
    if ((current as { code?: unknown }).code === "23505") return true;
  }
  return false;
}

// One INSERT of one or two rows plus its audit row, in one transaction: "día completo" is atomic and
// the unique (date, module) constraint decides conflicts (D-003, G-006).
export async function insertBlocks(input: {
  date: IsoDate;
  modules: ModuleCode[];
  sessionId: string;
  ipHash: string;
}): Promise<"ok" | "taken"> {
  try {
    await db.batch([
      db.insert(moduleBlocks).values(input.modules.map((module) => ({ date: input.date, module }))),
      db.insert(adminAudit).values({
        action: "block",
        detail: { date: input.date, modules: input.modules },
        ipHash: input.ipHash,
        sessionId: input.sessionId,
      }),
    ]);
    return "ok";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
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
