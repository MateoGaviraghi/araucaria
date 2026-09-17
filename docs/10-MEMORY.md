# 10 — Memory

> Every decision, open question and gotcha of Araucaria, with its reason. Append-only: a changed decision is a new dated entry, never an edit.

## Decisions

### D-001 · 2026-09-16 · Phase 1 is the event salon only
**Decision:** a one-page landing for the SUM with an inquiry form that opens WhatsApp, plus an owner panel to cross out booked modules.
**Alternatives rejected:** full booking with Mercado Pago and automated WhatsApp now; one landing for all four spaces.
**Reasoning:** the client wants it fast; WABA approval alone takes 5–10 business days; the other spaces have different audiences and rental models.
**Reopen if:** phase 1 is live and working → phase 2 (Mateo, 2026-09-16).

### D-002 · 2026-09-16 · PRIMARY `A1` + SECONDARY `A5`
**Decision:** public static-marketing landing; the owner panel is a minimal internal tool in the same app.
**Alternatives rejected:** `A3 LEADGEN-TX` (the public stores nothing); `A5` as primary (the public page is the product).
**Reasoning:** the public submits nothing that persists; only the owner logs in. Security tier becomes `S1` + `S2` for the panel.
**Reopen if:** any public write is added (stored inquiries, online booking) → `A3`.

### D-003 · 2026-09-16 · Availability unit is `(date, module)`
**Decision:** rows `(date, 'mediodia' | 'noche')` with `unique (date, module)`. "Día completo" = both rows. The night module belongs to its start date.
**Alternatives rejected:** free time ranges with an `EXCLUDE` constraint; a separate "día completo" row.
**Reasoning:** the client sells three fixed modules (client's WhatsApp reply). Mateo: *"hay que respetar la función del multiespacio"*. Midnight becomes a display concern; uniqueness is one constraint.
**Reopen if:** the client starts selling other durations.

### D-004 · 2026-09-16 · Inquiry handoff through a `wa.me` link, nothing stored
**Decision:** the form builds the message in `05-API-CONTRACTS.md` §3 and opens `wa.me`. The number comes from `NEXT_PUBLIC_WHATSAPP_NUMBER`; testing uses Mateo's `5493425162081`.
**Alternatives rejected:** WhatsApp Cloud API (outbound templates, WABA); storing inquiries in the DB first.
**Reasoning:** the flow is inbound-only. A deep link needs no approval, no cost and no data retention.
**Reopen if:** phase 2 needs confirmations or reminders sent by the system.

### D-005 · 2026-09-16 · Hosting on Vercel Hobby
**Decision:** free plan, `*.vercel.app` link in the Instagram bio.
**Alternatives rejected:** Vercel Pro (monthly cost now); Cloudflare (Next.js adapter maturity unverified).
**Reasoning:** zero cost and zero friction for a fast phase 1. **Known risk:** Hobby's terms restrict use to non-commercial, personal projects and this is a client site. Accepted consciously; written in the proposal.
**Reopen if:** the domain is bought (phase 2) → Pro, quoted then.

### D-006 · 2026-09-16 · Database: Neon Postgres Free + Drizzle
**Alternatives rejected:** Supabase (vetoed by Mateo: free projects pause after inactivity); no database.
**Reasoning:** constraints enforce the availability invariant; same stack as Sanalys.
**Reopen if:** free-tier limits are reached.

### D-007 · 2026-09-16 · One shared admin password — deviation from `S2-01` and `S2-06`
**Decision:** a single `admin` account for the salon, protected by one generated passphrase and the controls C-01…C-15 of `08-SECURITY.md`.
**Alternatives rejected:** Auth.js with Google sign-in for allowlisted emails (recommended); Clerk Free; one password per person (recommended over a shared one).
**Reasoning:** Mateo's choice. His instruction was to apply `/seguridad` so the option is built securely, not to veto it. What a provider would add and this design lacks: MFA and email reset. Compensated by a generated passphrase, scrypt, per-IP and global limits, server-side sessions, one-step revocation and an audit trail.
**Reopen if:** phase 2 adds money or online booking; more than two people need access; one person must be revoked alone; any panel incident.

### D-008 · 2026-09-16 · Session lifetime 30 days
**Decision:** absolute 30 days.
**Alternatives rejected:** 7 days (recommended); 1 day.
**Reasoning:** Mateo's choice, for the owner's convenience on the phone. Compensated by a visible "Cerrar sesión" and by rotation killing every session.
**Reopen if:** a lost or shared phone incident.

### D-009 · 2026-09-16 · Prices and salon texts are content constants in the repo
**Decision:** `content/salon.ts`, edited by Mateo; a change is a deploy.
**Alternatives rejected:** editable from the panel.
**Reasoning:** prices change rarely; a CMS surface adds security scope for no current need.
**Reopen if:** the client asks for text or price changes more than about once a month.

### D-010 · 2026-09-16 · Design on the running site with `seccion-premium`; no visual mockups
**Decision:** every public section is designed through `/diseno` → `seccion-premium`, on the running app. The block order in `06-UI-UX.md` §2 is the structure. The client approves the visual design (`GATE V`) on the preview URL of the complete landing.
**Alternatives rejected:** structural mockups (`SM-1`) and a visual mockup before code.
**Reasoning:** Mateo's method for every project from 2026-09-16, proven on Sanalys. A one-page landing is small enough that the structure is visible in the built page.
**Reopen if:** the client needs to approve structure before any build.

### D-011 · 2026-09-16 · Address is Güemes 3660
**Decision:** show Güemes 3660.
**Alternatives rejected:** 3650 (Instagram screenshots).
**Reasoning:** the client's own WhatsApp reply says 3660; Mateo confirmed.
**Reopen if:** the client corrects it.

### D-012 · 2026-09-16 · No proposal, prices or timelines — the build starts directly
**Decision:** no `PROPOSAL-v1.md` and no `GATE P`. Prices, payment plans, hours estimates and dates are not part of this project's documentation. The build starts at WU-01.
**Alternatives rejected:** a one-page proposal accepted by WhatsApp (the workspace default for small projects).
**Reasoning:** Mateo's decision: *"haremos directo, no hablamos de precios ni de tiempos"*. This supersedes the phrase "written in the proposal" in `D-005`: the Vercel Hobby terms risk is recorded here and accepted by Mateo, not written into any client document.
**Reopen if:** Mateo asks for a proposal or a timeline.

### D-013 · 2026-09-16 · TypeScript pinned at 6.0.3, not 7.0.2 — closes `OQ-05`
**Decision:** `typescript` 6.0.3. Node.js stays on 24 (`engines.node: "24.x"`; 24.21.0 locally).
**Alternatives rejected:** `typescript` 7.0.2 as planned; running TS 7 for `tsc` side by side with the TS 6 API for `typescript-eslint` (an extra aliased dependency for no gain in phase 1).
**Reasoning:** verified in WU-01 on Node 24.21.0. With 7.0.2, `next build` and `tsc --noEmit` pass and do catch a deliberate type error, but `npm run lint` crashes: `typescript-eslint` 8.70.0, pulled in by `eslint-config-next` 16.3.5, throws "typescript-eslint does not support TS 7.0" (peer `>=4.8.4 <6.1.0`). Lint is a blocking CI gate. 6.0.3 is the newest release inside that range; with it `npm ci`, `build`, `typecheck` and `lint` pass. Node 24.x is offered by Vercel (its Node.js versions docs use `"24.x"` as the `engines` example); the first deploy log is the final confirmation. Mateo pre-approved the fallback in the WU-01 plan.
**Reopen if:** `typescript-eslint` supports TypeScript 7.

### D-014 · 2026-09-16 · Region: São Paulo for Vercel functions and Neon
**Decision:** Vercel function region `gru1`; Neon project in `aws-sa-east-1`.
**Alternatives rejected:** the defaults, `iad1` + `aws-us-east-1` (US East).
**Reasoning:** visitors and the owner are in Santa Fe; São Paulo is the closest region both providers offer (verified in the Neon account's region list), and the database sits next to the functions. Mateo: "sí".
**Reopen if:** the Vercel Hobby plan does not allow choosing `gru1` → both go to US East before the Neon project is created (its region is permanent).

### D-015 · 2026-09-16 · Vercel project name `araucaria-multiespacio`
**Decision:** the public link is `araucaria-multiespacio.vercel.app`, matching the Instagram handle.
**Alternatives rejected:** `araucaria` (`araucaria.vercel.app` already answers HTTP 200, so it is taken).
**Reasoning:** the link goes in the Instagram bio until the domain is bought. Mateo: "sí".
**Reopen if:** the domain is bought (phase 2).

### D-016 · 2026-09-16 · Neon root branch keeps its default name `production`
**Decision:** the Neon project `araucaria` (Postgres 18, `aws-sa-east-1`) has the root branch `production` for production and the child branch `dev` for local development and Vercel previews.
**Alternatives rejected:** renaming the root branch to `main`, as `07-INFRASTRUCTURE.md` first said.
**Reasoning:** Neon now creates the root branch as `production`; the name has no effect on the app, which only reads `DATABASE_URL`. Also confirmed while setting up WU-01: the Vercel project reports Node.js Version `24.x`, the last open check of `D-013`.
**Reopen if:** —

### D-017 · 2026-09-17 · WU-03 auth build choices
**Decision:**
- Layout additions: `lib/action-result.ts` (the `ActionResult` / `ErrorCode` types) and `app/admin/login/login-form.tsx` (the client form next to its page).
- WU-03 ships functional, undesigned `/admin/login` and `/admin` screens so the login is testable end to end; WU-04 completes them. The `/admin/*` headers (`noindex`, `no-store`) also ship in WU-03 instead of WU-09.
- The C-09 time trap starts when the form becomes usable in the browser (`useEffect`), because React's purity lint rule forbids `Date.now()` during render.
- On a successful login the session, the attempt row and the `login_ok` audit row are written in one `db.batch` (one transaction on the HTTP driver), so the audit row always carries the session id; then the cookie and the purges.
- `scripts/rotate-password.ts` runs on Node 24 type stripping, with no new dependency (`allowImportingTsExtensions` in `tsconfig.json`).
- `server-only` 0.0.1 guards `lib/dal.ts`.
**Alternatives rejected:** login screen only in WU-04 (the login could not be tested end to end); server render time for the time trap (lint error); running the script through `tsx`, which is only a transitive dependency of `drizzle-kit`.
**Reasoning:** Mateo answered "sí" to the three WU-03 questions on 2026-09-17; the rest follows from verification in WU-03.
**Reopen if:** WU-04 needs the login form elsewhere.

## Open questions

| ID | Question | Why it matters | Default until answered |
|---|---|---|---|
| OQ-01 | **`D-MEASURE`**: which number proves the site works, where it fires, what records it (in whose account), who reads it and when | Without it nobody can say whether phase 2 is justified | Proposal: "consultas enviadas por WhatsApp por semana", counted when the handoff status panel is shown. Tool and reader undecided. Set before launch (WU-09) |
| OQ-02 | The client contact's name, and the person who will hold the admin password | Ledger owner; password handover | `CI-02` |
| OQ-03 | Whether and when hosting and database move to client-owned accounts | `S1-15`: the client should own its accounts | Phase 2, with the domain |
| OQ-04 | Error tracking (e.g. a free Sentry plan) in phase 1 or not | Vercel logs last 1 hour | Not in phase 1 |
| OQ-05 | Vercel runtime support for Node 24 and Next 16.3 support for TypeScript 7 | Pinned versions in `02-STACK.md` | Verified in WU-01 |

## Gotchas

| ID | Gotcha |
|---|---|
| G-001 | The iPhone video is **HEVC**, which does not play in every browser. Every published video is transcoded to H.264 (`07-INFRASTRUCTURE.md`) |
| G-002 | In-memory rate limiting does nothing on Vercel: each invocation starts from zero. Counters live in Neon |
| G-003 | A stale public calendar is worse than no calendar: it tells people a taken date is free. The owner's discipline (`CI-03`) is part of the system |
| G-004 | Vercel Hobby keeps runtime logs for 1 hour. Anything needed later goes to `admin_audit` |
| G-005 | Node's `crypto.scrypt` defaults `maxmem` to 32 MiB; N = 2^17 with r = 8 needs ~128 MiB. Set `maxmem` explicitly or hashing throws |
| G-006 | The Neon HTTP driver has no interactive transactions. "Día completo" is one multi-row `INSERT`, which is atomic on its own |
| G-007 | `wa.me` numbers are digits only: Argentina mobile = `54` + `9` + area code without `0` + number without `15` |
| G-008 | `SameSite=Strict`: opening `/admin` from a link in another app (e.g. WhatsApp) sends no cookie on that first navigation, so the owner sees the login once. Bookmark the panel; a reload keeps the session |
| G-009 | Server Action IDs change between deploys (and at least every 14 days). An open panel tab can fail with "Failed to find Server Action"; `error.tsx` treats it as retryable |
| G-010 | "Today" must be computed in `America/Argentina/Buenos_Aires`. A UTC "today" is already tomorrow after 21:00 in Santa Fe |
| G-011 | `next dev` (16.3) appends a managed `<!-- BEGIN:nextjs-agent-rules -->` block to the repo's `CLAUDE.md`, and re-adds it on every run if removed (seen in WU-01). It is controlled by `agentRules` in `next.config.ts` (default `true`). Do not commit that block by accident |
| G-012 | npm 11.19 warns that `esbuild` (×3, via `drizzle-kit`) and `unrs-resolver` (via `eslint-config-next`) have install scripts "not yet covered by allowScripts". Verified in WU-01: build, lint and `drizzle-kit` work without approving them. Do not approve them blindly |
| G-013 | `cookies().delete()` sends no `Secure`, and browsers ignore any `Set-Cookie` for a `__Host-` cookie without it, so the session cookie would survive logout. Clear it with `set(name, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })` |
| G-014 | Next's Server Action origin check (C-07), verified in WU-03: a POST whose `Origin` differs from the host is aborted ("Invalid Server Actions request", HTTP 500, the action does not run). A POST with **no** `Origin` only logs a warning and runs. Browsers always send `Origin` on form POSTs, so that is not a CSRF path, and `SameSite=Strict` is the second layer. Test scripts must send a matching `Origin` |

## Dependencies reviewed

| Package | Why | Verdict |
|---|---|---|
| `next` 16.3.5 | Framework (`02-STACK.md`) | Approved with the stack. No `npm audit` finding |
| `react` · `react-dom` 19.3.0 | Required by Next 16 | Approved with the stack |
| `typescript` 6.0.3 | Types; 7.0.2 breaks lint (`D-013`) | Approved in the WU-01 plan as the fallback. Dev-only |
| `tailwindcss` · `@tailwindcss/postcss` 4.3.3 | Styling | Approved with the stack. Dev-only |
| `gsap` 3.15.0 | Motion | Approved with the stack |
| `lenis` 1.3.26 | Smooth scroll | Approved with the stack |
| `zod` 4.6.5 | Validation | Approved with the stack |
| `@neondatabase/serverless` 1.1.0 | Neon HTTP driver | Approved with the stack |
| `drizzle-orm` 0.45.2 | ORM | Approved with the stack |
| `drizzle-kit` 0.31.10 | Migrations CLI | Approved with the stack. Dev-only. `npm audit`: 4 moderate findings, all the same advisory (GHSA-67mh-4wv8-2f99, the `serve` dev server of esbuild ≤ 0.24.2) through its `@esbuild-kit/*` loader. Not reachable: the CLI is never deployed and its config loader does not start esbuild's dev server. The only offered fix downgrades `drizzle-kit` to 0.18.1 → not applied; re-check when `drizzle-kit` drops `@esbuild-kit` |
| `eslint` 9.39.5 | `npm run lint` (Next 16 has no `next lint`) | Approved by Mateo, 2026-09-16. Dev-only. npm marks 9.x as unsupported; 10.x is outside the peer range of the plugins inside `eslint-config-next` |
| `eslint-config-next` 16.3.5 | Next's rules: core-web-vitals, TypeScript, jsx-a11y | Approved by Mateo, 2026-09-16. Dev-only. Pulls in `typescript-eslint` 8.70.0 (TypeScript ≤ 6.0) |
| `@types/node` 24.13.5 · `@types/react` · `@types/react-dom` 19.3.0 | Type definitions for Node 24 and React 19 | Approved by Mateo, 2026-09-16. Types only, no runtime code |
| `server-only` 0.0.1 | Build fails if browser code imports `lib/dal.ts` (recommended by Next's auth guide) | Approved by Mateo, 2026-09-17. Official React package (maintainer sebmarkbage), no dependencies, no install script |
