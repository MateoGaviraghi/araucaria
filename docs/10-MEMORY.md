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

## Dependencies reviewed

| Package | Why | Verdict |
|---|---|---|
| — | Filled in WU-01 for every package added | — |
