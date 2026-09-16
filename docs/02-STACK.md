# 02 — Stack

> Every technology decision for phase 1, with its version, its reason, the trigger that would reverse it, and what is forbidden.

## Stack table

Versions were read from the npm registry on **2026-09-16**. WU-01 pins these exact versions in `package.json` (no `^`/`~`) and commits the lockfile. If a version cannot be installed as listed, WU-01 records the actual pinned version here and says why.

**Pinned in WU-01 (2026-09-16):** `.npmrc` sets `save-exact=true` and `engine-strict=true`. `npm ci`, `build`, `typecheck` and `lint` pass on Node 24.21.0.

| Layer | Choice | Version | Why | Inverts at |
|---|---|---|---|---|
| Runtime | Node.js LTS | 24.21.0 ("Krypton") locally (`.nvmrc`); `engines.node: "24.x"` on Vercel, which pins the major only and picks the patch | Current LTS | Vercel does not offer 24.x → previous LTS (22.x), recorded here |
| Framework | Next.js App Router | `next` 16.3.5 | Server Actions for the panel, server rendering for the public page, one deployable | — |
| UI | React | `react` / `react-dom` 19.3.0 | Required by Next 16 | — |
| Language | TypeScript, `strict` | `typescript` **6.0.3** (7.0.2 was planned) | Types at boundaries | **Verified in WU-01 (`D-013`):** with 7.0.2, `next build` and `tsc` type-check correctly, but `typescript-eslint` 8.70.0 (pulled in by `eslint-config-next` 16.3.5) refuses to load ("typescript-eslint does not support TS 7.0"; peer `>=4.8.4 <6.1.0`), so `npm run lint` fails. 6.0.3 is the newest release inside that range. Move to 7.x when `typescript-eslint` supports it |
| Lint | ESLint + Next's config | `eslint` 9.39.5 · `eslint-config-next` 16.3.5 | Next 16 has no `next lint`; lint is a blocking CI gate. Flat config in `eslint.config.mjs` | npm marks ESLint 9 as no longer supported, but 10.x is outside the peer range of `eslint-plugin-import` and `eslint-plugin-react` inside `eslint-config-next` → move to 10 when `eslint-config-next` supports it |
| Types | Type definitions | `@types/node` 24.13.5 · `@types/react` / `@types/react-dom` 19.3.0 | Match Node 24 and React 19 | Runtime major changes |
| Styling | Tailwind CSS v4 | `tailwindcss` / `@tailwindcss/postcss` 4.3.3 | Tokens via `@theme`; mobile-first | — |
| Motion | GSAP (+ ScrollTrigger) | `gsap` 3.15.0 | The motion library `seccion-premium` works with | — |
| Smooth scroll | Lenis | `lenis` 1.3.26 | Same method | Mateo rejects smooth scroll on this site |
| Validation | zod | `zod` 4.6.5 | Schema at every Server Action and on the client form | — |
| Database | Neon Postgres (Free) | `@neondatabase/serverless` 1.1.0 | Real Postgres with constraints; does not pause like Supabase | Free-tier limits are hit, or the client needs PITR beyond the free window → Neon paid |
| ORM / migrations | Drizzle | `drizzle-orm` 0.45.2 · `drizzle-kit` 0.31.10 | Typed SQL, reviewable migration files | — |
| Password hashing | Node `crypto.scrypt` (built-in) | — | No native dependency; OWASP parameters in `08-SECURITY.md` | — |
| Hosting | Vercel **Hobby** (free) | — | Zero-config Next.js; free `*.vercel.app` link for Instagram | Domain purchase in phase 2 → **Vercel Pro** (`D-005`) |
| Package manager | npm | lockfile `package-lock.json` | CI installs with `npm ci` | — |

## Alternatives Considered

### Hosting (`D-005`)

| Option | Tier | Verdict |
|---|---|---|
| **Vercel Hobby** | Free | **Chosen.** Its terms restrict use to non-commercial, personal projects, and this is a client site. The risk is accepted consciously by Mateo (`D-005`) |
| Vercel Pro | Paid, ~USD 20/month (verify when quoting) | Removes the terms risk. Adopted when the domain is bought |
| Cloudflare | Free, no commercial restriction | Next.js with Server Actions and auth needs an adapter whose current maturity was not verified. Not worth the risk for a fast phase 1 |

### Database (`D-006`)

| Option | Verdict |
|---|---|
| **Neon Free** | **Chosen.** Postgres constraints carry the availability invariant |
| Supabase Free | **Rejected (vetoed by Mateo).** Free projects pause after inactivity, and a panel used a few times a week is exactly that profile |
| No database (a JSON file Mateo edits) | **Rejected.** The owner could not cross out dates alone |

### Login (`D-007`)

| Option | Verdict |
|---|---|
| **One shared password, built on the controls in `08-SECURITY.md`** | **Chosen by Mateo.** Deviation from the doctrine default recorded in `D-007` |
| Auth.js with Google sign-in for allowlisted emails | Rejected: an extra flow for one account |
| Clerk Free | Rejected: an extra provider for one account |

### Motion

| Option | Verdict |
|---|---|
| **GSAP + Lenis** | **Chosen.** One motion library, the one the design method uses |
| Motion (Framer Motion) | Not added. Components found in references that use it are rebuilt with GSAP |

## Forbidden in this project

| Forbidden | Why |
|---|---|
| A `.env.example` file | Workspace-wide ban; names live in `07-INFRASTRUCTURE.md` |
| Supabase | Vetoed (pausing free projects) |
| Any auth library or provider replacing `D-007` without a new `D-NNN` | The controls in `08-SECURITY.md` assume this design |
| In-memory rate limiting | Useless on serverless: each invocation starts from zero |
| Auth tokens in `localStorage` or `sessionStorage` | One XSS = account takeover |
| Access decisions in `proxy.ts` (or `middleware.ts`) | The network layer does not authorize; redirects only |
| A second motion library | One library, one mental model |
| Embedded Google Maps iframe on first load | Weight on a 4G-first page; static image + "Cómo llegar" link instead |
| New dependencies without a line in `10-MEMORY.md` | Supply-chain review per dependency |
