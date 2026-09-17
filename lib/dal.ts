import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, gt, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  GLOBAL_WINDOW_MINUTES,
  PER_IP_WINDOW_MINUTES,
  SESSION_COOKIE,
  SESSION_DAYS,
} from "@/lib/auth/config";
import { hashSessionToken, isWellFormedSessionToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db/client";
import { adminAudit, adminCredential, adminSessions, loginAttempts } from "@/lib/db/schema";

// The only module that imports the database client (docs/09-RULES.md §2).

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

export async function revokeSession(sessionId: string, ipHash: string): Promise<void> {
  await db.batch([
    db
      .update(adminSessions)
      .set({ revokedAt: sql`now()` })
      .where(and(eq(adminSessions.id, sessionId), isNull(adminSessions.revokedAt))),
    db.insert(adminAudit).values({ action: "logout", ipHash, sessionId }),
  ]);
}
