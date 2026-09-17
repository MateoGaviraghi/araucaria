# 07 — Infrastructure

> Where phase 1 runs, its environment variables, how it deploys, how media is prepared, how data is backed up, and who owns which account.

## Environments

| Environment | Where | Database |
|---|---|---|
| Local | `npm run dev` | A Neon **branch** for development, never production |
| Preview | Vercel preview URL per branch | Same development branch |
| Production | Vercel `main` → `*.vercel.app` link used in the Instagram bio | Neon `production` branch (the project's default root branch, `D-016`) |

## Hosting

- **Vercel Hobby.** Its terms restrict use to non-commercial, personal projects. The risk is accepted consciously by Mateo for phase 1 (`D-005`). Move to **Pro** when the domain is bought.
- Limits that shape this project: runtime logs kept **1 hour** (so the audit trail lives in the DB); 3 custom WAF rules (rate limiting is done in the app, `08-SECURITY.md` §5).
- Single Vercel project, no custom `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` needed: the platform manages it for one project.
- **Project name:** `araucaria-multiespacio` → `araucaria-multiespacio.vercel.app` (`D-015`).
- **Node.js:** `engines.node: "24.x"` in `package.json`, which overrides the version chosen in the dashboard. Locally `.nvmrc` pins 24.21.0.
- **Region:** Vercel functions in `gru1` (São Paulo); the Neon project in `aws-sa-east-1` (São Paulo), next to the functions (`D-014`). A Neon project's region cannot be changed after it is created.

## Environment variables

**Names only. Values live in Vercel → Project → Environment Variables. No `.env.example`, ever.** Locally, values go in `.env.local`, which is git-ignored and is also read by `drizzle.config.ts`.

In Vercel each variable is set for **Production** (Neon `production`) and **Preview** (Neon `dev`); `DATABASE_URL` and `IP_HASH_SALT` are marked Sensitive, with a different `IP_HASH_SALT` per environment.

| Name | Scope | What |
|---|---|---|
| `DATABASE_URL` | Server | Neon connection string for the environment's branch |
| `IP_HASH_SALT` | Server | Random 32-byte secret for `HMAC-SHA256` of client IPs. Rotating it only resets rate-limit history |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public | Digits only, e.g. `5493425162081`. Not a secret: it ends up in every `wa.me` link |

## Deploy

- Push to a branch → preview URL. Merge to `main` → production.
- `R0`/`R1` changes may go direct to `main`. `R2` (auth, actions, headers, rate limits, env) goes through a branch and a preview check (`09-RULES.md` §6).
- CI gates that **block**: `npm ci`, `build`, `typecheck`, `lint`.
- After any deploy that changes Server Actions, open the panel once and cross out / restore a test module on a date far in the future.

## Security headers

Set in `next.config.ts` `headers()` for all routes:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Written in WU-09 against the real asset list (self, Vercel, `wa.me` navigation); verified in the browser console |

Additionally, on `/admin/*`: `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`.

## Media pipeline

Temporary sources: `C:\Users\mateo\Downloads\contenido-araucaria\`. Output goes to `public/media/` (phase 1). Phase 1 total budget for committed media: **≤ 25 MB**.

**`scripts/build-media.sh` is the pipeline.** It wipes and rebuilds `public/media/` from the sources; when the originals arrive (`CR-01`, `CR-02`), point `SRC` at them and run it again. Requires `ffmpeg` and `ffprobe` on `PATH` (built with 8.1).

| Output | Source | Values (measured in WU-06, `D-022`) |
|---|---|---|
| `hero.mp4` — 720×1280, 10 s, **1.93 MB** | `IMG_9789.MOV`, 7–17 s | `-an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -vf "scale=720:-2,fps=30" -movflags +faststart` |
| `hero-poster.jpg` 1080×1920 **155 KB**, `hero-poster.avif` **50 KB** | the clip's own first frame (7 s) | `-frames:v 1 -q:v 4`; AVIF with `libaom-av1 -crf 34 -still-picture 1` |
| `galeria/*.mp4` — 6 tiles 480×848, 2–8 s, **2.85 MB** together, plus a `.jpg` poster each | 5 of the 6 WhatsApp videos | Same as the hero with `scale=480:-2` and `-crf 28` |
| `fotos/*.jpg` — 5 stills 1080×1920 and 2 crops ~450 px, **1.19 MB** | the walkthrough; one Instagram carousel screenshot | `-frames:v 1 -q:v 4`; crops with `crop=w:h:x:y`, never upscaled |
| `logo-araucaria.png` — 404×404, **194 KB** | the Instagram logo card | `crop=404:404:230:238`. Temporary, flat background (`CR-03`) |

Measured 2026-09-17: **6.64 MB of the 25 MB budget**, 23 files.

Rules that hold whatever the source is: every published video is H.264 / `yuv420p` and silent, because HEVC does not play in every browser (`G-001`); every output carries `-map_metadata -1`, because the iPhone sources embed GPS coordinates; the hero poster is the clip's own first frame, so playback does not jump; nothing is upscaled. The previous reference command (1080 at CRF 26) was measured at **14.6 MB per 8 s** — 78 MB for the hero alone — and replaced (`D-022`). If a future source blows the budget, video moves to object storage (decided then, recorded in `10-MEMORY.md`).

## Backups and restore

- **Neon Free** (verified 2026-09-16 in neon.com/docs/introduction/plans): history window for instant restore **6 hours**, capped at 1 GB of history; **1** manual snapshot; no scheduled backups; 10 branches per project. A mistake noticed more than 6 hours later cannot be undone with instant restore: the tested `pg_dump` below is the real backup.
- **Before launch:** take one `pg_dump` of production and **restore it into a scratch Neon branch**, then compare row counts. An untested backup does not count.
- Restoring availability is low-stakes (the owner can re-cross modules). Restoring the credential is not: after any restore, rotate the password (`08-SECURITY.md` §6).

## Accounts and ownership

| Account | Owner in phase 1 | Holds |
|---|---|---|
| GitHub `MateoGaviraghi/araucaria` | Nodo (Mateo) | Code, docs |
| Vercel (Hobby) | Nodo (Mateo) | Hosting, env vars |
| Neon | Nodo (Mateo) | Database |
| Instagram, WhatsApp numbers, email | Client | Content and contact |

Phase 1 runs on Nodo's accounts. Moving hosting and database to client-owned accounts is part of phase 2, with the domain (`OQ-03`). Every access above is revocable in one step by its owner.

## Observability

- Vercel runtime logs (1 hour) for debugging.
- `admin_audit` in Neon for every privileged action (12 months).
- No error tracker in phase 1 (`OQ-04`).

## Cost

| Item | Monthly |
|---|---|
| Vercel Hobby | $0 |
| Neon Free | $0 |
| WhatsApp (`wa.me` links) | $0 |
| **Total** | **$0** |
