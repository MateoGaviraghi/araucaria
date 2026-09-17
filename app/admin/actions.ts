"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth/config";
import { clientIp, hashIp } from "@/lib/auth/ip";
import { requireAdmin, revokeSession } from "@/lib/dal";

// Admin Server Actions are public endpoints: requireAdmin() comes first (C-05).
// blockModules and unblockModule arrive in WU-04.

export async function logout(): Promise<void> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  await revokeSession(session.sessionId, hashIp(clientIp(await headers())));
  // cookies().delete() omits Secure, and browsers ignore a `__Host-` cookie without it.
  (await cookies()).set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  redirect("/admin/login");
}
