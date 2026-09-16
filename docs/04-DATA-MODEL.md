# 04 — Data model

> The five tables of phase 1, the invariants the database enforces, the indexes and why each exists, and how data is purged.

Data tier: small `D4`. A real database exists only for the owner panel. **No customer or inquiry data is stored.** Dates are Postgres `date` (no timezone). Timestamps are `timestamptz`, compared in UTC; "today" for availability is computed in `America/Argentina/Buenos_Aires`.

## Tables

```sql
-- Availability: one row per crossed-out module.
create table module_blocks (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  module      text not null check (module in ('mediodia', 'noche')),
  created_at  timestamptz not null default now(),
  unique (date, module)
);

-- The single shared admin credential (exactly one row).
create table admin_credential (
  id                  smallint primary key default 1 check (id = 1),
  password_hash       text not null,        -- scrypt$N$r$p$saltB64$hashB64
  credential_version  integer not null default 1,
  rotated_at          timestamptz not null default now()
);

-- Server-side sessions. The cookie carries the raw token; only its hash is stored.
create table admin_sessions (
  id                  uuid primary key default gen_random_uuid(),
  token_hash          text not null unique, -- sha256 hex of the 32-byte random token
  credential_version  integer not null,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null, -- created_at + 30 days (D-008)
  revoked_at          timestamptz
);

-- Login attempts, for rate limiting. No raw IPs.
create table login_attempts (
  id        bigint generated always as identity primary key,
  ip_hash   text not null,                  -- HMAC-SHA256(IP_HASH_SALT, ip)
  at        timestamptz not null default now(),
  success   boolean not null
);

-- Audit of privileged actions.
create table admin_audit (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  action      text not null check (action in
                ('login_ok','login_fail','login_locked','logout',
                 'block','unblock','password_rotated')),
  detail      jsonb not null default '{}',  -- e.g. {"date":"2026-10-18","modules":["mediodia","noche"]}
  ip_hash     text,
  session_id  uuid
);
```

The SQL above is the contract. WU-02 writes it as a Drizzle schema and **generates** the migration. The generated SQL is reviewed against this file **before** it is applied.

## Invariants

| Invariant | Enforced by | Why not in the app |
|---|---|---|
| A module can be crossed out at most once per date | `unique (date, module)` | Two taps or two devices at once would both pass an app-level "check then insert" |
| "Día completo" is both modules, atomically | One `INSERT … VALUES (d,'mediodia'), (d,'noche')` statement | A single statement is atomic even on the Neon HTTP driver, which has no interactive transactions |
| Only `mediodia` and `noche` exist | `check (module in …)` | A typo in code cannot create a third module |
| Exactly one credential | `check (id = 1)` | A second row would make "the password" ambiguous |
| A session dies when the password rotates | `credential_version` compared on every `requireAdmin()` | Rotation must not depend on deleting rows correctly |

## Indexes

| Index | Serves | Reason |
|---|---|---|
| `unique (date, module)` on `module_blocks` | The invariant **and** the public read `where date between $today and $today + 12 months` | Its leading column is `date`, so the range read uses it; no extra index |
| `unique (token_hash)` on `admin_sessions` | `requireAdmin()` lookup on every panel request | Hot path |
| `(ip_hash, at)` on `login_attempts` | "failed attempts from this IP in the last 15 minutes" | Rate-limit query on every login |
| `(at)` on `login_attempts` | "failed attempts in the last 60 minutes" (global limit) and the 24 h purge | Range scan by time |
| `(at)` on `admin_audit` | 12-month purge | Range delete by time |

## Purges (no cron)

Purges run **inside the successful-login Server Action**, after the session is created. That avoids a scheduled job, which is the part that silently fails.

| Data | Kept | Purge |
|---|---|---|
| `login_attempts` | 24 hours | `delete where at < now() - interval '24 hours'` |
| `admin_sessions` | Until expired or revoked | `delete where expires_at < now() or revoked_at is not null` |
| `admin_audit` | 12 months | `delete where at < now() - interval '12 months'` |
| `module_blocks` | Indefinitely (tiny) | None in phase 1 |

## Migrations

- `drizzle-kit generate` writes SQL. **Generating is not applying.** Review the SQL, then apply with `db:migrate`.
- Migrations are forward-only files in the repo. Never edit an applied migration.
- Seeding the credential is a one-off script run by Mateo (`08-SECURITY.md` §6), never a migration: a migration would put the hash in git.

## Money

Prices are **not** in the database in phase 1. They live in `content/` constants (`D-009`). If prices move to the DB in phase 2, amounts go in `numeric(12,2)` with the currency stored, never implied.

## Alternatives Considered

| Option | Verdict |
|---|---|
| **`(date, module)` rows** | **Chosen (`D-003`)** |
| `tstzrange` + `EXCLUDE` constraint | **Rejected.** Correct for free time ranges; unnecessary for two fixed modules |
| A `note` column on blocks (who booked) | **Rejected for phase 1.** It is PII with no retention rule and no requirement. Reopen if the owner asks |
| Hash the password with argon2 via a native package | **Rejected.** A native dependency on serverless for no gain over scrypt with OWASP parameters |
