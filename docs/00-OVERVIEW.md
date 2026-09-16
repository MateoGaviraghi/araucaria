# 00 — Overview

> What phase 1 of Araucaria is, how success is judged, and what is deliberately not built.

## Vision

Araucaria Multiespacio is a renovated house in Santa Fe that rents several spaces. Today every inquiry for the event salon arrives by WhatsApp, and the owner answers availability by hand.

Phase 1 gives the salon one professional page for the Instagram bio. The visitor:

1. sees the space;
2. sees the three modules and their prices;
3. picks a free date and module;
4. sends a complete inquiry to WhatsApp in one tap.

The owner crosses out booked modules in a small panel, so people stop asking for dates that are already taken.

The client asked for speed. Phase 1 is the smallest thing that does that job well.

## Scope — phase 1

| Part | What it does |
|---|---|
| Public landing (`/`) | Gallery (photos + videos), amenities, modules and prices, rules, availability calendar, inquiry form, location, contact |
| Inquiry handoff | The form builds the exact message in `05-API-CONTRACTS.md` and opens `wa.me` with it. **Nothing is stored** |
| Owner panel (`/admin`) | Login with one shared password; month calendar; cross out / restore `mediodia`, `noche` or both; sign out |

## Non-goals

| Not in phase 1 | Where it goes |
|---|---|
| Online booking and payment (Mercado Pago) | Phase 2 |
| Automated WhatsApp confirmations and reminders (WABA) | Phase 2 |
| The other spaces: offices, consulting rooms, meeting room, workspaces | Phase 2 |
| Own domain (`*.vercel.app` link for now) | Phase 2 |
| Storing inquiries or customer data | Not planned |
| Customer accounts | Not planned |
| Editing prices or texts from the panel | Not planned; Mateo edits content (`D-009`) |

## Success criteria

| Criterion | Target | Status |
|---|---|---|
| `D-MEASURE` — the one number | **OPEN QUESTION `OQ-01`** in `10-MEMORY.md` | Undecided; set before launch (WU-09) |
| Performance, public page (`A1` gates, p75 field data) | CLS ≤ 0.1 **blocks**; LCP ≤ 2.5 s and INP ≤ 200 ms **warn** | Measured at launch |
| Accessibility | `ACC-1` manual pass + `ACC-2` on the inquiry form and the login | Before launch |
| Security | Every control in `08-SECURITY.md` §4 passes its check | Before launch |
| Calendar accuracy | The owner crosses out a module the same day it is confirmed (`CI-03`) | Client commitment |

## Classification

- **PRIMARY `A1 STATIC-MARKETING` + SECONDARY `A5 INTERNAL-TOOL`** (`D-002`).
- **Architecture:** the public side follows the `LANDING` profile; the owner panel is a minimal `INTERNAL-OPS` surface inside the same app.
- **Security tier:** `S1` for the public page, `S2` for the panel.

## Doc set

All of `00`–`12` are written. None is skipped: `A1` alone would skip `04`, `05` and `08`, but the owner panel needs a data model, action contracts and `S2` controls.

## Status

| Date | State |
|---|---|
| 2026-09-16 | Discovery, content, stack and security decided in conversation with Mateo; this package written |
| Next | WU-01, directly — no proposal, prices or timelines in this project (`D-012`) |

## Alternatives Considered

| Option | Verdict |
|---|---|
| Full booking with Mercado Pago and automated WhatsApp now | **Deferred to phase 2.** The client wants it fast, and WABA approval alone is 5–10 business days |
| Inquiry form without an availability calendar | **Rejected.** People asking for taken dates is exactly the problem |
| One landing for all four spaces | **Deferred.** The client asked for the salon only; the other spaces have different audiences and rental models |
