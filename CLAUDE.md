# CLAUDE.md — Araucaria · Event salon (phase 1)

> Read this file in full before doing anything, then the doc your task points to. Ground every action in `docs/` and in the code. If a fact is not written there, say so instead of guessing: a wrong price, hour or phone on a live client site is a real-world failure, not a code smell.

## 0. Mode

This is a **build repo**: source code is written here (a Next.js app). Talk to Mateo in Spanish. Every `.md` is in English. UI copy is Argentine Spanish ("vos", not "tú").

## 1. What this is

Phase 1 of **Araucaria Multiespacio** (Güemes 3660, Santa Fe) has two parts:

- **Public landing (one page)** for the **event salon (SUM)**: gallery with photos and videos, amenities, the three modules with prices, an availability calendar, and a form that opens **WhatsApp with a complete prefilled message**. Nothing the public submits is stored.
- **Owner panel (`/admin`)** behind one shared password, where the owner crosses out booked modules so the public calendar shows them as taken.

Phase 2 (online booking, Mercado Pago, automated WhatsApp, the other spaces, own domain) is **out of scope**; see `docs/00-OVERVIEW.md`.

## 2. Where to look

| You are doing | Read |
|---|---|
| Anything, first time | this file → `WORKLOG.md` §1 (where the work stands) → `docs/00-OVERVIEW.md` → `docs/10-MEMORY.md` |
| Picking up after another chat: what was built, what was verified, what is half-done | `WORKLOG.md` (§1 state, §2 the log of every chat) |
| Salon facts: amenities, capacity, modules, prices, rules, address, contact | `docs/01-CONTEXT.md` — the only source |
| Adding or upgrading a dependency | `docs/02-STACK.md` |
| How the parts connect, the midnight rule, failure modes | `docs/03-ARCHITECTURE.md` |
| Tables, constraints, purges, migrations | `docs/04-DATA-MODEL.md` |
| Server Action signatures, the exact WhatsApp message | `docs/05-API-CONTRACTS.md` |
| Any public section or admin screen | `docs/06-UI-UX.md` + `/diseno` → `seccion-premium` (§5 below) |
| Env vars, deploy, media pipeline, backups | `docs/07-INFRASTRUCTURE.md` |
| Login, sessions, rate limits, audit — **before touching `/admin` or any Server Action** | `docs/08-SECURITY.md` |
| Conventions, forbidden things, review classes — **before the first commit** | `docs/09-RULES.md` |
| Why anything is the way it is — **before reopening a decision** | `docs/10-MEMORY.md` |
| What to build next | `docs/11-ROADMAP.md` |
| What the client still owes | `docs/12-CLIENT-INPUTS.md` |

## 3. Non-negotiables

1. **Never invent a fact about the salon.** Prices, capacity, hours, amenities and rules come from `docs/01-CONTEXT.md`. Missing → `{{CONFIRMAR}}` in the markup, named in the handoff.
2. **Every Server Action is a public endpoint.** It authenticates first (admin actions: `requireAdmin()` on the first line), validates its input with a zod schema, and returns a narrow result. Hiding UI is not security; `proxy.ts` only redirects.
3. **Availability is `(date, module)`**, with module `mediodia` or `noche`. "Día completo" is never stored: it is both modules. The database unique constraint is the authority, not the app.
4. **The WhatsApp number comes from `NEXT_PUBLIC_WHATSAPP_NUMBER`**, never hardcoded.
5. **Never create a `.env.example`.** Env var names live in `docs/07-INFRASTRUCTURE.md`; values only in Vercel.
6. **Never store the password, a session token or a raw IP.** Hashes only (`docs/08-SECURITY.md`).
7. **No mockups, wireframes, Figma or standalone HTML.** Design happens on the running site through `seccion-premium`.

## 4. Commands

Planned in WU-01 (`docs/11-ROADMAP.md`). If a script does not exist yet, say so instead of inventing it.

```bash
npm run dev          # local, http://localhost:3000
npm run build        # must pass before any push
npm run lint
npm run typecheck
npm run db:generate  # drizzle-kit: generate a migration from the schema — review it
npm run db:migrate   # apply migrations — never against production without review
```

Deploy: Vercel, `main` → production (`*.vercel.app`), other branches → preview URL.

## 5. Skills

| Work | Load first |
|---|---|
| Any public section, component or animation | `/diseno` → `seccion-premium`. Mateo names the section; references before plans; build on the running site; look at it at 375, 1440 and 1920 before reporting |
| Auth, Server Actions, headers, anything in `docs/08-SECURITY.md` | `/seguridad` |
| Deploy | `/deploy` |
| Review or cleanup | `/codigo-limpio` |

## 6. Working mode

- Multi-file work: state the plan as a table (file · what · governed by) and wait for Mateo's written GO-AHEAD.
- A changed decision is a **new** dated `D-NNN` appended to `docs/10-MEMORY.md`. History is never edited.
- Commit and push only when Mateo says so.
