# Araucaria — Client Inputs

> What is missing to move forward, who has it, and what happens if it does not arrive.
> Updated: 2026-09-16 · Not frozen yet (freezes at structure approval, recorded in `10-MEMORY.md`)

Default owner: `{{CONFIRMAR}}` — the client's contact person (`OQ-02`). Every row without an explicit owner belongs to them. Mateo relays every request.

Tiers: `HARD-BLOCK` — no fallback exists · `SHIP-BLOCK` — the build continues against a fallback; only going live is blocked · `DEFERRABLE` — does not gate launch.
Status: `PENDIENTE` · `PARCIAL` · `RECIBIDO` · `WAIVED` · `CANCELADO`.

## 1. CI — Access, accounts and decisions

| ID | What | Format / spec | Appears in | Blocks | Urgency | Status | Tier | Owner | Asked | Due | Consequence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CI-01 | WhatsApp number that receives inquiries | One of 3425450336 / 3425465599, or another; must be on a phone someone answers | Every `wa.me` link | Launch | High | PROVISIONAL (2026-09-26: 3425450336, `D-048`) | SHIP-BLOCK | Client | — | Before WU-09 | If the client wants another number, change `NEXT_PUBLIC_WHATSAPP_NUMBER` in Vercel and redeploy |
| CI-02 | Name of the contact person and of who holds the admin password | Full name + phone | Password handover, this ledger | Launch | High | PENDIENTE | SHIP-BLOCK | Client | — | Before WU-09 | No handover of the panel |
| CI-03 | Commitment to keep the calendar accurate | Written OK: every confirmed booking is crossed out the same day | The public calendar | Launch | High | PENDIENTE | SHIP-BLOCK | Client | — | Before WU-09 | A stale calendar tells people taken dates are free (`G-003`) |
| CI-04 | Booking horizon and earliest date | E.g. "hasta 12 meses", "desde hoy" or "desde mañana" | Calendar range | — | Low | PENDIENTE | DEFERRABLE | Client | — | Before WU-08 | Default used: from today, 12 months ahead |
| CI-05 | Price details | VAT included or not; since when prices are valid; whether they change by season | `PRICING-TABLE` legal line | Launch | Medium | PENDIENTE | SHIP-BLOCK | Client | — | Before WU-09 | The legal line ships as "Precios sujetos a confirmación" |

## 2. CR — Content

| ID | What | Format / spec | Appears in | Blocks | Urgency | Status | Tier | Owner | Asked | Due | Consequence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CR-01 | Original photos of the salon, patio, pool, grill, pizza oven | Original files from the camera or phone (no WhatsApp/Instagram recompression), ≥ 2000 px on the long side, horizontal and vertical of each space, daylight | `HERO`, gallery, amenities | Final look | High | PENDIENTE | SHIP-BLOCK | Mateo has them | 2026-09-16 | Before WU-07 closes | The site ships with 1080 px stills cut from the walkthrough video plus two ~450 px crops of the Instagram carousel (WU-06) |
| CR-02 | Original videos (the 5 Mateo has) | Original files, ≥ 1080 px, 5–45 s, no music needed | `HERO`, gallery | Final look | Medium | PENDIENTE | SHIP-BLOCK | Mateo has them | 2026-09-16 | Before WU-07 closes | Gallery uses six 480×848 tiles cut from the WhatsApp videos; the hero is 10 s of the 1080 p walkthrough (WU-06) |
| CR-03 | Original logo | Vector (SVG/PDF/AI) or PNG ≥ 1000 px with transparent background; brand colors if they exist | `NAV`, `FOOTER`, color tokens | Final look | High | PENDIENTE | SHIP-BLOCK | Client | — | Before WU-07 starts | Colors cannot be fixed; logo reads blurry. A 404 px crop with a flat dark-blue background ships meanwhile (WU-06) |
| CR-04 | Correct the address on Instagram | Instagram shows 3650; the correct address is Güemes 3660 (`D-011`) | Instagram, not the site | — | Low | PENDIENTE | DEFERRABLE | Client | — | Before launch | Visitors see two different addresses |

## 3. Detail

### CI-03 — Keeping the calendar accurate
**What:** the owner crosses out a module in `/admin` the same day a booking is confirmed, and restores it if the booking falls through.
**Why it is needed:** the calendar only helps if it is true. A taken date shown as free creates the exact conversation it was meant to prevent.
**Blocks:** launch.
**Embedded decision (confirm):** if the client cannot commit, the calendar ships as "orientativo" or is removed, and the form asks for a date without filtering.

## 4. Chase log

| Date | Channel | To whom | Rows | Answer |
|---|---|---|---|---|
| 2026-09-16 | Conversation with Mateo | Mateo | CR-01, CR-02 | Mateo has the originals; start with temporary assets |
