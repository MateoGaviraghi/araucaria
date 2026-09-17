"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import {
  GLOBAL_MAX_FAILURES,
  MIN_FORM_FILL_MS,
  PASSWORD_MAX_LENGTH,
  PER_IP_MAX_FAILURES,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth/config";
import { clientIp, hashIp } from "@/lib/auth/ip";
import { verifyPassword } from "@/lib/auth/password";
import { hashSessionToken, newSessionToken } from "@/lib/auth/tokens";
import {
  countRecentFailures,
  createLoginSession,
  getCredential,
  purgeAfterLogin,
  recordFailedLogin,
  recordLockedLogin,
} from "@/lib/dal";

const LoginSchema = z.object({
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  // Honeypot: must stay empty (C-09).
  website: z.string(),
  renderedAt: z.coerce.number().int().positive(),
});

// Anonymous, public endpoint. Order is docs/08-SECURITY.md §5. The form data carries the
// password, so it is never logged (C-12).
export async function login(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const ipHash = hashIp(clientIp(await headers()));

    const failures = await countRecentFailures(ipHash);
    if (failures.perIp >= PER_IP_MAX_FAILURES) {
      await recordLockedLogin(ipHash, "ip");
      return { ok: false, code: "RATE_LIMITED" };
    }
    if (failures.global >= GLOBAL_MAX_FAILURES) {
      await recordLockedLogin(ipHash, "global");
      return { ok: false, code: "RATE_LIMITED" };
    }

    const parsed = LoginSchema.safeParse({
      password: formData.get("password"),
      website: formData.get("website"),
      renderedAt: formData.get("renderedAt"),
    });
    if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };
    const { password, website, renderedAt } = parsed.data;
    if (website !== "" || Date.now() - renderedAt < MIN_FORM_FILL_MS) {
      return { ok: false, code: "INVALID_CREDENTIALS" };
    }

    const credential = await getCredential();
    const valid = await verifyPassword(password, credential?.passwordHash ?? null);
    if (!valid || !credential) {
      await recordFailedLogin(ipHash);
      return { ok: false, code: "INVALID_CREDENTIALS" };
    }

    const token = newSessionToken();
    await createLoginSession({
      ipHash,
      tokenHash: hashSessionToken(token),
      credentialVersion: credential.credentialVersion,
    });
    (await cookies()).set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    await purgeAfterLogin();
  } catch (error) {
    console.error("login: unexpected failure", error);
    return { ok: false, code: "RETRY" };
  }
  // Outside the try: redirect() works by throwing.
  redirect("/admin");
}
