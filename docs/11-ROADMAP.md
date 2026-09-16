# 11 — Roadmap

> The work units of phase 1, in dependency order, and what phase 2 contains.

## Before the build

| Step | State |
|---|---|
| Docs package (this repo) | Written 2026-09-16 |
| Proposal, prices, timelines | **None** — the build starts directly (`D-012`) |
| `OQ-01` (`D-MEASURE`) answered | Before launch (WU-09) |

## Phase 1 — work units

Each unit starts with a plan table and Mateo's GO-AHEAD. Review class per `09-RULES.md` §6.

| WU | Unit | Delivers | Class | Depends on |
|---|---|---|---|---|
| WU-01 | Scaffold | Next.js app with pinned versions (`02-STACK.md`), Tailwind, lint/typecheck scripts, repo layout (`09-RULES.md` §1), Vercel project, Neon project + dev branch, env var names set, `OQ-05` verified | R1 | — |
| WU-02 | Data layer | Drizzle schema = `04-DATA-MODEL.md`; migration generated, reviewed, applied to dev | R2 | WU-01 |
| WU-03 | Auth | `lib/auth` (scrypt, tokens, ip hash, limits), `login`/`logout`, `requireAdmin()`, `proxy.ts` redirect, audit, purges, `scripts/rotate-password.ts`, seeded dev credential | R2 | WU-02 |
| WU-04 | Owner panel | `/admin/login`, `/admin` month calendar, `blockModules` / `unblockModule`, feedback copy (`06-UI-UX.md` §5) | R2 | WU-03 |
| WU-05 | Public availability | `getAvailability()` with tag cache and revalidation; shared calendar logic (day states, module enablement, Buenos Aires "today") | R1 | WU-02 |
| WU-06 | Media pipeline | Transcoded hero video + posters, gallery tiles, cropped photos in `public/media/`, within budget | R0 | WU-01 |
| WU-07 | Landing sections | Built **one by one with `seccion-premium`, in the order Mateo names**: `NAV` · `HERO` · gallery · amenities · modules and prices · location · footer | R0/R1 | WU-06 |
| WU-08 | Inquiry form + calendar | `LEAD-FORM` with the calendar (`seccion-premium` round), zod validation, `lib/whatsapp.ts`, handoff status panel; message tested on iPhone, Android and WhatsApp Web to the test number | R1 | WU-05, WU-07 |
| WU-09 | Hardening and launch | Headers + CSP, `08-SECURITY.md` §8 checklist, `ACC-1` + `ACC-2`, performance gates, backup restore test, production credential rotated and handed over, `GATE V` on the preview URL, production link for the Instagram bio | R2/R3 | all |

## External lead times

| Item | Blocks | Owner |
|---|---|---|
| WhatsApp number that receives inquiries (`CI-01`) | Launch (testing uses Mateo's number) | Client |
| Original photos, videos and logo (`CR-01`…`CR-03`) | Final look; build proceeds with temporary assets | Client, via Mateo |

## Phase 2 (after phase 1 is live and working)

| Item | Implies |
|---|---|
| Online booking with availability held while paying | Archetype moves to `A3`; public writes; spam controls |
| Mercado Pago, 100% payment at booking | Webhooks with signature verification and idempotency; money columns; cancellation/refund policy from the client |
| Automated WhatsApp confirmation + day-before reminder | WABA + template approval (5–10 business days, start in week 1); dedicated number; scheduled job with an execution log |
| The other spaces: offices (monthly, inquiry), consulting rooms and meeting room (hourly, online) | New content, a different availability model |
| Own domain, Vercel Pro, client-owned accounts | `D-005`, `OQ-03` |
| Login with a maintained provider and MFA | `D-007` reopen trigger |
