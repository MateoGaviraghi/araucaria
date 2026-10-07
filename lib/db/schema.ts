import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// The contract is the SQL in docs/04-DATA-MODEL.md. Review every generated migration against it.

export const MODULE_CODES = ["mediodia", "noche"] as const;

export const AUDIT_ACTIONS = [
  "login_ok",
  "login_fail",
  "login_locked",
  "logout",
  "block",
  "unblock",
  "password_rotated",
  "edit",
] as const;

// A reservation the owner loads in the panel (D-046): who booked a date. Its modules are rows of
// module_blocks pointing here. Personal data, admin-only: never read by the public page (C-15), and
// name, phone and notes are cleared 90 days after the date (docs/04-DATA-MODEL.md §Purges).
// A "personalizado" one (D-050) carries its hours and blocks the modules they overlap, maybe none.
export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date", { mode: "string" }).notNull(),
    // null only after the 90-day purge
    clientName: text("client_name"),
    // "+54" followed by the 10 national digits (D-034), or null when not given
    clientPhone: text("client_phone"),
    // what the owner writes down about it (D-050), or null
    notes: text("notes"),
    // "Personalizado" hours, in minutes from 00:00 of the date; past 1440 is the next day (D-050).
    // Both null for a module, "día completo", or a reservation loaded before D-050.
    customFrom: smallint("custom_from"),
    customTo: smallint("custom_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("reservations_client_name_check", sql`char_length(${t.clientName}) between 1 and 80`),
    check("reservations_client_phone_check", sql`${t.clientPhone} ~ '^[+]54[0-9]{10}$'`),
    check("reservations_notes_check", sql`char_length(${t.notes}) between 1 and 500`),
    check(
      "reservations_custom_hours_check",
      sql`(${t.customFrom} is null and ${t.customTo} is null) or (${t.customFrom} between 480 and 1410 and ${t.customTo} > ${t.customFrom} and ${t.customTo} <= 1800 and ${t.customFrom} % 30 = 0 and ${t.customTo} % 30 = 0)`,
    ),
    index("reservations_date_idx").on(t.date),
  ],
);

// Availability: one row per crossed-out module. "Día completo" is both rows (D-003). Rows loaded
// before D-046 have no reservation.
export const moduleBlocks = pgTable(
  "module_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // "string" mode keeps 'YYYY-MM-DD' untouched; a JS Date would shift the day by timezone (G-010).
    date: date("date", { mode: "string" }).notNull(),
    module: text("module", { enum: MODULE_CODES }).notNull(),
    // Cancelling a reservation deletes its modules with it.
    reservationId: uuid("reservation_id").references(() => reservations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("module_blocks_date_module_key").on(t.date, t.module),
    check("module_blocks_module_check", sql`${t.module} in ('mediodia', 'noche')`),
    index("module_blocks_reservation_id_idx").on(t.reservationId),
  ],
);

// The single shared admin credential (exactly one row).
export const adminCredential = pgTable(
  "admin_credential",
  {
    id: smallint("id").primaryKey().default(1),
    // scrypt$N$r$p$saltB64$hashB64
    passwordHash: text("password_hash").notNull(),
    credentialVersion: integer("credential_version").notNull().default(1),
    rotatedAt: timestamp("rotated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("admin_credential_id_check", sql`${t.id} = 1`)],
);

// Server-side sessions. The cookie carries the raw token; only its sha256 hex is stored.
export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique("admin_sessions_token_hash_key"),
  credentialVersion: integer("credential_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // created_at + 30 days (D-008)
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

// Login attempts, for rate limiting. No raw IPs.
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    // HMAC-SHA256(IP_HASH_SALT, ip)
    ipHash: text("ip_hash").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    success: boolean("success").notNull(),
  },
  (t) => [
    index("login_attempts_ip_hash_at_idx").on(t.ipHash, t.at),
    index("login_attempts_at_idx").on(t.at),
  ],
);

// Audit of privileged actions, kept 12 months.
export const adminAudit = pgTable(
  "admin_audit",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    action: text("action", { enum: AUDIT_ACTIONS }).notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
    ipHash: text("ip_hash"),
    sessionId: uuid("session_id"),
  },
  (t) => [
    check(
      "admin_audit_action_check",
      sql`${t.action} in ('login_ok', 'login_fail', 'login_locked', 'logout', 'block', 'unblock', 'password_rotated', 'edit')`,
    ),
    index("admin_audit_at_idx").on(t.at),
  ],
);
