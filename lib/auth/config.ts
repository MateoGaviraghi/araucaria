// Auth constants from docs/08-SECURITY.md. No imports here: proxy.ts and
// scripts/rotate-password.ts load this file too.

export const SESSION_COOKIE = "__Host-araucaria_admin";

// D-008: absolute 30-day sessions.
export const SESSION_DAYS = 30;

// C-04. The `__Host-` prefix requires Secure, Path=/ and no Domain, also when clearing it.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
} as const;

// §5 limits, counted in Neon (G-002).
export const PER_IP_MAX_FAILURES = 5;
export const PER_IP_WINDOW_MINUTES = 15;
export const GLOBAL_MAX_FAILURES = 20;
export const GLOBAL_WINDOW_MINUTES = 60;

// C-09 time trap.
export const MIN_FORM_FILL_MS = 2000;

export const PASSWORD_MAX_LENGTH = 200;

// C-01: 6 random words or at least 20 random characters.
export const MIN_PASSPHRASE_LENGTH = 20;
