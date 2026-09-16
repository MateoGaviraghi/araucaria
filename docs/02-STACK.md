# 02 — Stack

> Every technology decision for phase 1, with its version, its reason, the trigger that would reverse it, and what is forbidden.

## Stack table

Versions were read from the npm registry on **2026-09-16**. WU-01 pins these exact versions in `package.json` (no `^`/`~`) and commits the lockfile. If a version cannot be installed as listed, WU-01 records the actual pinned version here and says why.

| Layer | Choice | Version | Why | Inverts at |
|---|---|---|---|---|
| Runtime | Node.js LTS | 24.21.0 ("Krypton") | Current LTS | Vercel does not offer 24.x → previous LTS, recorded here |
| Framework | Next.js App Router | `next` 16.3.5 | Server Actions for the panel, server rendering for the public page, one deployable | — |
| UI | React | `react` / `react-dom` 19.3.0 | Required by Next 16 | — |
| Language | TypeScript, `strict` | `typescript` 7.0.2 | Types at boundaries | **Verify in WU-01** that Next 16.3's type-check supports TypeScript 7.x (the native compiler). If not, pin the newest version Next supports and record it here |
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
