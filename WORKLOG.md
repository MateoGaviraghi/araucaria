# WORKLOG — Araucaria · Event salon (phase 1)

> §1 is the current state and is rewritten in full every time. §2 is append-only: an entry per chat, dated, and nothing in it is ever deleted or shortened. Decisions, gotchas, technical debt and open questions do **not** live here — they live in `docs/10-MEMORY.md`, which is the memory of the project (`D-NNN`, `G-NNN`, `TD-NNN`, `OQ-NN`).

## 1. STATE

**Updated:** 2026-09-17, end of the first build chat.

| | |
|---|---|
| **Current task** | Phase 1 of the Araucaria site. Work units WU-01 … WU-05 of `docs/11-ROADMAP.md` are done and merged to `main`; the next unit has not started |
| **Real status** | The app is live at `araucaria-multiespacio.vercel.app`: a placeholder public page (`/`, an `h1` with "Araucaria"), a working owner panel at `/admin` (login, month calendar, reserve/free, undo, animated alert) and the public availability read with its cache. **Production has no admin credential yet**, so nobody can enter the published panel. The public landing has no real content or design yet |
| **Last chat** | 2026-09-16 → 2026-09-17 (this one). Last commit on `main`: `b33202a` |
| **Waiting on me (Claude)** | Nothing in flight. The next unit starts with a plan table and Mateo's GO-AHEAD |
| **Waiting on Mateo** | (a) Decide the next unit: WU-06 media pipeline, or naming the first public section for its `seccion-premium` round. (b) Answer `OQ-06` and `OQ-07` in `docs/10-MEMORY.md`. (c) He holds the dev passphrase (credential version 2); it exists only in his password manager |
| **Waiting on third parties** | The client owes `CI-01` (WhatsApp number that receives inquiries), `CI-02`, `CI-03`, `CI-05` and `CR-01`…`CR-03` (original photos, videos and logo). See `docs/12-CLIENT-INPUTS.md`. The provisional teal/beige colors of the panel stay `{{CONFIRMAR}}` until the logo arrives |
| **Next action** | Present the plan table for the next work unit and wait for the written GO-AHEAD |
| **Do not touch** | `main` without Mateo's word (commit and push only when he says so) · the production Neon branch: it has the five tables and **no** credential; a migration there is class `R3` (backup first, applied alone) · the two real blocks in the `dev` branch (2026-09-19 Mediodía, 2026-09-20 Noche) left by Mateo's own testing: every verification script preserves rows it did not create · `.env.local` and the Vercel environment variables (values are his) · the Neon branch `backup-pre-0000-init` (restore point taken before the production migration) |

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
