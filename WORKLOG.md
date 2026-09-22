# WORKLOG — Araucaria · Event salon (phase 1)

> §1 is the current state and is rewritten in full every time. §2 is append-only: an entry per chat, dated, and nothing in it is ever deleted or shortened. Decisions, gotchas, technical debt and open questions do **not** live here — they live in `docs/10-MEMORY.md`, which is the memory of the project (`D-NNN`, `G-NNN`, `TD-NNN`, `OQ-NN`).

## 1. STATE

**Updated:** 2026-09-22, `HERO` en producción y la galería esperando GO-AHEAD.

| | |
|---|---|
| **Current task** | Phase 1 of the Araucaria site. WU-01 … WU-06 and the `HERO` of WU-07 are merged to `main` and live. **The gallery round is open**: references presented, Mateo chose a mix, the three-variant plan is on the table and **he has not given the GO-AHEAD** ("aun no go"), so **no file of the gallery exists yet** |
| **Real status** | `araucaria-multiespacio.vercel.app` serves the real `HERO`: it opens as a rectangle growing from the middle, two wide takes rotate behind the headline, and the site's button is in place. `/admin` works as before. **Production still has no admin credential**, on purpose until WU-09. `main` is at `620d18b`; the working tree is clean except `.claude/`, untracked |
| **Last chat** | 2026-09-21 → 2026-09-22 (this one) |
| **Waiting on me (Claude)** | Nothing. The next move is Mateo's GO-AHEAD on the gallery's three variants |
| **Waiting on Mateo** | (a) GO-AHEAD for the gallery prototype, or a change to the plan — what moves most easily now is which pieces go in and in what order, the name of each space, or replacing variant C. (b) Name the section after the gallery. (c) Answer `OQ-06`, `OQ-07` and `OQ-08`. (d) He holds the dev passphrase; it exists only in his password manager |
| **Waiting on third parties** | The client owes `CI-01` (WhatsApp number), `CI-02`, `CI-03`, `CI-05` and `CR-01`…`CR-03` (original photos, videos and logo). The hero's colours and logo stay `{{CONFIRMAR}}` until the logo arrives, and the two good photos of the gallery are 450 px crops until `CR-01` lands |
| **Next action** | Wait for the GO-AHEAD, then build the three gallery variants behind the picker at `/prototipo-galeria`, measure them and show them. **Do not present a plan for another section before Mateo names it** |
| **Do not touch** | `main` without Mateo's word · the production Neon branch (five tables, no credential; a migration there is class `R3`) · the two real blocks in the `dev` branch (2026-09-19 Mediodía, 2026-09-20 Noche) · `.env.local` and the Vercel environment variables · the Neon branch `backup-pre-0000-init` · **the designs already rejected** in `D-023` (three openings for the hero) and in `D-025` (the gallery references he did not pick) |

## 2. LOG

### 2026-09-16 → 2026-09-17 · WU-01 to WU-05 and the owner-panel design round

**Asked (Mateo's own words, in order):**

1. "Arrancá por la unidad de trabajo WU-01 (scaffold). En esta primera respuesta no toques ningún archivo: presentá el plan." Then, to the plan's three questions: **"si a las pregutns y go"**.
2. On Node: chose "Node portátil (Recommended)" so the verification could run on Node 24 without touching his system; later he installed Node 24.21.0 himself.
3. "ok, dale con commit y push" (WU-01) · "si a las dos y hacé commit y push" (the two WU-01 follow-up questions: `agentRules: false` and `lint` failing on warnings).
4. "vamos de paos me estas doando miles de cosas vamos a ir trabjando que se hiozo siguente paso y si necesitas algo mio me lo pedis sino yo te dpoy el ok de ese paso" — from here on, one step per message.
5. "ok, armá el plan de WU-02" → **"go"** → "ok, dale con commit y push" → "ok, dale con el merge a main".
6. "ok, armá el plan de WU-03" → **"si a todo y ggo"** → after the manual login test: "listo", "volvió al login" → "ok, dale con commit y push".
7. "ok, armá el plan de la migración a producción" → **"go"** → then "listo" for each of his steps.
8. "ok, armá el plan de WU-04" → **"si a todo y go"** → "ok, dale con commit y push" → "listo" (phone test) → "merge".
9. On the functional panel: "listo nose si me gusta este funcionamiento no me reuslta una exprecia de usario facil y amigaBLE" → "ok, traé las referencias. **4 todo**" (everything bothered him: legibility, number of steps, looks) → "cual es tu recomenadcion ?" → "si a las dos, armá las 3 variantes" → **"GO-AHEAD"** → "1, mitades / esta bien asi me gusta" → "go" (promotion plan) → "merge".
10. "me gustaria que haga un card en el medio animado con gsap que de como una alerta animada, quiero que sea una exp de suario muyamigable profesional y seria" → "es que es ese el aviso y la alerta, se reemplza el diseño de eso; ejemplo tocas un dia tachas meido dia y salta la alerta sabad Reservado Mediodia 19/09 ejemplo con la animcion del tilde con gsap profesioal" → "la de apple la 1" → **"go"** → "genil esta perfecto" → "merge".
11. "ok, armá el plan de WU-05" → **"go"** → "merge".
12. "Pará acá y volcá el estado al repo…" (this entry).

**Done:**

- **WU-01 · Scaffold.** Next.js 16.3.5 app created by hand (no `create-next-app`, to avoid its sample files and caret ranges), every dependency pinned exactly, lockfile committed, scripts `dev`, `build`, `lint`, `typecheck`, `db:generate`, `db:migrate`, `rotate-password`. Node pinned to 24.21.0 locally and `24.x` on Vercel. Vercel project `araucaria-multiespacio` created by Mateo, functions region São Paulo (`gru1`); Neon project `araucaria` in `aws-sa-east-1` with branches `production` and `dev`; the three environment variables set for Production and Preview.
- **WU-02 · Data layer.** The five tables of `docs/04-DATA-MODEL.md` written as a Drizzle schema, migration `0000_init` generated, reviewed line by line against the doc and applied to the `dev` branch.
- **Production migration (class R3).** Backup branch `backup-pre-0000-init` created in Neon, then `0000_init` applied to `production` with a temporary local env file that was deleted afterwards. Production has the five tables and zero rows.
- **WU-03 · Auth.** scrypt password hashing (N=2^17, `maxmem` 256 MiB), session tokens stored only as sha256, `__Host-` cookie, per-IP and global rate limits counted in Neon, honeypot and time trap, audit trail, purges inside a successful login, `requireAdmin()` in the DAL, `proxy.ts` redirect-only, operator script `scripts/rotate-password.ts`, and minimal functional `/admin/login` and `/admin` screens.
- **WU-04 · Owner panel.** `blockModules` / `unblockModule` with zod validation and the Buenos Aires date range, atomic "día completo", audit rows, `updateTag("availability")`, month grid logic, and the panel UI.
- **Design round (`seccion-premium`) for the panel.** Mateo rejected the first functional panel. Five references were opened and tried, three variants were built behind the standard picker at `/admin/prototipo`, he chose "Mitades", it was promoted into the real panel, and the prototype was deleted. Then a second round for the confirmation alert: five references, he chose the Apple alert, and the centered card with the GSAP-drawn check replaced the bottom undo bar.
- **WU-05 · Public availability.** Cache Components enabled, `getAvailability(today)` cached under the tag `availability`, the public day states and module enablement in the shared calendar module, and the admin pages restructured so their shell is prerendered and the data streams.

**Files (every file created or modified, with what changed):**

| File | What |
|---|---|
| `package.json` | Created. `private`, `engines.node: "24.x"`, scripts `dev`/`build`/`lint` (`eslint . --max-warnings 0`)/`typecheck` (`next typegen && tsc --noEmit`)/`db:generate`/`db:migrate`/`rotate-password`. Exact versions, no ranges. Dependencies added along the way: `server-only` 0.0.1 (WU-03), `@gsap/react` 2.1.2 (alert round) |
| `package-lock.json` | Created and updated with each dependency |
| `.npmrc` | Created. `save-exact=true`, `engine-strict=true` |
| `.nvmrc` | Created. `24.21.0` |
| `.gitignore` | Created. `node_modules`, `.next`, `.env*`, `.vercel`, `next-env.d.ts`, `*.tsbuildinfo`, media originals, dumps |
| `tsconfig.json` | Created (`strict`, Next plugin, `@/*`). Later `allowImportingTsExtensions: true` so `scripts/rotate-password.ts` can import `../lib/auth/*.ts` under Node's type stripping |
| `next.config.ts` | Created empty → `agentRules: false` (G-011) → `/admin/*` headers `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store` → `cacheComponents: true` (D-021) |
| `postcss.config.mjs`, `eslint.config.mjs` | Created. Tailwind v4 plugin; flat ESLint config with `eslint-config-next` (core-web-vitals + typescript) |
| `drizzle.config.ts` | Created. postgresql, schema `./lib/db/schema.ts`, out `./drizzle`, reads `.env.local` with `process.loadEnvFile` and throws if `DATABASE_URL` is missing |
| `app/layout.tsx`, `app/globals.css`, `app/page.tsx` | Created. `lang="es-AR"`, Tailwind import, placeholder page with a single `h1` |
| `app/error.tsx` | Created. Treats "Failed to find Server Action" as retryable (G-009); uses the Next 16 `retry` prop |
| `app/login-action.ts` | Created. `login` in the exact order of `docs/08-SECURITY.md` §5; never logs the form data |
| `app/admin/actions.ts` | Created with `logout`; then `blockModules` (returns the new ids for undo) and `unblockModule`, both `requireAdmin()` first, zod, `updateTag` |
| `app/admin/page.tsx` | Created minimal → full panel (month + upcoming list) → split so the session and month data are read inside `<Suspense>` (D-021) |
| `app/admin/login/page.tsx` | Created → content moved inside `<Suspense>` → passes `renderedAt={nowMs()}` to the form (the D-021 bug fix) |
| `app/admin/login/login-form.tsx` | Created (client). Password field, honeypot, time trap. The hidden `renderedAt` went from "set by an effect" to a **controlled prop**, because React resets the form after a failed submit |
| `app/admin/admin.css` | Created. Provisional teal/beige tokens, day cell split in halves, module toggles, bottom sheet, and the alert card |
| `proxy.ts` | Created. Redirects `/admin/*` (except `/admin/login`) to the login when the cookie is absent. No database, no access decision |
| `lib/action-result.ts` | Created. `ActionResult<T>` and `ErrorCode` of `docs/05-API-CONTRACTS.md` §1 |
| `lib/auth/config.ts` | Created. Cookie name and options, limits, time trap, minimum passphrase length |
| `lib/auth/password.ts` | Created. scrypt hash/verify, constant work when there is no credential |
| `lib/auth/tokens.ts` | Created. 32-byte token, sha256 hash, well-formed check |
| `lib/auth/ip.ts` | Created. First `x-forwarded-for` address → HMAC with `IP_HASH_SALT` |
| `lib/dal.ts` | Created. `requireAdmin()`, login queries, sessions, audit, purges; then `getBlocksForMonth`, `insertBlocks` (returns ids), `deleteBlock`, `getUpcomingBlocks`; then the cached public `getAvailability(today)` returning `null` on failure |
| `lib/db/schema.ts`, `lib/db/client.ts` | Created. The five tables; neon-http client, imported only by the DAL |
| `lib/dates.ts` | Created. Buenos Aires "today", date validation and arithmetic, es-AR formats. Later: `formatDayMonth` built from the ISO string (G-018) and `nowMs()` for the login time trap (G-019) |
| `lib/gsap.ts` | Created. Registers `useGSAP` and `DrawSVGPlugin` once |
| `components/calendar/month.ts` | Created. Module vocabulary ("Reservado" since D-020), month grid, available choices; then the public states (`publicDayState`, `isSelectableDay`, `enabledChoices`) and `AvailabilityEntry` |
| `components/calendar/admin-calendar.tsx` | Created functional → rewritten as the "Mitades" panel (sheet on the phone, side panel on desktop, upcoming list) → the bottom undo bar replaced by the centered alert |
| `components/ui/bottom-sheet.tsx` | Created. Native `<dialog>` sheet |
| `components/ui/confirm-alert.tsx` | Created. The Apple-style alert with the GSAP timeline, 4 s auto-close with pause, Escape, and Deshacer |
| `components/ui/confirm-dialog.tsx`, `components/ui/toast.tsx`, `components/ui/undo-bar.tsx` | Created and later **deleted**: replaced by the sheet, the alert and the undo inside it |
| `app/admin/prototipo/*` (8 files: `page.tsx`, `panel.tsx`, `picker.tsx`, `picker.css`, `prototipo.css`, `dia-mitades.tsx`, `dia-diagonal.tsx`, `dia-barras.tsx`) | Created for the design round and **deleted** when "Mitades" was promoted |
| `drizzle/0000_init.sql`, `drizzle/meta/_journal.json`, `drizzle/meta/0000_snapshot.json` | Generated, reviewed against `docs/04-DATA-MODEL.md`, applied to `dev` (2026-09-16) and to `production` (2026-09-17) |
| `scripts/rotate-password.ts` | Created. Shows the target host, asks for confirmation, reads the passphrase twice without echo, requires ≥ 20 characters, upserts the credential and audits it in one statement. Never prints the passphrase |
| `docs/02-STACK.md` | TypeScript row changed to 6.0.3 with the reason; rows added for lint, types and `@gsap/react` |
| `docs/03-ARCHITECTURE.md` | Rendering and caching row rewritten for Cache Components and `updateTag` |
| `docs/05-API-CONTRACTS.md` | `blockModules` now returns `{ ids }`; `getAvailability(today)` documented with its cache and its `null` |
| `docs/06-UI-UX.md` | §5 rewritten: "Mitades", the sheet, the confirmation alert, the "Reservado" vocabulary and the new copy |
| `docs/07-INFRASTRUCTURE.md` | Vercel project name, Node `24.x`, region, the Neon `production` branch name, environment scopes and the Neon Free restore window |
| `docs/08-SECURITY.md` | §6 now documents how to run the rotation script |
| `docs/09-RULES.md` | Repository layout updated: `lib/action-result.ts`, `lib/gsap.ts`, `app/admin/login/login-form.tsx` |
| `docs/10-MEMORY.md` | `D-013` … `D-021`, `G-011` … `G-020`, the dependencies table filled in, `TD-001` … `TD-004` and `OQ-06`/`OQ-07` |
| `WORKLOG.md` | This file, created in this last step |

**Verified (with real results):**

- **WU-01 gates:** `npm ci`, `npm run build`, `npm run typecheck`, `npm run lint` all pass on Node 24.21.0. `npm ls --depth=0` shows the 17 pinned versions; `package.json` has no `^` or `~`. `git check-ignore` confirms `.env.local`, `.next` and `next-env.d.ts` are ignored and there is no `.env.example`. `npm run dev` + `curl`: HTTP 200 with `<html lang="es-AR">`.
- **OQ-05 (closed):** with TypeScript 7.0.2, `next build` and `tsc` type-check correctly (a deliberate type error is caught in both), but `npm run lint` crashes with "typescript-eslint does not support TS 7.0". Pinned 6.0.3. Node `24.x` confirmed on Vercel (`vercel project inspect` → "Node.js Version 24.x") and in the deploy log.
- **WU-02 in `dev`:** 5 tables, 31 constraints, 10 indexes, 1 registered migration, and 10 behaviour checks — the same module cannot be crossed twice (23505), an invented module is rejected (23514), "día completo" is two rows in one atomic INSERT, a partially conflicting multi-row INSERT leaves nothing behind, the date comes back unshifted, a second credential row is rejected, forcing an id in `login_attempts` is rejected (428C9), an invented audit action is rejected. Test rows deleted; all tables back to 0.
- **Production migration:** production had 0 tables before; afterwards 5 tables, 31 constraints and 10 indexes **identical to `dev`**, 1 migration, 0 rows. Only the recorded hash differs, and only because of Windows line endings (G-015).
- **WU-03:** 33 end-to-end checks against a production build and the `dev` branch, all passing — proxy redirect, `/admin/*` headers, time trap and honeypot rejected without recording an attempt, 5 wrong passwords lock that IP and the 6th **correct** one is still refused, 20 failures close the login globally, the `__Host-` cookie carries HttpOnly/Secure/SameSite=Strict/Path=/ /Max-Age 2592000 and no Domain, the session is stored only as sha256 with a 30-day expiry, `login_ok` carries the session id, the purges delete the 25-hour attempt, the expired and revoked sessions and the 13-month-old audit row, `requireAdmin()` rejects a revoked, expired, wrong-version or malformed session, logout revokes and audits and clears the cookie correctly, and rotating the password logs an open session out. Additionally: a POST with a foreign `Origin` is aborted by Next (G-014), and a post-build grep found zero occurrences of the secrets in `.next` and zero database code in the browser bundle.
- **WU-04:** 44 checks, all passing — including `blockModules` without a cookie (the proxy cuts it), with an invented cookie (`UNAUTHORIZED`), an attempt to bypass the proxy with `x-middleware-subrequest` (still redirected), the action posted to a route that does not import it (Next runs nothing, G-017), `ALREADY_TAKEN` on a repeat and on "día completo" with one module taken (with no half-written rows), today and the last day of the horizon accepted, yesterday / horizon + 1 / `2026-02-30` / an invented choice / no input all `INVALID_INPUT`, the audit rows, the ids returned for undo and the undo itself, `NOT_FOUND` and `INVALID_INPUT` on unblock, and the month clamping in the URL.
- **Panel on screen (Chromium, headless):** 375, 390×664, 360×640, 1440 and 1920. Smallest day cell 44×59 px at 360 px wide, module toggles 158×74 px, no horizontal scroll, no console errors, reduced-motion path works. Reserve → undo → close sheet and free-from-the-list → undo both verified. Alert: "Reservado · Lunes 21/09 · Noche · Deshacer · Listo", auto-close at 4 s, paused while hovered (still open after 5 s), Escape closes, "Deshecho" after undo, red cross on the error case, and the card fits on every size.
- **WU-05:** 13 of 14 checks passed; the failing one was a wrong expectation in the test script (it assumed a single pre-existing block in `dev`, there are two) and was corrected afterwards. Verified: the public day states including "sin datos", the payload carrying only `date` and `module`, a change made directly in the database **not** appearing (the cache works), the change appearing immediately after reserving from the panel (the tag is invalidated), and a server started against an unreachable database answering 200 with `availability: null`. Login regression in a real browser: 8/8.
- **In production, after each merge:** `/` 200, `/admin` 307 to the login, `/admin/login` 200, and the `/admin/*` headers present.
- **Mateo verified by hand:** creating the dev credential with the script, logging in and out on the preview from his browser and his phone, reserving and freeing modules in the prototype and in the panel, and the alert.

**Not verified (explicitly):**

- The production panel end to end: **production has no credential**, on purpose until WU-09.
- That Vercel hands the app a different IP per visitor: only one hash was ever seen from Vercel. It needs two networks and is part of the WU-09 checklist.
- `npm run db:generate` / `db:migrate` for a **second** migration (only `0000_init` exists).
- Performance and accessibility gates of `docs/09-RULES.md` §7 (CLS/LCP/INP, `ACC-1`, `ACC-2`) — they belong to WU-09.
- The backup restore test of `docs/07-INFRASTRUCTURE.md` — WU-09.
- Any real device: everything Claude measured was Chromium headless emulating iPhone; Mateo used his own phone for the panel and the alert.

**Resolved along the way (root cause, not symptom):**

1. **TypeScript 7.0.2 broke `npm run lint`.** Root cause: `typescript-eslint` 8.70.0, pulled in by `eslint-config-next`, declares `typescript >=4.8.4 <6.1.0` and refuses to load with TS 7. Pinned TypeScript 6.0.3 (`D-013`).
2. **`next dev` kept modifying `CLAUDE.md`.** Root cause: Next 16's `agentRules` option defaults to `true` and writes a managed block. Set to `false` (`G-011`).
3. **Logout would not clear the session cookie.** Root cause: `cookies().delete()` sends no `Secure` attribute, and browsers ignore any `Set-Cookie` for a `__Host-` cookie without it (`G-013`).
4. **The Preview deploy failed with "not a valid URL".** Root cause: the Preview `DATABASE_URL` held the whole `psql '…'` command instead of the connection string. Also, the production URL had been pasted as a **second** `DATABASE_URL` line inside `.env.local`, which would have pointed local development at production; it was moved to its own file and later deleted.
5. **A thin diagonal line on fully reserved days in the "Diagonal" variant.** Root cause: two clip-path triangles meeting on an antialiased edge. Fixed with a full-size layer underneath.
6. **Dates printed "21/9" instead of "21/09".** Root cause: `Intl` for es-AR ignores `2-digit` for the month in a day/month pattern. Built from the ISO string instead (`G-018`).
7. **Two lint errors from the React Compiler rules.** Root cause: `contextSafe(fn)` called during render with a ref-reading `fn`, and `Date.now()` in a function defined in the component body (`G-019`).
8. **Every login attempt after the first failed without checking the password.** Root cause: React resets the form after a submit, wiping the hidden `renderedAt` value that an effect had written to the DOM, so the time trap saw an empty field and returned `INVALID_INPUT` — and those attempts never counted toward the rate limit either. The owner would have had to reload the page after one typo. The server now passes `renderedAt` as a prop and the input is controlled (`D-021`). Found only because the login regression was moved into a real browser; the HTTP-level tests re-sent the field every time and never saw it.
9. **Playwright could not launch full Chromium** (`spawn UNKNOWN`, then "Permission denied" on `chrome.exe`). Worked around with the headless shell binary, which is what every screenshot used.
10. **CodePen, CodeShack and LottieFiles blocked headless capture** with an anti-bot check, which was not bypassed; those references were opened in the app's own browser and linked instead.

**Gates (last run, on `main` at `b33202a`):**

```
npm run typecheck   → ✓ Types generated successfully (exit 0)
npm run lint        → exit 0, no errors, no warnings
npm run build       → ✓ Compiled successfully; routes: ○ /  ○ /_not-found  ◐ /admin  ◐ /admin/login  (ƒ Proxy)
```

Test suites: there is **no test runner in the repo**. Everything was verified with one-off Node/Playwright scripts kept in the session scratchpad (`TD-003`). Their results are the numbers quoted above.

**Follows:** Mateo names the next unit — WU-06 (media pipeline) or the first public section for its `seccion-premium` round — and it starts with a plan table and his written GO-AHEAD.

### 2026-09-17 → 2026-09-21 · WU-06 media pipeline

**Asked (Mateo's own words, in order):**

1. "ok, armá el plan de WU-06" → to the plan and its three recommendations: **"go"**.
2. "ok, dale con commit y push".
3. "dale el merge".
4. "ponme en contexto que hiciste que vineie ? sigmnos la modialidad de trabajo con la que veniamos trabajandod" (four days later, resuming).
5. "si, actualizá el worklog y arrancamos con el hero" — this entry, and `HERO` named as the first section of WU-07.

**Done:**

- **WU-06 · Media pipeline.** `scripts/build-media.sh` wipes and rebuilds `public/media/` from the source folder; when the originals arrive (`CR-01`, `CR-02`) the same script runs with `SRC` pointed at them. Output: the hero video and its two posters, six gallery tiles with a poster each, seven photos and a provisional logo. **6.64 MB of the 25 MB budget, 23 files.**
- Before planning, the sources were actually inspected rather than trusted: contact sheets of the nine screenshots, four frames of each of the seven videos, and a frame-by-frame map of the hero clip. Four encoding recipes were measured on the same 8-second sample before one was chosen.

**Files (every file created or modified, with what changed):**

| File | What |
|---|---|
| `scripts/build-media.sh` | Created. The whole pipeline: `clip()` and `frame()` helpers, the hero, six tiles, five stills, two crops and the logo, ending with a listing and the byte total. `SRC` is overridable |
| `.gitattributes` | Created. `*.sh text eol=lf`: with `core.autocrlf=true` a fresh checkout would hand bash a CRLF shebang |
| `public/media/hero.mp4` | Created. 720×1280, 10 s (7–17 s of the walkthrough), CRF 30, silent, `+faststart`. 1,926,005 B |
| `public/media/hero-poster.jpg` · `.avif` | Created. The clip's own first frame, 1080×1920. 154,607 B and 49,580 B |
| `public/media/galeria/*.mp4` (6) | Created. `jardin`, `quincho`, `patio`, `pergola`, `pileta`, `fachada` — 480×848, 2.2 to 8 s, CRF 28. 2.85 MB together |
| `public/media/galeria/*.jpg` (6) | Created. One poster per tile, 480 px wide |
| `public/media/fotos/*.jpg` (7) | Created. Five stills at 1080×1920 (`jardin`, `quincho`, `pileta`, `salon-interior`, `salon-ventanal`) and two crops of the Instagram carousel (`pileta-cascada` 452×418, `salon-vacio` 407×418) |
| `public/media/logo-araucaria.png` | Created. 404×404 crop of the logo card. Flat dark-blue background, no transparency (`CR-03`) |
| `docs/07-INFRASTRUCTURE.md` | §Media pipeline rewritten: the script is the pipeline, and the table now holds the real commands and the measured weights instead of a reference command |
| `docs/10-MEMORY.md` | `D-022` (the encoding values and what was rejected), `G-021` (90° rotation metadata), `G-022` (the usable range of the hero clip, the CapCut watermark, the filmer's shadow), `G-023` (GPS metadata in iPhone `.MOV`) |
| `docs/12-CLIENT-INPUTS.md` | `CR-01`, `CR-02`, `CR-03`: the "consequence" column now says what actually ships meanwhile |
| `.claude/launch.json` | Created so the dev server could be started and the videos watched in a browser. **Left untracked**: Mateo has not said whether `.claude/` belongs in the repo |
| `WORKLOG.md` | §1 rewritten; this entry appended |

**Verified (with real results):**

- **Budget:** 6,636,662 B in 23 files, against a 25 MB ceiling.
- **Codecs:** `ffprobe` on the outputs — H.264, profile High, `yuv420p`, and **no GPS or timestamp tags** (the iPhone sources carry them; every command uses `-map_metadata -1`).
- **In a browser, served by the app** (`localhost:3000`, dev server): the hero plays (720×1280, 10.00 s, `currentTime` advancing, `video.error` null) and so do the **six tiles** (480×848, durations 8, 8, 8, 2.5, 3.9, 2.2 s). All **16 images** load, including `hero-poster.avif` at 1080×1920.
- **Every frame that ships was looked at**, as contact sheets, before it was kept.
- **In production, after the merge:** `hero.mp4` → 200 `video/mp4` 1,926,005 B · `hero-poster.avif` → 200 `image/avif` 49,580 B · `galeria/quincho.mp4` → 200 `video/mp4` 574,971 B · `fotos/pileta-cascada.jpg` → 200 `image/jpeg` 44,626 B.
- **Line endings:** `scripts/build-media.sh` is LF both on disk and in the committed blob (checked byte by byte with `od -c`), and `git check-attr` reports `text: set, eol: lf`.

**Not verified (explicitly):**

- The media on a real device or a real network: everything was watched in the app's own browser on localhost.
- `hero-poster.avif` as an actual `poster` attribute in Safari — the file decodes, but no markup consumes it yet (WU-07 decides whether the poster is an `<img>` through `next/image` or the attribute).
- Any perceptual quality judgement beyond Claude's own eye: Mateo has seen the contact sheet, not the videos playing.
- Whether 720 px wide is enough for the hero on a 1920 screen — decidable only once the `HERO` section exists.

**Resolved along the way (root cause, not symptom):**

1. **The reference command in `docs/07-INFRASTRUCTURE.md` was unusable.** Root cause: 1080×1920 handheld walking footage at CRF 26 costs ~14.6 MB per 8 s — 78 MB for the 43-second clip, against a 25 MB budget for *all* media. Measured four recipes and chose 720 at CRF 30 (`D-022`).
2. **The six WhatsApp videos are not horizontal.** Root cause: they are coded 848×480 with 90° rotation metadata, which ffmpeg applies before the filter chain. The doc's `scale=-2:480` would have produced 272×480 (`G-021`).
3. **The hero clip cannot be used whole.** Root cause: after 17 s it shows a corridor, a dated kitchen and a bathroom, and it ends on a **CapCut watermark**. Mapped the clip every 1.5 s and cut 7–17 s (`G-022`).
4. **The iPhone sources embed GPS coordinates.** `-map_metadata -1` on every output (`G-023`).
5. **A committed `.sh` would have been handed to bash with CRLF.** Root cause: `core.autocrlf=true` and no `.gitattributes` (same family as `G-015`). Added `*.sh text eol=lf`.
6. **A false alarm of Claude's own:** `git show | grep -c $'\r'` reported 88 CR in the committed script. Checking the actual bytes with `od -c` showed LF on both sides; the grep was the artefact, not the file.

**Changed from the approved plan (and why):**

- The hero is **7–17 s**, not 0–12 s: the first six seconds are only lawn, while 7–17 is one continuous move through covered gallery, grill, pool and patio. It also weighs less (1.93 MB for 10 s).
- Descriptive file names (`jardin`, `quincho`, …) instead of `g1…g6`.
- **Two stills dropped, one added.** One frame had a cut, out-of-focus table in front; another was 60 % floor. A frame of the grill with the clay oven was added.
- `-map_metadata -1` was not in the plan; it is not optional for a public file.
- `.claude/launch.json` was created to be able to watch the videos in a browser.
- The night video stayed out, as recommended and accepted with the "go": the guests' faces are recognisable.

**Gates (run on `main` at `78ee699`, 2026-09-21):**

```
npm run typecheck   → ✓ Types generated successfully (exit 0)
npm run lint        → exit 0, no errors, no warnings
npm run build       → ✓ Compiled successfully in 6.1s; routes: ○ /  ○ /_not-found  ◐ /admin  ◐ /admin/login  (ƒ Proxy)
```

**Follows:** `WU-07` begins with the **`HERO`**, through `seccion-premium`: references first, Mateo picks, the plan table and his GO-AHEAD, then it is built on the running site and looked at at 375, 1440 and 1920 before anything is reported.

### 2026-09-21 → 2026-09-22 · WU-07 · `HERO`

**Asked (Mateo's own words, in order):**

1. "si, actualizá el worklog y arrancamos con el hero".
2. To the seven references: **"1 - 1 y 2 con la animcion del 5 · 2 - fondo"** — a mix, so it went to a prototype round.
3. To the three variants' plan: **"1 largo 2 arriba go"**, then **"1, pileta"** (variant Recorrido, starting on the pool take).
4. "go, y tambine revisa n detalle hay todos viudeos muy muy hecho cerca en dektop y los botonoes no me gustan nada **no me haz dado inspiracion** y relamente no me gusta, los bootnes es tanto dektop comom moible".
5. To the seven button references: **"7 . igual"** (hover.dev · Neu, and the header button behaves the same).
6. "la transcion esta malisima se ve muy mal".
7. "es desde cerrada no desde una parte aparece en el azul y se va abriendo en vertical enmobiel en horzionatal en desktop".
8. "pero dije que se abra como un rectnaguo desde el medio vertical par mobile y como un rectangulo acostado desde dektop desde el medio · ademas el gsap no esta nada fluido todo suoper horbboile, porfavor devuelveme algo serio y a la altura de esto usa las habildades de /diseno profavor se serio".
9. "levana el proyecto que se cayo" · **a hand drawing**: a small rectangle inside the screen, standing on the phone and lying down on desktop · "ahi lo vi y sigue igual seguis sin enteder la refercia... es dese todo el fondo y va creciendo ese rectangulo desde el medio".
10. **"ahora si, dale commit y push"**.

**Done:**

- **`seccion-premium` round for the `HERO`.** 14 sites opened and tried at 1440 and 375, with their entrances captured frame by frame; 7 presented, 7 discarded with a reason. Mateo asked for a mix, so three variants were built behind the standard picker at `/prototipo-hero` — Recorrido, Ficha and Barra — and he chose **Recorrido**.
- **Promotion.** The variant became `components/hero/hero.tsx`, `/` stopped being the placeholder, and the prototype was deleted file by file.
- **Second round, for the buttons**, which he rejected outright: 8 galleries opened, 11 concrete buttons hovered and captured at 0 / 130 / 280 / 560 ms, 7 presented. He chose hover.dev's **Neu** (the button lifts and a solid edge grows), translated to the brand — the edge is beige over the dark hero, never the original's black.
- **Four rounds of corrections on the opening**, ending in the one he drew: the screen starts entirely dark blue and a **rectangle grows from the middle**, keeping the screen's proportion, so it stands on a phone and lies down on a desktop.

**Files (every file created or modified, with what changed):**

| File | What |
|---|---|
| `app/page.tsx` | The home renders the `HERO` instead of the `h1` placeholder |
| `app/layout.tsx` | Instrument Serif for headlines (`next/font`, variable `--fuente-titulo`), the button and hero stylesheets, and the pre-paint script |
| `app/globals.css` | `html` gets the dark blue so the scroll bounce never shows white |
| `components/hero/hero.tsx` | The `HERO`: the media, the provisional bar, the text and the button |
| `components/hero/media-hero.tsx` | The opening (four panels moving together), the take change (curtain), play/pause by visibility, and the per-take framing |
| `components/hero/entrada-texto.tsx` | The text entrance, tied to the opening: starts at 0.55 s, staggered 0.09 s. `fromTo`, because the initial state comes from a stylesheet |
| `components/hero/hero-apertura.tsx` | Script that runs **before the first paint**: closes the panels and hides the text. As an injected stylesheet, not an attribute on `<html>`, and it removes itself after 3 s |
| `components/hero/contenido.ts` | The hero's real content and the two takes with their framing |
| `components/hero/hero-nav.tsx` | Provisional bar: logo and button. The real `NAV` has its own round |
| `components/hero/hero.css` | Hero tokens (provisional colours), the media layers, the treatment, the panels, the text |
| `components/ui/boton.css` | The site's button: solid edge, lifts on hover, sinks on tap. `.boton-en-oscuro` for dark backgrounds |
| `scripts/build-media.sh` · `public/media/hero-pileta*` · `hero-jardin*` | Two wide takes cut from the walkthrough (12–17 s and 1–5 s), replacing `hero.mp4`, which started up against the gallery |
| `next.config.ts` | `devIndicators: false`, so the dev badge stops landing in every design capture |
| `docs/06-UI-UX.md` · `docs/10-MEMORY.md` · `WORKLOG.md` | The `HERO` row, `D-023` with every rejection, `G-024`…`G-028`, and this entry |
| Deleted | `app/prototipo-hero/` (4 files) and the three variants `hero-recorrido.tsx`, `hero-ficha.tsx`, `hero-barra.tsx` |

**Verified (with real results, on the production build unless stated):**

- **Smoothness, counting every frame:** the opening runs at **60 fps**, median 16.7 ms, worst 16.8 ms, **zero frames over 32 ms**, at 1440 and at 390. The take change: **59 fps**, 2 slow frames.
- **Shape, frame by frame** at 300 / 700 / 1000 / 1250 / 1500 / 2200 ms: dark blue, then a small rectangle in the middle, growing with a margin on all four sides, standing at 390 and lying down at 1440.
- **Five sizes** (375, 390×664, 360×640, 1440, 1920): no horizontal scroll, **zero console errors**, the button always inside the screen, 235×52 px.
- **Reduced motion:** panels already out and video paused, from the first frame.
- **The button:** desktop hover lifts it 4 px and grows the edge from 0 to 8 px in 0.85 s; on a phone the edge is there from the start (4 px) and sinks to 0 in 0.12 s when tapped.
- Gates: `npm run lint`, `npm run typecheck` and `npm run build` all pass.

**Not verified (explicitly):**

- Any real phone or real network: everything was Chromium headless emulating an iPhone.
- The hero in production at `araucaria-multiespacio.vercel.app`: the branch is pushed but not merged.
- Whether 720 px of source is enough on a 1920 screen: the video is still enlarged 2.7× there, disguised by the treatment. It goes away with `CR-02`.

**Resolved along the way (root cause, not symptom):**

1. **"Todos los videos muy cerca en desktop."** Root cause: a vertical video cropped to a wide screen turns any close shot into a close-up, and no `object-position` fixes it. Only the two stretches filmed wide are used now (`G-024`).
2. **The curtains were invisible.** Root cause: the take layers carry `z-index: 1/2` and their wrapper did not isolate them, so they competed with the panels in the parent's stacking context and the video covered them (`G-027`).
3. **Every timed frame was late.** Root cause: `page.screenshot` waits for `document.fonts.ready`. The captures moved to `Page.captureScreenshot` over CDP (`G-028`). Claude had drawn a wrong conclusion from those frames and corrected it.
4. **The opening "ate" its own movement.** Root cause: `expo.out` spends 90 % of the travel in the first 30 % of the time. A claim that GSAP was skipping frames was wrong and was withdrawn after measuring; the curve was the cause.
5. **The take change dropped 30 frames.** Root cause: both videos were playing at once so the outgoing one would not freeze. With a curtain that covers instead of a crossfade, only the active take plays: 30 dropped frames → 2.
6. **The solid edge of the button was invisible.** Root cause: it has to contrast with the **background**, not with the button (`G-025`).
7. **The header button broke into two lines on a phone** and crushed the logo. Under 560 px it reads "Disponibilidad", and no button ever wraps.
8. **A hydration warning** appeared when the pre-paint script touched the `style` attribute of `<html>`; it injects a stylesheet instead.

**Gates (on `wu-07-hero`, 2026-09-22):**

```
npm run typecheck   → ✓ Types generated successfully (exit 0)
npm run lint        → exit 0, no errors, no warnings
npm run build       → ✓ Compiled successfully; routes: ○ /  ○ /_not-found  ◐ /admin  ◐ /admin/login
```

**Follows:** Mateo merges `wu-07-hero` and names the next section. References first, then the plan and his GO-AHEAD.

### 2026-09-22 · WU-07 (cont.) · merge del `HERO`, titular corregido y ronda de la galería

Continuación del mismo chat que la entrada anterior, después del commit `342ea7c`.

**Asked (Mateo's own words, in order):**

1. **"dale vamos con eso"** — the merge of `wu-07-hero` into `main`.
2. "el que me recomiendes pero antes cambia el titulo **espacio versátil para cumpleaños, eventos infantiles,talleres y celebraciones de todo tipo.** y abajo si con las cosas que cuenta, esta tinvetrido el titulo, la idea es atraer tood tipo de evento luego vas a contar los espacios que tiene".
3. **"si a las dos, dale con la galería"** — commit the headline change, and start the gallery round.
4. To the seven gallery references: **"combinaria la 1 con las difentes posciones de la 4"**.
5. To the two questions of the variants plan: **"9 y siempre"**, and then **"aun no go"** — the decisions are taken, the build is not authorised.
6. "Pará acá y volcá el estado al repo…" (this entry).

**Done:**

- **`wu-07-hero` merged into `main`** (fast-forward, 25 files) and pushed. Verified in production, not only locally.
- **The headline was inverted and got fixed.** It used to sell the place before the event. Now the `h1` names the events and the subhead lists the spaces.
- **`seccion-premium` round for the gallery, step 2 and 3 complete:** 12 references opened and tried, 7 presented with their captures, 5 discarded with a reason. Mateo asked for a mix, so the round moved to the prototype branch of the method: the three-variant plan was presented with its table. **He answered the two questions and explicitly withheld the GO-AHEAD**, so nothing was built.

**Files (every file created or modified, with what changed):**

| File | What |
|---|---|
| `components/hero/contenido.ts` | `TITULO` and `BAJADA` swapped roles. `TITULO` = "Espacio versátil para cumpleaños, eventos infantiles, talleres y *celebraciones de todo tipo*"; `BAJADA` = "Salón de usos múltiples con patio, pileta, parrilla y horno pizzero. Hasta 35 personas, en Güemes 3660, Santa Fe." Both come from `docs/01-CONTEXT.md` |
| `components/hero/hero.css` | `.hero-titulo`: `max-width` 17ch → **26ch** and `font-size` `clamp(2.35rem, 6.2vw, 5.4rem)` → **`clamp(1.95rem, 4.3vw, 4rem)`**. `.hero-bajada`: `max-width` 46ch → 54ch |
| `WORKLOG.md` | §1 rewritten; this entry appended |
| `docs/10-MEMORY.md` | `D-024`, `D-025`, `G-029`, `G-030`, `TD-007`, `OQ-08` |

**Nothing of the gallery exists yet**: no `app/prototipo-galeria/`, no `components/galeria/`, no `components/ui/visor.tsx`. The plan for those files is in this entry under "Sigue", and it is what the GO-AHEAD would authorise.

**Verified (with real results):**

- **The merge, in production.** Waited for the deploy and checked the served HTML: it carries `hero-telon-arriba/abajo/izq/der`, `hero-titulo`, `boton boton-en-oscuro` and the headline text. `media/hero-pileta.mp4` → 200 `video/mp4` 833,661 B · `media/hero-jardin.mp4` → 200 2,172,389 B · `media/hero-pileta-poster.jpg` → 200 `image/jpeg` 268,123 B.
- **The opening, on the live site**, captured over CDP at 1100 / 1400 / 3000 ms, at 1440 and at 390: same behaviour as local — dark blue, the rectangle growing from the middle, then open. **Zero console errors**, no horizontal scroll, headline and button correct.
- **The new headline, in the five sizes** (375, 390×664, 360×640, 1440, 1920) after the rescale: title 741×182 px at 1440 (three lines) and 343×92 px at 375; the button ends at 788 / 640 / 616 / 844 / 1024 px, **always inside the screen**; no horizontal scroll; zero console errors.
- **The gallery references**: 12 opened at 1440, scrolled twice, captured three moments each; the shape of their pieces measured (width ÷ height) to know which ones take vertical material — Apple Cards 0.60, Focus Cards 0.67, Parallax Scroll 0.79, Aman and Soho House 1.00 (square), Images Slider 1.44, the GSAP demos 1.77.
- **Focus Cards' hover, captured before and after**: the card under the pointer stays sharp and the others blur.

**Sin verificar (explicitly):**

- The hero on a real phone or a real network: everything was Chromium headless emulating an iPhone.
- **Apple Cards Carousel's drag**: the automated drag did not move the cards in two attempts. The source describes it as draggable; it has not been confirmed by hand.
- **Layout Grid's click**: the automated click scrolled the page to its pricing section instead of expanding a cell. The effect is not confirmed.
- The three GSAP gallery demos: their URLs opened the hub's listing, so the effect was never seen (`G-029`).
- Whether 720 px of source is enough on a 1920 screen: the hero video is still enlarged 2.7× there (`TD-007`).

**Resolved along the way (root cause, not symptom):**

1. **The long headline broke into five cramped lines** against the left edge, with half the screen empty. Root cause: `max-width: 17ch` plus a display size meant for a short headline. Rescaled to 26ch and a smaller clamp; three lines at 1440.
2. **The interaction tests proved nothing at first.** Root cause: the hover and the click were aimed at the `img`, while the effect lives on its container. Aiming at the container showed the blur immediately (`G-030`).

**Gates:**

```
npm run lint        → exit 0, no errors, no warnings
npm run typecheck   → ✓ Types generated successfully (exit 0)
npm run build       → ✓ Compiled successfully
```

Run after the headline change, before committing it. No test runner exists in the repo (`TD-003`).

**Commits in this stretch:**

- `342ea7c` `feat(hero): seccion HERO con apertura en rectangulo y boton propio (WU-07)` — merged to `main` fast-forward.
- `620d18b` `fix(hero): el titular nombra el evento y la bajada cuenta los espacios` — pushed straight to `main` (class `R0`).

**Sigue:** Mateo gives the GO-AHEAD (or changes the plan) and the three gallery variants get built behind the picker. The plan he has in hand:

| File | What |
|---|---|
| `app/prototipo-galeria/` (page, prototipo, picker, picker.css) | The three variants behind the standard picker, `noindex` |
| `components/galeria/contenido.ts` | The 9 pieces with the name of each space: El jardín · La parrilla y el horno · El patio · La pérgola · La pileta · La fachada · El salón |
| `components/galeria/pieza.tsx` | Video or photo, poster first, the video only loads and plays when it is about to be seen |
| `components/galeria/galeria-fila.tsx` · `-mosaico.tsx` · `-corre.tsx` | A · Fila desfasada (one draggable row, pieces of different heights, offset vertically) · B · Mosaico (irregular grid, ordinary scroll) · C · Mosaico que corre (the grid moves sideways while scrolling, pinned — flagged to him as the risky one, because he rejected scroll hijacking in Sanalys) |
| `components/galeria/galeria.css` | Grids, sizes and captions |
| `components/ui/visor.tsx` · `visor.css` | The "tap to see it big", shared: native `<dialog>`, closes with Escape and on the backdrop, focus trapped |
| `next.config.ts` | `noindex` for the prototype route |

Decided already and not to be asked again: **9 pieces** (the 6 videos plus 3 photos) and the caption **always visible**, never only on hover.
