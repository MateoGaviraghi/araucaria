# 09 — Rules

> Conventions, repository layout, review classes and the things an executor must never do in this project.

## 1. Repository layout (created in WU-01)

```
araucaria/
  CLAUDE.md · KICKOFF.md
  docs/                      00…12
  app/
    page.tsx                 landing (sections as components)
    admin/
      login/page.tsx
      login/login-form.tsx   client form of the login (D-017)
      page.tsx               panel
      actions.ts             blockModules · unblockModule · logout
    login-action.ts          login (anonymous)
    error.tsx                treats "Failed to find Server Action" as retryable
  components/
    sections/                one file per landing section
    calendar/                shared calendar logic + public and admin views
    ui/                      buttons, fields, feedback
  content/
    salon.ts                 amenities, modules, prices, rules, contact — from 01-CONTEXT.md
  lib/
    dal.ts                   requireAdmin() + every DB call (the only importer of db)
    action-result.ts         ActionResult and ErrorCode (05-API-CONTRACTS.md §1, D-017)
    db/                      Drizzle client + schema
    auth/                    scrypt, tokens, ip hashing, limits
    whatsapp.ts              message + URL builder (05-API-CONTRACTS.md §3)
    dates.ts                 Buenos Aires "today", es-AR formatting
    gsap.ts                  registers GSAP plugins and useGSAP once (D-020)
  drizzle/                   generated migrations (reviewed before applying)
  scripts/
    rotate-password.ts       operator-only (08-SECURITY.md §6)
  public/media/              transcoded media (07-INFRASTRUCTURE.md)
  proxy.ts                   redirect-only
```

A change to this layout is a `D-NNN` in `10-MEMORY.md`.

## 2. Code conventions

- **TypeScript `strict`.** No `any` at boundaries; no non-null assertions on data from the DB or the client.
- **Server Action order:** authenticate → validate (zod) → act → narrow result (`05-API-CONTRACTS.md` §1). Expected failures are returned codes, not thrown errors.
- **The DAL is the only module that imports the DB client.** Components and actions call the DAL.
- **Identity never comes from the request body.** Admin identity is the session; actions receive ids and changes, never objects.
- **Content comes from `content/salon.ts`.** No price, hour or amenity literal anywhere else.
- **Dates:** `lib/dates.ts` only. Never `new Date()` for "today" in a component.
- **Naming:** files `kebab-case`, React components `PascalCase`, DB columns `snake_case`, module codes `mediodia` / `noche` (no accents in codes; accents in labels).
- **Comments:** only where the why is not obvious. No commented-out code.

## 3. Motion and design

- Every public section goes through `/diseno` → `seccion-premium`. Its references, criteria and rejections are the source for motion values; do not invent timings.
- Animate `transform` and `opacity` only. Every animation has a `prefers-reduced-motion` path.
- GSAP + Lenis only (`02-STACK.md`).

## 4. Hard negations

| Never | Because |
|---|---|
| Create a `.env.example` | Banned in every repo |
| Hardcode the WhatsApp number | `NEXT_PUBLIC_WHATSAPP_NUMBER` (`CI-01` changes it) |
| Invent or round a price, hour, capacity or amenity | `01-CONTEXT.md` is the only source; gaps are `{{CONFIRMAR}}` |
| Store a plaintext password, a raw session token or a raw IP | `08-SECURITY.md` |
| Put an access decision in `proxy.ts` | The network layer does not authorize |
| Skip `requireAdmin()` in an admin action "because the page is protected" | Server Actions are public endpoints |
| Write a route handler that mutates | Mutations go through Server Actions (CSRF control C-07) |
| Store availability as time ranges, or store "día completo" as its own row | `D-003` |
| Rate-limit in memory | Serverless; counters live in Neon |
| Log request bodies of the login action | The password would be in the logs |
| Apply a generated migration without reading its SQL | Generating is not applying |
| Add a dependency without a line in `10-MEMORY.md` | Supply-chain review |
| Use AI-generated people or stock photos of other venues | Only the real space |
| Commit media originals over the budget | `07-INFRASTRUCTURE.md` media budget |

## 5. Not committed

`.env*` (except nothing — there is no example file) · `.next/` · `node_modules/` · original media files · database dumps · any file containing the passphrase.

## 6. Review classes and branches

| Class | Triggers in this project | Branch |
|---|---|---|
| `R0` cosmetic | Copy, styling, media swaps, token values | Direct to `main` allowed |
| `R1` standard | Landing sections, calendar display, form logic | Direct to `main` allowed after local build passes |
| `R2` sensitive | Login, sessions, `requireAdmin()`, Server Actions, rate limits, headers/CSP, env vars | Branch + preview check + Mateo's OK |
| `R3` irreversible | Migrations on production, password rotation in production, deleting data | Branch, own PR, applied alone, backup first |

CI gates that block: `npm ci`, `build`, `typecheck`, `lint`.

## 7. Quality gates before launch

- **Performance (public page, p75 field):** CLS ≤ 0.1 blocks; LCP ≤ 2.5 s and INP ≤ 200 ms warn. A Lighthouse score is a diagnostic, not a budget.
- **Accessibility:** `ACC-1` on the page (one `h1`, alt text, contrast over real media, full keyboard path, visible focus, 44 px targets, `lang="es-AR"`, 200 % zoom, meaningful link text) + `ACC-2` on the inquiry form and the login.
- **Security:** `08-SECURITY.md` §8.

## 8. Commits

- `type: descripción en español` (e.g. `feat(calendario): …`, `fix(panel): …`, `docs: …`).
- One work unit, one coherent commit series; commit and push only with Mateo's OK.
