# WORKLOG — Araucaria · Event salon (phase 1)

> §1 is the current state and is rewritten in full every time. §2 is append-only: an entry per chat, dated, and nothing in it is ever deleted or shortened. Decisions, gotchas, technical debt and open questions do **not** live here — they live in `docs/10-MEMORY.md`, which is the memory of the project (`D-NNN`, `G-NNN`, `TD-NNN`, `OQ-NN`).

## 1. STATE

**Updated:** 2026-09-26. **The public page and the owner panel are complete, in production, and checked by Mateo on his iPhone** (*"ya lo vi en el iphone, está todo bien"*).

| | |
|---|---|
| **Current task** | Phase 1 of the Araucaria site.<br>**Public page:** finished (see `WU-10`).<br>**Owner panel:** rebuilt in this chat.<br>• `/admin/login`: split screen with the garden photo (`D-043`); the form is in the static shell (`D-044`).<br>• `/admin`: a dashboard with a side menu (a bottom tab bar on the phone), with Inicio, Reservas and Calendario (`D-046`).<br>• Reservations carry the client's name and an optional phone. The table is `reservations`; name and phone are cleared 90 days after the date (C-16).<br>• "Nueva reserva" picks the date on a month calendar beside the day's modules (`D-047`).<br>**Next piece of work:** Mateo names it (never propose it) |
| **Real status** | `main` = `origin/main` = `1e73789` (pushed 2026-09-26), plus the `/cerrar` record commit if Mateo pushes it. Code last changed in `1e73789`: `MIN_PASSPHRASE_LENGTH` 20 → 13 (`D-049`). Before that, `9d85312` (header active link `G-067`, Instagram logo `G-068`); Vercel served it at 10:59 ART and it was checked in production. Mateo redeployed production on 2026-09-26 with the new `DATABASE_URL` and `NEXT_PUBLIC_WHATSAPP_NUMBER`.<br>**Migration `0001_swift_grim_reaper`** (`reservations` + `module_blocks.reservation_id`) is applied to **dev and production**. Before production: Neon branch `backup-pre-0001-reservas` (`br-lingering-fog-acsbxjny`).<br>**Production data:**<br>• `admin_credential`: **version 2**, rotated on 2026-09-26 to the password Mateo chose (`D-049`; never write it in the repo, which is public). Version 1 was loaded by Mateo on 2026-09-25 at 20:17 ART; before that the row was missing (`G-058`). The dev branch keeps its own, older credential (version 3 on 2026-09-23), untouched.<br>• 3 modules loaded with the old panel, shown as "Sin datos del cliente".<br>**Dev data:** 0 reservations, its 3 original modules, no live test session.<br>**Verified by Mateo on his iPhone:** the login, the panel and the date calendar. Verified by me with headless Chromium against dev at 1920 / 1440 / 1366 / 375 / 360, with 0 overflow and 0 console errors. Only branch: `main` |
| **Last chat** | 2026-09-26 (began with `/retomar`): the admin password rotated in production to one Mateo chose, and the minimum lowered to 13 characters (`D-049`). The chat before (2026-09-25 → 2026-09-26): semgrep scan, the login (`D-043`, `D-044`), the panel (`D-045` rejected, `D-046`, `D-047`), the production DB password rotated (`TD-010`), the contact number (`D-048`), and the header and Instagram fixes (`G-067`, `G-068`) |
| **Waiting on me (Claude)** | Nothing |
| **Waiting on Mateo** | (a) Whether to look into the ~3.2 s first load after idle (`OQ-10`).<br>(b) The next piece of work.<br>(c) Whether to keep the new admin password: it was typed in the chat, and commit `1e73789` (public repo) described it as easy to guess and 13 characters long. The description was removed from `D-049` in the `/cerrar` commit, but git history keeps it. Changing it again: `npm run rotate-password -- <env file>`, or ask me to do it through the Neon tool as in `D-049`.<br>**Done 2026-09-26:**<br>• the production database password was rotated (`TD-010` paid);<br>• `NEXT_PUBLIC_WHATSAPP_NUMBER` = `5493425450336` is set and redeployed. Checked: every `wa.me` link in production points to it (`D-048`) |
| **Waiting on third parties** | The client owes:<br>• `CI-01`, the WhatsApp number: **provisionally 3425450336** (`D-048`); if the client wants another, change `NEXT_PUBLIC_WHATSAPP_NUMBER` in Vercel and redeploy.<br>• `CI-02` and `CI-03`.<br>• `CI-05`, VAT and price validity, still `{{CONFIRMAR}}`.<br>• `CR-01` … `CR-03`: original photos, videos and logo. All colours, including the panel's, stay `{{CONFIRMAR}}` until the logo arrives.<br>• `CR-04`: Instagram says 3650.<br>**If `CR-02` arrives filmed wide, `D-027` … `D-030` reopen** |
| **Next action** | **On `/retomar`:** wait for Mateo to name the next piece of work.<br>**Any panel change:**<br>• read `D-046` and `D-047` first; they replace `D-019` and `D-045`;<br>• a test session on the **dev** branch works: insert the sha256 of a random token into `admin_sessions` with the current `credential_version`, and log out with the panel's own button at the end;<br>• never touch the production branch for tests.<br>**Admin password:** rotate it as in `D-049` (hash locally with `lib/auth/password.ts`, run the script's upsert-and-audit statement with the Neon tool on branch `production` = `br-purple-star-acul4a08`, project `rapid-scene-48728943`, org `org-wispy-base-64115850`), only with Mateo's "sí"; no connection string needed.<br>**Any migration:** back up production with a Neon branch first, run `DATABASE_URL=<prod> npm run db:migrate` (`.env.local` does not override a variable already set), and check `drizzle.__drizzle_migrations` |
| **Do not touch** | • Pushing `main` without Mateo's word.<br>• `.env.local`: **not even to count or grep a variable**.<br>• The Vercel environment variables (Mateo changes them himself; secret values never go through the chat).<br>• The production Neon branch, except with Mateo's explicit "sí" for that action (a migration there is class `R3`).<br>• The Neon branches `backup-pre-0000-init` and `backup-pre-0001-reservas`.<br>• The two real blocks in the `dev` branch (2026-09-19 Mediodía, 2026-09-20 Noche).<br>• `components/cierre/mapa-datos.ts` by hand (it is generated from OpenStreetMap, see `D-036`).<br>• **The designs already rejected** in `D-023`, `D-025`, `D-027`, `D-029`, `D-030`, `D-033`, `D-034`, `D-036`, `D-037`, `D-040`, `D-041`, `D-043`, `D-045`, `D-046` and `D-047`. Among them:<br>  • anything retro or neubrutalist;<br>  • a reference round made only of uiverse and 21st (memory `referencias-uiverse-21st`);<br>  • the split "Mitades" cells as the way to book;<br>  • a dashboard without a side menu;<br>  • the native date input |

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

### 2026-09-22 → 2026-09-23 · WU-07 (cont.) · la galería: tres variantes, rechazo entero, y el carrusel ordenado

Same chat as the previous entry, picking up right after the commit `5744c80`.

**Asked (Mateo's own words, in order):**

1. **"vamos con el goheads ? recurdalo bien antes de empezar"** — the GO-AHEAD for the three-variant gallery prototype of `D-025`, with the plan restated first.
2. **"me gusta el de corre, pero me gustaria mas si lo dividmos mejor en secciones tipo patio, slon asi, y que luego cundo vaymos correindo vya haciendo una animacion degsap para ir mostrando los diofenrets espacio y mostrar esa exprecia inmersiva y fluida"**.
3. **"el jardin y el patio es lo mimso y tambien la parte de la pergola es dentro del patio, dejalo en salon, patio, parrilla, y pileta"** — answering the chapter split.
4. **"re dseña las tre opcione s prique no me ha gustado ninguna, relamente no le encuntro la forma yt no me gusta el desorden ese genrado ya que todas son vertcales, busca inspiraciones nuevas de carosueles y haz tres opcines profesinales"** — all three thrown out.
5. **"paradas, la 1 y la 3"** — answering the new reference round: upright pieces, Nobu Barcelona plus Habitas Tulum.
6. "/cerrar" (this entry).

**Done, in three passes:**

- **Pass 1 — the three variants of `D-025`.** `/prototipo-galeria` built with the standard picker: A · Fila desfasada, B · Mosaico, C · Mosaico que corre (pinned). Nine pieces, captions always visible, the shared viewer. Shown at 375 / 1440 / 1920.
- **Pass 2 — C turned into a walkthrough (`D-026`).** He picked C and asked for chapters. The nine pieces were grouped into **four spaces** (El salón 2 · El patio 4 · La parrilla 1 · La pileta 2), each chapter opening with a cover that travels with the track, the pieces rising as they cross the right edge through GSAP's `containerAnimation`, the covers lagging 120 px, and four marks under the track saying which space you are in. Below 900 px and under reduced motion the chapters stack.
- **Pass 3 — everything redesigned (`D-027`).** He rejected all three. Second reference round, **carousels only**: 13 candidates opened, 7 presented with their captures and the crop cost of each shape; he chose upright, Nobu + Habitas. The three variants were rebuilt from scratch on one rule — **every piece identical** — as **A · Fila**, **B · Calma** and **C · Una por vez**.

**Files (every file created or modified, with what changed):**

| File | What |
|---|---|
| `app/prototipo-galeria/page.tsx` | **New.** Server component. `metadata.robots` noindex/nofollow, and `searchParams` read inside a `<Suspense>` so the first HTML already carries the chosen variant (Cache Components, `G-026`) |
| `app/prototipo-galeria/prototipo.tsx` | **New.** Holds the variant index and a remount counter, writes `?v=` with `history.replaceState`. Rewired in pass 3 to Fila / Calma / Una |
| `app/prototipo-galeria/picker.tsx` | **New.** The `prototype` skill's picker expressed in React, same behaviour contract. Two additions of its own: it ignores keys while a `dialog[open]` exists, and (pass 3) while `e.defaultPrevented` (`G-038`) |
| `app/prototipo-galeria/picker.css` | **New.** Copied **verbatim** from `PICKER.md` §Styles. Not restyled |
| `components/galeria/contenido.ts` | **New.** `TITULO` "Conocé el espacio", `BAJADA` "Un recorrido por el salón, el patio, la parrilla con horno pizzero y la pileta.", `ESPACIOS` (the four, with their pieces) and `PIEZAS` derived flat. The nine pieces with their real `alt`, written after looking at 9 posters and 18 video frames on a contact sheet — **not** from the file names |
| `components/galeria/pieza.tsx` | **New.** Poster first, `<video>` mounted 400 px before entering and played only when 15 % visible, entrance with GSAP, click opens the viewer. Props `epigrafe` ("encima" \| "debajo"), `entradaPropia`, `retraso` |
| `components/galeria/galeria-fila.tsx` | **New, rewritten in pass 3.** A · Fila: native horizontal scroll with mandatory snap, mouse drag on top, `01 — 09` counter and arrows in the header, name over the photo. Three cards in view and the fourth peeking |
| `components/galeria/galeria-calma.tsx` | **New (pass 3).** B · Calma: same rail, smaller pieces (five in view), no arrows or dots, a 1 px progress rule, name **below** the photo, centred heading |
| `components/galeria/galeria-una.tsx` | **New (pass 3), rewritten once.** C · Una por vez: two-column card — name, counter, arrows and a strip of nine thumbnails on the left; the take on the right inside a track that measures one piece plus the peek. Moved with GSAP, keyboard arrows, `ResizeObserver` to re-centre |
| `components/galeria/galeria.css` | **New, rewritten twice.** Tokens (provisional, mirroring the hero), section heading, the shared piece (`--alto` + `aspect-ratio: 9/16`), shared controls (`.gal-cuenta`, `.gal-flecha`), and the three variants. 524 lines |
| `components/ui/visor.tsx` | **New.** The "see it big": native `<dialog>` + `showModal()`, arrows to move, Escape and backdrop to close |
| `components/ui/visor.css` | **New.** Full-screen viewer, blurred backdrop, controls moved to thumb reach below 640 px |
| `components/galeria/galeria-mosaico.tsx` · `galeria-corre.tsx` | **Created in passes 1–2 and DELETED in pass 3.** Copies kept at `…/scratchpad/variantes-viejas/` (`TD-008`) |
| `lib/gsap.ts` | **Modified.** Registers `ScrollTrigger` alongside `useGSAP` and `DrawSVGPlugin`. It was needed by the pinned variant, which no longer exists — worth revisiting |
| `next.config.ts` | **Modified.** `PROTOTIPO_HEADERS` (`X-Robots-Tag: noindex, nofollow`) applied to `/prototipo-galeria` and `/prototipo-galeria/:path*` |
| `docs/10-MEMORY.md` | **Modified.** `D-026`, `D-027`, `G-031`…`G-039`, `TD-008`, `OQ-09` |
| `WORKLOG.md` | **Modified.** §1 rewritten; this entry appended |

**Verified (with real results):**

- **The three current variants at 375 / 1440 / 1920** — nine combinations, all nine pieces present, **zero console errors and zero horizontal overflow** in every one. Section heights: Fila 769 / 946 / 990 px · Calma 637 / 922 / 924 · Una 831 / 990 / 1018.
- **The rule of `D-027`, measured** — one single piece size per variant: **324×576** in A, **263×468** in B, **344×612** in C, the nine of them. All 9:16, so no take is cropped.
- **17 of 17 interaction checks** (`scratchpad/probar-galeria.cjs`): drag moves the rail in A and B (scrollLeft 0 → 344 and → 286, the progress rule at `scaleX(0.244)`); a drag does **not** open the viewer but a click does; Escape closes; in C the arrow advances and the track shifts (x 173 → −194) with the active take centred to **0 px of error**, the thumbnail jumps to its take (also 0 px), the keyboard moves; under `prefers-reduced-motion` in all three nothing is hidden (every opacity 1) and no video plays; with JavaScript off the HTML already carries the nine pieces.
- **Captions of B, read from the DOM:** El salón · El salón · El patio · El patio · El patio · El patio · La parrilla · La pileta · La pileta (`OQ-09`).
- **The `HERO` after touching `lib/gsap.ts`** — checked at 1440 and 375: headline, curtain transformed out, button, one video playing, no overflow, **zero console errors**.
- **The pass-2 walkthrough, before it was rejected** (kept because the numbers cost work): the run was **2898 px of scroll at 1440** and 2959 at 1920, the section pinned at `top: 0` throughout, the indicator going El salón → El patio → La parrilla → La pileta, 3–4 videos playing at a time.
- **The reference round:** 13 carousels opened at 1440, scrolled through up to six screen heights each, made to advance with a button or a drag, and the shape of their pieces measured to compute the crop cost of each one.

**Sin verificar (explicitly):**

- None of this on a **real phone or a real network** — everything is Chromium headless emulating one.
- **Nothing of the gallery has been seen in production**; it has never been deployed.
- Whether the videos' **first frame decodes fast enough** on a slow connection for the poster-to-video swap to stay invisible; it was only checked on localhost.

**Resolved along the way (root cause, not symptom):**

1. **The viewer never opened.** The `<video>` carried `z-index: 1` and painted above the click layer. It already covers the poster by document order, so the `z-index` came off and both media got `pointer-events: none` (`G-032`).
2. **Everything measured 0×0** while the screenshot showed a rendered page. Next streams the `<Suspense>` content into a `<div hidden>` before moving it into place (`G-033`).
3. **The entrances looked frozen half-way.** The app's Browser pane was hidden, which stops `requestAnimationFrame` (`G-031`). Every measurement moved to the project's own headless shell.
4. **Clicking the backdrop did not close the viewer.** The box covers the dialog edge to edge, so `e.target === dialog` never matched (`G-034`).
5. **The first chapter cover ate its own first letter.** The parallax hung off each cover's crossing, and the first one is born inside the screen (`G-039`).
6. **The pinned mosaic did not fit the screen** and its captions fell below the fold; the section now measures exactly 1440×900 and 1920×1080, and the caption moved over the piece.
7. **The phone went wider than the screen in C.** A `1fr` grid column takes the min-content of the rail, which is all nine pieces (`G-035`).
8. **The picker stole the arrow keys** from variant C's carousel (`G-038`).
9. **Two reference series were deleted** by a `rm -f a*.png` meant for temporaries (`G-036`). Recaptured.

**Gates:**

```
npm run lint        → exit 0, no errors, no warnings
npm run typecheck   → ✓ Types generated successfully (exit 0)
npm run build       → ✓ Compiled successfully · /prototipo-galeria as ◐ Partial Prerender
```

Run at the end of each pass. No test runner exists in the repo (`TD-003`); the gallery's own checks live in the scratchpad, not in git.

**Commits in this stretch:** none. Everything above is uncommitted in the working tree (12 new files, 3 modified, 2 deleted-but-copied-out).

**Verification scripts of this stretch**, all in the session scratchpad, none in git (`TD-003`):

| Script | What it does |
|---|---|
| `mirar-galeria.cjs` | The three variants × 375 / 1440 / 1920: CDP captures, piece geometry, console errors, horizontal overflow |
| `probar-galeria.cjs` | The 17 interaction checks |
| `mirar-recorrido.cjs` | The pass-2 walkthrough step by step (still points at the deleted variant) |
| `refs-carruseles.cjs` · `refs-carr2.cjs` | The two reference rounds: opens each site, scrolls looking for a carousel, measures the shape of its pieces |
| `revisar-hero.cjs` | That the `HERO` still works after `lib/gsap.ts` changed |

**Sigue:** Mateo picks A, B or C — or says what to change. Then the winner is promoted into `/` as block 3 of `docs/06-UI-UX.md` §2, `app/prototipo-galeria/` is deleted whole, and `lib/gsap.ts` is checked for whether `ScrollTrigger` is still needed now that the pinned variant is gone.

### 2026-09-23 · WU-07 (cont.) · la galería: cuarta ronda, tarjetas apiladas, historias, la fila de escritorio y el dedo

Same chat as the previous entry, after a `/compact`; it restarted with `/retomar`, which found the record and the code matching (`main` at `5744c80`, no open PRs, the three `D-027` variants on :3000).

**Asked (Mateo's own words, in order):**

1. "/retomar".
2. **"no me gusto ninguna opcion asi que quiero que redsieemos toda la galeria traeme nuevas animaciones seria, utiliza las habiliades de /diseno se serio con lo que devuelkves todo porfavor estamos perdiendo mucho tiempo"** — the three carousels of `D-027` rejected whole.
3. **"me encantaron mucho todas pero voy a quedar con la 1, porfavor quiero que sea con scroll animacion, gsap, lo ms fluido inmersivo y profesioal posible"** — reference 1, Olivier Larose · Cards Parallax.
4. **"1 - si 2 - vaya 3 - go"** — smooth scroll on the landing, the `01-CONTEXT` line on each card, GO-AHEAD.
5. **"no me gusto ya que hay muhcos espacios libre tanto en mobile como desktop no termina siendo una carousel, creoq ue tambien me estas dando ejemplos de desktop y esto esta mas ligado a telfono entonces necesitamos que busques inspraciones mas enfocadas a lo que es mobile, o hacer esto pero de una manera resposive que quede bien que se pueda ver todo como corresponde, no digo que el diseño sea feo me enanta pero no le cuentra la manera facil snecilla y linda de mostrar esto, necesito que sea algo claro que sea vea bien y sea porfsional pero la faicldiad de la perosna de concoer cada uno de los espacios y buscar esa atraccion"** — with two phone captures (El salón, La parrilla).
6. **"1 - forma 2 - solas 3 - go"** — the stories inside each card, photos advancing on their own, GO-AHEAD.
7. **"no me gusta el de desktop que al ser en verticl haya tantos espacios no me cierra"**.
8. **"1 - solos 2 - go"** — the four spaces side by side on the desktop, passing the turn on their own, GO-AHEAD.
9. **"1 - si 2 - si pero en mobile me gustaria que vos tengas para desklizar con el dedo entre el carosuel de las imagenes y no esperar"** — approved, commit yes, and the finger on the phone.
10. **"go"** — GO-AHEAD for the finger.
11. **"si y /cerrar"** — commit the finger, then this entry.

**Done, in five passes:**

- **Pass 1 — fourth reference round, searching for the motion.** 25 candidates opened in the project's headless shell, scrolled with the wheel at 1440 and 375 and captured in 9 frames each (`refs-anim*.cjs`); 5 presented with one sheet each: Olivier Larose · Cards Parallax, White Desert "Our camps" (Awwwards SOTD 2026-09-11), Codrops · SVG Mask Scroll Transitions, Codrops · Sticky Grid Scroll, Codrops · One Element Scroll. My pick was 1; Mateo picked 1. The 20 discarded, with reasons, are in `D-028`.
- **Pass 2 — the stack (`D-028`).** Four cards, one per space, each a sticky capa of `100svh`; GSAP scrubbed with 1 s of smoothing (takes rising, image 1.3× → 1×, cards shrinking 3 % and darkening 14 % per card above), texts opening from masks (1.2 s `power3.out`). Lenis on the landing only. The three `D-027` variants and `app/prototipo-galeria/` deleted after copying them out; `next.config.ts` back to `5744c80`. Measured the frame drops down to their cause: several videos decoding at once (`G-041`, measured with the real GPU, `G-042`) → one video at a time, taking turns.
- **Pass 3 — the stories (`D-029`).** Mateo's correction: empty space. Each card shows its takes one at a time at full size, like Instagram stories: bars, tap left/right, a photo advances after 6 s and a video when it ends, a vertical curtain between takes (0.9 s), the same take blurred under 55 % of the card's colour behind. `pieza.tsx` replaced by `historia.tsx`.
- **Pass 4 — the desktop row (`D-030`).** From 1000 px the four spaces sit side by side as four stories of one size, edge to edge, the whole section in one screen, name and line over each take on a gradient. One video at a time across the row: the turn passes left to right when a take ends; the mouse takes it. The row rises and opens from the bottom, scrubbed, and finishes when its top passes 60 % of the screen.
- **Pass 5 — the finger (`D-031`).** On the phone the take follows the finger; on release it completes past 25 % of the width or with a flick (0.4 px/ms on the last 80 ms), otherwise it goes back. On the phone taps and the auto-advance also change sideways; the desktop keeps its vertical curtain.

**Files (every file created, modified or deleted, final state):**

| File | What |
|---|---|
| `app/page.tsx` | **Modified.** Mounts `<ScrollSuave />`, `<Hero />`, an inline pre-paint script that keeps every `.gal-linea` at `translateY(125%)` until GSAP takes over (removed by itself after 3 s; does nothing under reduced motion), and `<Galeria />` |
| `components/galeria/galeria.tsx` | **New.** The section `#espacio`: title, the four spaces, the viewer. All the motion in one `useGSAP` with `gsap.matchMedia()`: stack below 1000 px, row from 1000 px, nothing under reduced motion. The turn: `activa` (stack: the card on top, by a ScrollTrigger at `top 60%`; row: left to right on each `onFinToma`), `fijo` (the column under the mouse) |
| `components/galeria/tarjeta.tsx` | **New.** One space: number `0N — 04`, name, line; the blurred background; the story. Holds `{ actual, anterior, sentido }` together so a change is one state update. `modo` pila/fila decides what the mouse does and the curtain's axis |
| `components/galeria/historia.tsx` | **New.** The story: layers (only the current and the leaving one visible), bars, tap zones, expand button, auto-advance (photo tween of 6 s, video `ended`), one video at a time, the curtain on `x` or `y`, and the finger drag (`touch-action: pan-y`, pointer capture, last-80-ms velocity, click suppressed after a drag) |
| `components/galeria/contenido.ts` | **Modified.** The `Pieza` type moved here from `pieza.tsx`; `detalle` per space, verbatim rows of `01-CONTEXT` §Amenities |
| `components/galeria/galeria.css` | **Rewritten.** Tokens (provisional, `{{CONFIRMAR}}`), masks, the sticky stack (`flow-root`, `G-040`), the phone card (`--margen` 4svh, `--apilado` 10 px, 16 px padding), the blurred background, the story frame (`min(100cqh, 100cqw·16/9)`), bars, the row from 1000 px, reduced motion |
| `components/galeria/pieza.tsx` | **Deleted** (copy in `variantes-viejas/ronda-d028/`) |
| `components/galeria/galeria-fila.tsx` · `galeria-calma.tsx` · `galeria-una.tsx` | **Deleted** (copies in `variantes-viejas/ronda-d027/`) |
| `app/prototipo-galeria/page.tsx` · `prototipo.tsx` · `picker.tsx` · `picker.css` | **Deleted** (copies in `variantes-viejas/ronda-d027/prototipo-galeria/`) |
| `components/scroll-suave.tsx` | **New.** Lenis on the landing only (not on `/admin`): lerp 0.075, `syncTouch: false`, `anchors: true`, `autoRaf: false` with `gsap.ticker` driving it and `ScrollTrigger.update` on scroll, `lagSmoothing(0)`; not mounted under reduced motion (`useSyncExternalStore`, server snapshot = not mounted) |
| `components/ui/visor.tsx` | **Modified.** Stops Lenis while open (`useLenis`), `data-lenis-prevent`; imports `Pieza` from `contenido.ts` |
| `next.config.ts` | **Reverted** to `5744c80` (`PROTOTIPO_HEADERS` gone with the route) |
| `lib/gsap.ts` | Unchanged in this stretch: `ScrollTrigger`, registered in the previous one, is now used |
| `docs/10-MEMORY.md` | **Modified.** `D-028` … `D-031`, `G-040` … `G-046`, `TD-009`, `OQ-09` closed |
| `docs/06-UI-UX.md` | **Modified.** §2 row 3 marked built, with its real shape |
| `WORKLOG.md` | **Modified.** §1 rewritten; this entry |

**Verified (with real results):**

- **Final shape, six sizes plus two**, zero console errors and zero horizontal overflow in all: phone stack — frame 311×553 at 375×812 (70 % of the card), 238×424 at 390×664, 226×402 at 360×640, one size per screen in the four cards; desktop row — 319×567 at 1440×900 (row from y=279 to y=846), 416×740 at 1920×1080 (y=275 → 1015), 225×400 at 1366×650 (y=223 → 623), 243×432 at 1100×800; 999 px is still the stack.
- **Frame times with the real GPU** (flags of `G-042`): stack with three videos at once 110 of 530 frames over 33 ms → one at a time 0 of 619; stories on the wheel 0 of 599 (2 of 663 with CPU ×4); desktop row arrival 0 of 433 (0 of 431 with CPU ×4); four finger drags 0 of 346.
- **Turns, second by second:** stack — El patio 8 s / 8 s / 2.5 s, La pileta alternating, La parrilla looping, never two at once; row — El salón 6 s → El patio 8 s → La parrilla 8 s → La pileta 2.2 s → again.
- **Interaction:** stories 13 of 13 (tap both ways, photos every 6 s, videos on end, mouse pauses, viewer pauses the card and it resumes after, reduced motion); row 10 of 10 (the mouse takes and keeps the turn, click advances, viewer stops the row, reduced motion); finger 9 of 9 with real touch events (40 % passes both ways, 10 % returns with nothing peeking, a 21 % flick passes by speed, a vertical gesture scrolls 285 px without changing the take, tap still works).
- **Texts:** hidden lines leave 0 px inside their masks (1440 and 360); reloading parked on the third card the name goes 117 → 44 → 11 → 1 → 0 px, never seen written before opening; the name opening frame by frame 123 → 103 → 59 → 22 → 4 → 0 px over 1.3 s.
- **Lenis:** active on the landing, off under reduced motion; one wheel notch settles in about 1.17 s; with the viewer open the wheel does not move the page, and after Escape it does.

**Sin verificar (explicitly):**

- **A real phone.** Everything was emulated: the finger thresholds, `touch-action: pan-y` against iOS Safari's own gestures, and the auto-advance in the hand.
- **Mateo's own screen, 1920 × 911** (measured 1920 × 1080).
- **Production.** Nothing of the gallery is deployed: `main` is 2 commits ahead of `origin/main` and was not pushed.
- **A real network:** how fast the first frame of each video decodes on a slow connection.

**Resolved along the way (root cause, not symptom):**

1. **All the cards stuck at the same height, no edges behind.** The card's top margin collapsed through the sticky capa (`G-040`) → `display: flow-root` on the capa.
2. **The name stopped 96 px short.** The pre-paint `translateY(110%)` was parsed into GSAP's `y`, so `yPercent` ended at 0 with `y` still set → `fromTo` with `y: 0` on both ends.
3. **El salón's takes were smaller than the others' (261×464 vs 275×489).** Its line wraps to two rows and ate height → two rows reserved; first on the mask (with `border-box` the padding counted), then on the line, because a mask taller than its text let a one-line caption stay visible when "hidden" (`G-043`).
4. **5 px of the name visible while hidden.** The mask's bottom padding for descenders → texts hide at 125 %, not 110 % (`G-043`).
5. **Up to half the frames at 33 ms.** Not the transforms: several videos decoding at once, isolated case by case with the real GPU (`G-041`, `G-042`) → one video at a time, in turns.
6. **Two faulty tests, not faulty code:** a sticky element measured where it was stuck (`G-044`); the viewer's own video counted as a card video.
7. **The desktop row could rest with columns at different heights** if the scroll stopped mid-arrival → the arrival finishes at 60 % of the screen instead of 35 %.
8. **The row's names never opened in the resting position at 1440×900** — the trigger asked for y=828 and the row ends at 846 → trigger on the row's bottom edge entering the screen.
9. **The flick test failed** because CDP touch events arrive 30–50 ms apart and the speed was measured from the first touch (`G-046`) → speed over the last 80 ms, and a genuinely fast test gesture.
10. **The CodePen video-scrub demo could not be opened** — a Cloudflare human check, not bypassed (`G-045`).

**Gates:**

```
npm run lint        → eslint . --max-warnings 0, exit 0
npm run typecheck   → ✓ Types generated successfully (exit 0)
npm run build       → ✓ Compiled successfully · / as ○ (static)
```

Run after every pass. No test runner exists (`TD-003`); the checks live in the scratchpad.

**Commits in this stretch** (on `main`, the project's usual branch; **not pushed**):

- `3a0989f` feat(galeria): un espacio por historia, pila en el celular y fila en escritorio (WU-07) — 12 files, the gallery with `D-028` … `D-030` and the docs.
- `ac178ed` feat(galeria): en el celular las tomas se deslizan con el dedo — `historia.tsx`, `tarjeta.tsx`, `galeria.css`, `10-MEMORY.md` (`D-031`).

**Verification scripts of this stretch**, in the session scratchpad, none in git (`TD-003`):

| Script | What it does |
|---|---|
| `refs-anim.cjs` · `refs-anim2.cjs` · `refs-anim3.cjs` · `pen-scrub.cjs` · `hoja.sh` · `lamina.sh` | The fourth reference round: captures by wheel, fine passes, contact sheets and one sheet per option |
| `mirar-pila.cjs` · `hoja-pila.sh` | The phone stack at six sizes, every card change at 100/75/50/25/0 %, geometry, scales, veils, playing videos |
| `mirar-fila.cjs` | The desktop row: arrival frames, sizes, fits-one-screen, and the turn second by second (`turno`) |
| `probar-pila.cjs` · `probar-turnos.cjs` · `probar-historia.cjs` · `probar-visor.cjs` · `probar-fila.cjs` · `probar-dedo.cjs` | Interaction checks: openings, Lenis, reload, viewer, reduced motion, turns, taps, row, finger (real touch events) |
| `perf-pila.cjs` · `perf-gpu*.cjs` · `gpu.cjs` | Frame times, first software then with the real GPU, isolating videos, layers and transforms |
| `dbg-cabeza.cjs` · `dbg-oculta.cjs` · `dbg-flick.cjs` | One-off probes: header heights per card, text leaking out of masks, touch-event timing |

**Sigue:** Mateo looks at the gallery on his 1920 × 911 screen and on his phone, and either corrects it or says "push" — then `git push origin main` and a look at production at 375, 1440 and 1920. After that, he names the next section.

### 2026-09-23 · WU-07 (cont.) · push de la galería y verificación en producción

Same chat, right after the previous entry. **Asked:** "1 - si 2 - si" — commit the record, and push.

**Done:** loaded `/deploy` (route: the project is on Vercel's git integration, `main` → production). Committed the record as `792a1b6` and pushed `5744c80..792a1b6` to `origin/main`. Production (`araucaria-multiespacio.vercel.app`) served the gallery ~40 s after the push (`id="espacio"` in the HTML, HTTP 200).

**Verified in production** (same scripts as local, pointed at the production URL with `BASE`): 1440 — four stories of 319×567, row from y=279 to y=846, names open, zero console errors, zero overflow, the turn one video at a time (El salón → El patio → La parrilla → La pileta); 1920 — 416×740, y=275 → 1015, zero errors; 375 — frame 311×553, the stack's final scales 0.91 / 0.94 / 0.97 / 1, zero errors; the finger at 375 — 9 of 9 with real touch events, 0 of 349 frames over 33 ms.

**Sin verificar:** a real phone and Mateo's own 1920 × 911 screen.

**Sigue:** Mateo's corrections, or the name of the next section.

**Addendum, same day (after `/cerrar`):** Mateo answered "si" to committing and pushing the record's last update → `78ee7cc` "docs: la galería en producción, verificada a 375, 1440 y 1920", pushed `792a1b6..78ee7cc`; only `WORKLOG.md` changed, so production is unchanged. A second `/cerrar` then corrected §1 to that state (the commit hash and the pending items). No code, no decisions, no new gotchas since the entry above.
Then Mateo: **"commitea eso primero y deja anotado para cuando yo te pida el comando retomar sepas de eso"** — §1 was rewritten to describe the state after that commit (one local commit ahead of `origin/main`, not pushed) with an explicit instruction for the next `/retomar`, and committed without pushing.

### 2026-09-23 · WU-08 · calendario público y formulario de consulta, a producción

**Asked (Mateo's words, in order):** `/retomar` → "1 - si 2 - el calendario" (push the record; next section: the calendar) · on `OQ-06/07/08` and `TD-008/009`: "no sé qué es" → "1 - si 2 - si 3 - si" (panel full width, commit `launch.json`, drop the copies) · "no recuerdo la contraseña" (he rotated the dev passphrase himself with `npm run rotate-password`) · "luego quiero que modifiquemos todo el dashboard admin porque no me gustó nada… /diseno /web-distintiva y… CRITERIO-DISENO.md… animación de alertas, gsap" — **for later** — "pero mientras tanto hacé el commit y decinos por qué me recomendás avanzar ahora" · calendar: "1 con la 3" → prototypes → "me gustó la de foto se cambia pero el diseño de tacha una parte hace que no se entienda que está reservado… no me gustó nada" → state references "no me convencen… no encuentro ese diseño donde diga wow" → three animated states → "la de sello con los colores de luces" → "si queda así, pasame el plan" → "1 - si 2 - go" (stay local until the form exists) → "1 - rama 2 - el formulario" · form: three reference rounds rejected ("muy feos y malos", "¿qué tiene que ver? te pedí formularios como estos" + Uiverse/Justinmind/Pinterest/21st links, "sigue sin gustarme… no lo veo reflejado en este sistema") → prototypes → Uiverse Novaxlo yellow-fly-74 brought by him → "vamos por buen camino… no me gustan los rellenos, le faltan animaciones… si pongo otro no salta el campo… el número más fácil… descartá la tarjeta con canto" → "seguís sin usar los colores de araucaria" → "vamos por el de sigue la cortina" + a vote-style counter + "+54 por default… la animación de que la cantidad de números está bien" → autofill light blue and "11/10 da correcto" → "si go" → "1 - si 2 - esperar" → "está todo correcto" → "1 - si 2 - si" (merge, push, `/cerrar`).

**Done:**
- Pushed `0cb7163`. `D-032`: `/admin` without the 1152 px column (`2f35b95`). `.claude/launch.json` committed (`999a1b6`). Scratchpad copies of rejected gallery code deleted (`TD-008`, `TD-009` paid). `OQ-06`, `OQ-07`, `OQ-08` closed.
- **Calendar** (`D-033`, `a1db698`): `components/calendario/` — `calendario.tsx` (state, entrance with ScrollTrigger at `top 70%`, curtain 1.1 s), `grilla.tsx` (lights 0.7 s / 28 ms, stamps 0.42 s `power4.in` from 0.55 s, "solo noche/mediodía"), `detalle.tsx` (date + three modules + "Seguir con mis datos"), `foto.tsx` (photo per month, 1.2 s, 1.08 → 1), `comun.tsx`, `disponibilidad.tsx` (server: `connection()`, today in Buenos Aires, `getAvailability`), `calendario.css`; `content/modulos.ts` (hours and prices from `01-CONTEXT.md`); `app/page.tsx` (section after the gallery inside `<Suspense>` + a pre-paint script hiding numbers, lights and stamps).
- **Form** (`D-034`, `e483be2`): `components/formulario/` — `consulta.ts` (fields, rules, exact message, +54 normalisation, 10 digits, `wa.me`), `campos.tsx` (floating-label field, phone meter, sliding-light options, "Otro" reveal, people counter, DrawSVG check), `formulario.tsx` (three steps inside the calendar curtain), `formulario.css`; `components/calendario/calendario.tsx` opens it on "Seguir con mis datos".
- Docs: `05-API-CONTRACTS.md` §3 (+54 and "Otro (…)"), `06-UI-UX.md` §2 row 6, §3, §4.1–4.2, `10-MEMORY.md` `D-032`, `D-033`, `D-034`, `G-047` … `G-054`.
- The prototype pages `app/prototipo-calendario/` and `app/prototipo-formulario/` were deleted file by file; the branch `wu-08-calendario-y-formulario` was fast-forwarded into `main` and pushed.

**Verified:** locally at 375, 360 × 640, 390 × 664, 1366 × 650, 1440 and 1920 (calendar: fits one screen on desktop, hidden before arrival and on reload, reduced motion shows all at once, zero overflow, zero console errors); the form end to end at 1440 and 375 (errors per step, the phone cases, "Otro (Bautismo)", counter, send → exact message). In production after the push: the same calendar and form checks, `wa.me` with a number. `npm run typecheck`, `npm run lint` clean; `npm run build` passes (`/` partial prerender).

**Sin verificar:** Chrome's autofill styling from a script (it cannot be triggered; Mateo looked at the result himself: "está todo correcto"), a real phone, and taken days in production (the production database has none).

**Resolved on the way (causes):** GSAP took a CSS `translateX(-101%)` / pre-paint `translateY(110%)` as `x`/`y` in px (`G-047`); React's development double mount left a ref saying "photo shown" after the revert (`G-048`); GSAP warns on empty targets (`G-049`); a ternary with two `div`s reused the flown-away bubble as the "sent" panel (`G-050`); a component declared inside render stole focus on every key (`G-051`); ScrollTrigger measured before the calendar above settled (`G-052`); `window.open` with `noopener` and Playwright popups (`G-053`); Chrome autofill paints fields light blue (`G-054`).

**Gates:** typecheck ✓ · lint ✓ · build ✓ (no test runner in the repo, `TD-003`).

**Sigue:** Mateo — commit of this record, a real phone, the next section or the `/admin` redesign.

### 2026-09-23 → 2026-09-24 · WU-09 · el cierre: "Dónde nos encontramos" + pie en tarjeta flotante, a producción

**Asked (Mateo's words, in order):** `/retomar` → "1 - si" (commit and push the WU-08 record) and *"lo mejor es dejemos hecho al completo la parte pública y luego terminamos el dashboard admin que en más los precios ya están, solo agregaría un dónde nos encontramos juntos con el cta y el footer, las cosas que incluye el alquiler las incluiría dentro de la galería, debe ser resumido"* → *"1 - el cierre 2 - sacarlo"* (the closing first; drop the NAV) → references round → *"1 con la 2"* → prototype plan → *"1 - solo 2 - go"* ("Araucaria" alone in the footer; go) → *"no me gusta la animación del mapa que recorra desde un lugar porque todos varían del sitio, tendría que verse bien las calles, lugares etc tipo google maps y dejar el diseño que está bien; me gusta la b pero está super mal distribuido la parte de contactos, super insulsos, feo y nada animado; pero me gustó el diseño de la B"* → *"1 - si podrías sacar y agregar cosas o lugares importantes que la gente se ubique más o menos por esos lugares; 2 - quiero el que está así, lo que no me gusta son los links de cada info de contacto, eso hay que mejorar, usá las páginas que te di, 21st, uiverse tienen cosas super hermosas, usá la habilidad diseño, recordá siempre usar la habilidad /diseno"* → (internet cut; `/retomar se cortó el internet` → "go") → *"1 - la 1 y 2 - si"* → "go" → *"el mapa está bien pero no hiciste absolutamente nada en el footer, sigue todo igual, asqueroso y no cambiaste nada, eso no son footer, horrible tanto en mobile como desktop"* → footer round → *"la 2 algo parecido pero no me termina de cerrar, hacelo dinámico más premium, habíamos elegido botones, combinalo"* → "si y go" → *"la c pero en desktop parece que se pisa con el mapa; y luego no me gusta los logos de contacto, quiero que sean los logos originales y que en whatsapp se muestre el logo, no el teléfono para llamar, y el correo sea con logo de gmail, lo mismo con el logo de google maps, y los links del salón más organizados porque así no me gusta en mobile solo esa parte"* → *"me gusta el color todo, sacale lo de que ilumine con el mouse y sacá la data de al lado, que el botón sea parte de ese link"* → *"si, dejá solo un teléfono, achicá los logos están muy grandes y usá un logo mejor para lo que es teléfono y que sea el mismo que utilizás en wsp, ese logo no pega nada con los demás"* → *"mejorá los logos del reloj, no me gusta, no pega con lo demás, y el nombre abajo en el footer dejalo del mismo color a toda la palabra como en la palabra CA porque si no queda feo solo una parte"* → *"cuando paso el mouse por google maps hace la animación pero en contacto ninguna hace la animación del botón; en teléfono quisiera, cuando está reservando, aparezca el formulario… cuando elegís un día deslice hacia abajo, no tenga que scrollear yo para tener que ir a rellenar la info, la idea es facilitar la carga de toda la info lo mayor posible"* → plan → "go" → *"si pasalo"* → *"si commit merge y push"* → *"anotá qué es lo próximo a hacer y /cerrar"*.

**Done:**
- Pushed the WU-08 record (`4c978da`).
- **The closing section** (`D-036`, commit `0034e25`, branch `wu-09-cierre` fast-forwarded into `main` and pushed):
  - `components/cierre/cierre.tsx` — `Cierre` (the whole closing: the beige location section `.cie-ubicacion` with `Direccion`, `Acciones` and `Mapa`, then `<footer className="pie-marco">` with `Pie`); `Pie` (the floating blue card: Araucaria · Contacto · Horarios · El salón, © line, `Contorno`); `Filas` (the contact logos, each logo is the link: WhatsApp → `enlace(...)` from `components/formulario/consulta.ts`, shown only when `hayNumero` · Teléfono 3425450336 · Gmail · Instagram); `Dato` (text + small logo, the big logo jumps on hover; used by Horarios and "Cómo llegar"); `Contorno` (ARAUCARIA outline); helpers `L`, `lineas`, `useEntrada`.
  - `components/cierre/cierre.css` — tokens (same provisional colours as calendar/gallery), masks, the location section, the map styles (`.mp-*`), the footer card (`.pie*`), the logo row (`.pie-logos`, `.pie-logo`, `.pie-logo-cuerpo` 34 px), the phone layout (columns stacked, salon links in two columns of rows).
  - `components/cierre/mapa.tsx` — `Mapa` (SVG of Candioti Norte, fixed pixels-per-metre framing 0.5 desktop / 0.62 phone, landmark icons, drop marker, HTML label "Araucaria · Güemes 3660" above the marker, "© OpenStreetMap"), `entradaDelMapa` (zoom 0.92 → 1 in 2.4 s, names fade in, marker drops 0.7 s, one ripple), `mapaQuieto`.
  - `components/cierre/mapa-datos.ts` — generated from OpenStreetMap (Overpass `maps.mail.ru` mirror; the main servers timed out): streets, main roads, parks, rail, the rail yard, the station building, Laguna Setúbal, 60+ street labels and 10 landmarks (Estación Belgrano, Liceo Municipal, Plaza Pueyrredón, Museo MAC, Puente Colgante, Monumento Brigadier López, Club Regatas, Costanera, Plaza de las Banderas, Laguna Setúbal). Güemes 3660 geocoded by Nominatim at -31.63712, -60.68857. The generator (`gen.py`) and raw OSM JSON stayed in the session scratchpad, not in the repo.
  - `components/cierre/logos.tsx` — `Logo` with hand-drawn SVGs in brand colours: WhatsApp, Gmail, Google Maps, Instagram, Teléfono (green rounded square with the same handset as WhatsApp), Reloj (Clock-app style: dark rounded square, white face, orange second hand).
  - `app/page.tsx` — `<Cierre />` after the calendar, with `GUION_CIERRE` hiding lines, map names/marker/label, the ARAUCARIA stroke and the card's position before first paint (3 s, like the gallery and calendar).
  - `components/calendario/calendario.tsx` — `D-035`: on narrow screens (panel below the grid) picking a day, and later "Seguir con mis datos", scrolls the panel to 16 px from the top; `window.scrollTo` smooth with a finger, `lenis.scrollTo` 1.1 s with a mouse; nothing on the desktop.
  - `docs/06-UI-UX.md` §2 rows 1, 4, 5, 7, 8 rewritten; `docs/10-MEMORY.md` `D-035`, `D-036`, `G-055`, `G-056`.
- The prototype page `app/prototipo-cierre/` (page, selector, verbatim picker CSS) was deleted file by file.
- Auto-memory: `referencias-uiverse-21st` (always `/diseno`; component references from uiverse.io and 21st.dev first).

**Verified:** in production after the push — footer at 1440 × 900 and 375 × 812 (0 overflow, 0 errors), calendar auto-scroll on 390 × 844 (panel at 16 px) and none on 1440. Locally before the push: the footer at 1440, 1920 × 1080, 1366 × 650, 375 × 812, 360 × 640 at rest, on entry and with the mouse (the logo jump now works); reload parked at `#ubicacion` (normal and reduced motion: nothing out of place, everything shown with reduced motion); the map at 1440, 1920, 375, 360 × 640.

**Sin verificar:** a real phone (the tap on a logo, the auto-scroll with a real finger, the look of the map); the OpenStreetMap geometry against the street for the landmark positions (taken from OSM, not walked).

**Resolved on the way (causes):** the contact logos were also the mask line, so GSAP's inline entry transform beat `:hover` and they never jumped (`G-055`, hover moved to `.pie-logo-cuerpo`); a string exported from a `"use client"` module reaches a server component as a client reference, so the pre-paint CSS is a literal in `app/page.tsx` (`G-055`); Lenis ignores `scrollTo` during a touch (`G-056`) and a programmatic scroll stops at the page end, so the calendar's auto-scroll fell short until the closing existed below it (`G-056`); on touch devices `:hover` sticks after a tap and the "dim the others" rule left the whole footer dimmed (the rule was later removed entirely); `SVG stop-color` via attribute did not read CSS variables, set via `style`; the uiverse.io site sat behind Cloudflare, so the 124 contact components were rendered from its open-source repo `uiverse-io/galaxy`.

**Gates:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ (`/` partial prerender) · no test runner in the repo (`TD-003`).

**Sigue:** block 4 — what the rental includes, summarised inside the gallery (`D-036`), a `seccion-premium` round with uiverse/21st references first. Then the `/admin` redesign.

### 2026-09-24 · WU-10 · "Lo que incluye el alquiler" (block 4), a producción — the public page is complete

**Asked (Mateo's words, in order):** `/retomar` → (after the branches were deleted from GitHub in the previous chat) the plan: block 4 as a band after the four spaces or inside each card → *"1 - la b 2 - go"* (a band after the gallery; go for references) → 7 references from 21st.dev → *"la 1 o 2"* → prototype plan → **"go"** → *"quiero algo más sencillo, que sea fácil de ver, fácil de entender, pero que sea profesional, serio y prolijo y siga con la estética de esto; hacelo vos a los tres ejemplos, buscá las inspiraciones que creas necesarias, podés ir variando y adaptando en mobile y desktop, revisalas y sé autocrítico al construir, no me traigas cualquier pavada, necesito terminar con esto"* → *"no puedo verlo"* (the local dev server had died; restarted) → *"me gustó el b pero me gustaría que tenga viñetas, algo más prolijo y lindo, siempre respetando el GSAP y eso porque si no parece desorganizado"* → promotion plan → **"go"** → *"si commit y push"* → `/cerrar`.

**Done:**
- **References** (`seccion-premium`, through `/diseno`): uiverse.io searched first (lista, checklist, marquee, info card, tags, stats) — only pricing cards with ticks and loose icon grids, nothing of this component; it also blocks headless Chromium (Cloudflare), so it was browsed in the app's browser pane. 21st.dev: 22 components captured with Playwright at 1440 × 900 and 390 × 844, 7 sent (Hover Image Preview · Cinematic List · Stats Bold · Text Marquee · Pill Marquee · Infinite Ribbon · Marquee Along SVG Path).
- **Prototype round 1** on `/prototipo-incluye` (A · Frase with a photo card on hover · B · Filas that open with the photo · C · Mezcla, card following the mouse): rejected whole.
- **Prototype round 2**, everything visible, no hover (A · Ficha with a giant 35 · B · Columnas · C · Con foto): Mateo picked B and asked for bullets; bullets added (6 px blue dot on the first line, 9 px between items, a `back.out(2)` pop before each line).
- **Promoted B** (`D-037`, commit `f72b155`, pushed to `main`):
  - `components/incluye/incluye.tsx` (new) — `Incluye`: `section.inc#incluye`; head "Lo que incluye el alquiler" + "Para hasta 35 personas." / "La limpieza del lugar está incluida."; `GRUPOS` 01 El salón (Salón de usos múltiples, Baño, Espacio de lavado con pileta) · 02 El patio (Patio exterior con pileta, 8 sillones y livings de exterior) · 03 La parrilla (Asador, Horno pizzero grande) · 04 Para la mesa (30 sillas, 3 mesas plegables, Vajilla y vasos para 30), all from `docs/01-CONTEXT.md`; helpers `L` (mask) and `Hilo` (hairline). Entrance in one `useGSAP` timeline at `top 75%`, `once`: `.inc-hilo` scaleX 0 → 1 (0.9 s, `power3.inOut`, 0.06 s apart) · `.inc-linea` `{ y: 0, yPercent: 120 }` → `{ y: 0, yPercent: 0 }` (0.9 s, `power3.out`, 0.045 s apart, from 0.1 s) · `.inc-vineta` scale 0 → 1 (0.5 s, `back.out(2)`, 0.07 s apart, from 0.45 s). Reduced motion: no tween.
  - `components/incluye/incluye.css` (new) — provisional tokens (same as gallery), `.inc` beige band (`padding clamp(64px, 9vw, 136px)` top), masks, `.inc-hilo`, `.inc-titulo`, `.inc-cabeza`, `.inc-bajada` (title face `clamp(1.9rem, 3.6vw, 3.4rem)`, second line muted), `.inc-columnas` / `.inc-columna` (phone: grid `2.6em 1fr`, one group per row; ≥ 900 px: four columns, gap `clamp(20px, 2.4vw, 40px)`), `.inc-columna-items li` (grid `6px 1fr`), `.inc-vineta` (6 px dot, `--ar-azul`, `margin-top: calc(0.725em - 3px)`).
  - `app/page.tsx` — import `Incluye`; `GUION_INCLUYE` (pre-paint: `.inc-linea{transform:translateY(120%)}.inc-hilo{transform:scaleX(0)}.inc-vineta{transform:scale(0)}`, removed after 3 s, skipped with reduced motion); `<Incluye />` right after `<Galeria />`.
  - `docs/06-UI-UX.md` §2 row 4 — built, with its content.
  - `docs/10-MEMORY.md` — `D-037` (both rounds, Mateo's words, the rejected list).
- `app/prototipo-incluye/` (page) deleted; the prototype variants and the picker were removed from the component and the CSS.

**Verified:**
- Locally on the real page (`/`) with headless Chromium at 1440 × 900, 375 × 812 (touch, dpr 2) and 1920 × 1080, reaching the band by scrolling in 150 px steps: the band is 690 / 847 / 715 px tall; 0 px horizontal overflow; 0 console errors. Reloaded parked on the band: first frame `.inc-linea` at `translateY(22.46px)` (hidden), after the entrance at 0. Reduced motion at 1440: everything shown at once.
- The same run in production after the push: the same heights, 0 overflow, 0 errors, the same reload behaviour.

**Sin verificar:** a real phone.

**Resolved on the way (causes):**
- On the real page the lines never showed: the pre-paint `translateY(120%)` was read by GSAP as `y: 22.46px` and kept under `yPercent`. The prototype had no pre-paint script, so it did not show there. This is `G-047` again, fixed with `y: 0` at both ends.
- Round 1, A · Frase: the floating card covered the sentence, because animating the card made GSAP write `translate: none` over the CSS `translate: -50% calc(-100% - 12px)`. Fixed with a positioning wrapper `.inc-flota`, with GSAP animating only the inner card.
- Round 1, A · Frase: "la parrilla con horno pizzero" jumped whole to the next line, because a `<button>` does not break across lines. Fixed with `span role="button"`.
- Round 2, A: a separator in `::after` on a block mask broke onto its own line; it goes on `.inc-linea::after`.
- (All of round 1 and round 2's A and C are now deleted.)
- The local dev server had died and Mateo could not see the prototype; restarted with `preview_start`.

**Gates:** `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓ (`/` partial prerender) · no test runner in the repo (`TD-003`).

**Sigue:** the `/admin` redesign, as a `seccion-premium` round; Mateo names which panel screen goes first.

### 2026-09-24 · WU-10 (cont.) · correcciones del celular (D-038)

**Asked (Mateo's words):** three screenshots from his iPhone in production and *"hay detalles que mejorar, más que nada en mobile: cuando toco un día el scroll me lleva, si ves el formulario aparece cortado o corto, entonces te quita la experiencia, ver lo del mapa, hacelo que se vea completo ese form completo, si no se ve feo · el footer de mobile, el Araucaria abajo no se ve directamente · y las tarjetas de la galería me gustaría que sean más grandes las imágenes y videos ya que se ve muy chico, no tanto, un poco nomás, no rompamos la estética y el diseño"* → plan → **"go y si"** (go, and yes to installing Playwright's WebKit) → *"si commit y push"*.

**Done** (`D-038`, `G-057`):
- `components/calendario/calendario.css` — `.cal-panel` `min-height: max(460px, calc(100svh - 32px))` (was `clamp(460px, 64svh, 560px)`). New `@media (max-width: 999px)` block: `.cal-telon .cal-seguir`, `.cal-continua .fo-c-botones` → `margin-top: auto`; `.cal-continua .fo-c-paso` → `flex: 1`.
- `components/cierre/cierre.tsx` — `Contorno` is now `<p class="pie-araucaria">` with two spans, `.pie-araucaria-relleno` and `.pie-araucaria-trazo` (no SVG). In `Pie`'s timeline the trace goes `clipPath inset(0% 100% 0% 0%) → inset(0%)` (1.6 s, `power2.inOut`, at 0.3 s) and the fill `opacity 0 → 1` (0.9 s, at 1.6 s). Comments updated.
- `components/cierre/cierre.css` — `.pie-contorno*` replaced by `.pie-araucaria` (grid, `container-type: inline-size`, `line-height: 0.9`, `padding-bottom: clamp(6px, 1.4cqw, 16px)`) and its two layers (`font-size: 19.6cqw`, `letter-spacing: 0.02em`, `transform: scaleX(1.22)`; fill `color-mix(… beige-vivo 14%, transparent)`; trace `-webkit-text-stroke: max(1px, 0.18cqw)`).
- `app/page.tsx` — `GUION_CIERRE` hides `.pie-araucaria-trazo{clip-path:inset(0% 100% 0% 0%)}.pie-araucaria-relleno{opacity:0}` instead of the old SVG dash rule.
- `components/galeria/galeria.css` — phone card: `--margen` 2.5svh, `--apilado` 8px, `--relleno` 14px, `gap` 10px, name `clamp(2rem, …)`; comment with Mateo's words.
- `docs/10-MEMORY.md` — `D-038`, `G-057`.
- Tooling: Playwright 1.56 WebKit installed in the session scratchpad (`node node_modules/playwright-core/cli.js install webkit`), not in the repo.

**Verified** (headless Chromium, plus WebKit for the footer):
- **Calendar**, tapping a day then "Seguir con mis datos":
  - at 390 × 664 the panel is 632 px, 16 px from both edges (it was 460 px with 188 px of map showing); the form is 632 px with no inner scroll (it was 484 px inside a 460 px panel);
  - at 375 × 812 the panel is 780 px.
- **Gallery takes:**
  - 390 × 664: 238 × 424 → 259 × 461;
  - 375 × 812: 311 × 553 → 315 × 560;
  - 1440: 319 × 567, unchanged.
- **Footer**, in WebKit and Chromium:
  - 390 × 664: ARAUCARIA visible and whole;
  - 1440: the band is 233 px tall, the same as production.
- 0 px overflow and 0 page errors everywhere.

**Sin verificar:** the iPhone. WebKit on Windows rendered the OLD footer correctly too, so the original failure was never reproduced (`G-057`).

**Gates:** `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓.

**Sigue:** Mateo checks these on his iPhone; then the `/admin` redesign.

### 2026-09-24 → 2026-09-25 · WU-10 (cont.) · el formulario queda en su lugar (D-039) y el navbar a medida (D-040)

**Asked (Mateo's words):** after the iPhone check (*"ya lo vi en el iphone, está todo bien"*): *"esperá, mientras fui rellenando, no sé por qué el form no queda fijo y se hace como scroll para abajo, es raro, no queda fijo mientras voy pasando las secciones"* → plan → *"además agregale el navbar todo personalizado, fijo con GSAP para ambos, ya que no lo tiene, y también quitá ese call to action rápido"* (read as the go for the form fix) → navbar references → *"1 - 1; 2 - todas las secciones deben ser call to action al calendario de reserva; por favor necesito que terminemos esto"* → plan → **"go"**.

**Done:**
- `D-039` (form stays put on the phone):
  - `components/calendario/calendario.css` — only "Seguir con mis datos" stays at the bottom of the panel; the form's step button sits under the fields again.
  - `components/calendario/calendario.tsx` — `alPanel` (`useCallback`) runs on day change, on step change (`Formulario.alCambiarPaso`) and when `visualViewport` grows more than 120 px while the form is open (the keyboard closing).
  - `components/formulario/formulario.tsx` — the optional prop `alCambiarPaso`, called from `ir()`.
- `D-040` (navbar):
  - `components/nav/nav.tsx` + `nav.css` (new) — `Nav`: top bar (logo + 4 links from 900 px), round fixed button (desktop: appears after 160 px; phone: always, hides on scroll down, returns on scroll up), right-hand panel with the curved SVG edge, links, "Consultar disponibilidad", WhatsApp (if the number is set) and Instagram; Esc / veil / X / link close it; Lenis stops while open.
  - `components/hero/hero-nav.tsx` — deleted (the old bar and its quick "Disponibilidad" button).
  - `components/hero/hero.tsx`, `hero.css` — no `HeroNav`; `.hero-barra-sup` and `.hero-marca` rules moved to `nav.css`.
  - `app/page.tsx` — `<Nav />` before `<Hero />`.
  - `components/incluye/incluye.tsx` + `.css` — "Consultar disponibilidad" under the four columns (`.inc-accion`).
  - `docs/06-UI-UX.md` §2 row 1; `docs/10-MEMORY.md` `D-039`, `D-040`.

**Verified:** headless Chromium.
- **Form, 390 × 664:** with the page pushed away, the panel is back at 16 px after the "keyboard" closes and after tapping "Siguiente". The step-2 button sits at 497 px of a 632 px panel.
- **Navbar at 1440 / 375 / 1920:**
  - desktop button `scale(0)` at the top, `scale(1)` after scrolling;
  - panel 480 px on desktop and full width on the phone;
  - the "Qué incluye" link closes it and lands `#incluye` at 0;
  - 0 overflow, 0 errors.
- **Phone, 390 × 664:** with the form open the round button is hidden (bottom −22 px) and returns (70) after scrolling up.

**Sin verificar:** the real iOS keyboard; the navbar on the real iPhone.

**Gates:** `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓.

**Sigue:** Mateo checks on the iPhone; then the `/admin` redesign.

### 2026-09-25 · WU-10 (cont.) · el header entero fijo (D-041)

**Asked (Mateo's words):** *"el navbar funciona súper mal y solamente dejaste las tres líneas; no baja el header completo donde siga toda la web, lo mismo en desktop, malísimo, eso no es lo que pedí"* → plan → *"1 - go 2 - b"*.

**Done:**
- `components/nav/nav.tsx` — `Nav` rewritten as a fixed header (see `D-041`). Also exports `altoNav()`.
- `components/nav/nav.css` — `.nav-barra` driven by `--nav-p`; menu button inside the header; panel only below 900 px.
- `app/globals.css` — `--alto-nav` (66 / 68 px) and `scroll-padding-top`.
- `app/page.tsx` — `GUION_NAV`.
- `components/calendario/calendario.tsx` — `alPanel` parks the panel at `altoNav() + 12`.
- `components/calendario/calendario.css` — `.cal-panel` `min-height: max(460px, calc(100svh - var(--alto-nav) - 24px))`.
- `docs/06-UI-UX.md` §2 row 1; `docs/10-MEMORY.md` `D-041`.

**Verified** (headless Chromium, 1440 × 900, 390 × 664, 1920 × 1080):
- **Header height:** 101 px at the top, 70 after scrolling (`--nav-p` 0 → 1). On the phone 91 → 67.
- **Gallery:** hidden while it passes, at −77 px on desktop and −74 on the phone; back after it.
- **Active link:** Qué incluye, then Disponibilidad, then Dónde estamos, in step with the section.
- **Link "Dónde estamos":** lands the section at 68 px on desktop and 66 on the phone.
- **Phone:** the day panel sits at 78 px; the menu opens with the X in the header.
- 0 overflow, 0 errors.

**Sin verificar:** the real iPhone.

**Gates:** lint ✓ · typecheck ✓ · build: see the commit.

**Sigue:** Mateo checks on the iPhone; then the `/admin` redesign.

### 2026-09-25 · WU-10 (cont.) · el header como el de Sanalys (D-042)

**Asked:** *"en el header de desktop y de mobile quiero que quede como este ejemplo"* (Sanalys screenshots).

**Done:**
- `components/nav/nav.tsx` — `.nav-cta` "Consultar disponibilidad" / "Disponibilidad"; `.nav-marca-nombre`.
- `components/nav/nav.css` — three-column grid; the desktop breakpoint moved to 1080 px; the name hidden below 560 px; the menu as two lines with no circle; the button's edge always showing.
- `docs/10-MEMORY.md` — `D-042`.

**Verified:** headless Chromium at 1440, 1920, 1024, 390 and 360. Heights 70 / 70 / 67 / 67 / 67 px; 0 overflow; 0 errors.

**Sin verificar:** the iPhone.

**Gates:** lint ✓ · build ✓.

### 2026-09-25 · WU-10 (cierre) · confirmado en el iPhone y `/cerrar`

**Asked:** *"ya lo vi en el iphone, está todo bien /cerrar"*.

**Done:** this record. §1 was rewritten (the public page is complete and checked on the iPhone; next is the `/admin` redesign).

**Commits of this chat, all on `main` and pushed:**
- `f72b155` — "Lo que incluye" (`D-037`);
- `f563aa8` — phone corrections (`D-038`, `G-057`);
- `62de01f` — form in place + the round-button nav (`D-039`, `D-040`);
- `1181ada` — fixed header (`D-041`);
- `57a4812` — Sanalys-style header (`D-042`).

**Tooling left outside the repo:** Playwright 1.56 WebKit and the capture/measurement scripts (`hdr-ver.cjs`, `nav-ver.cjs`, `cal-medir.cjs`, `gal-medir.cjs`, `pie-webkit.cjs`, `form-fijo.cjs`) live only in the session scratchpad.

**Verified:** Mateo on his iPhone, 2026-09-25: *"está todo bien"*. Everything else is in the entries above.

**Gates:** none run for this record (docs only).

**Sigue:** the `/admin` redesign, starting with the **login** (Mateo: *"dejá anotado que arrancamos por el login"*).

### 2026-09-25 · WU-11 · semgrep, the login and the owner panel rebuilt, to production

**Asked (Mateo's words, in order):**
- `/retomar`.
- *"si a las dos pero antes ten en cuenta esto para la seguridad"*: the `entra-app-registration` and `semgrep` skills. I advised against the first; he answered *"si, instalalo y escaneá"* for semgrep, and *"vamos"* for the login round.
- Login round, all rejected: *"no me gustó ninguna… componentes retro… la idea era uno de los ejemplos, no que TODO lo hagas en base a eso… vamos con la 5, adaptala al diseño de Araucaria… no me devuelvas hasta tenerlo al 100… /loop"*. Then *"sí commit y push"*.
- *"demora MUCHÍSIMO en entrar o decir contraseña incorrecta, y puse la supuesta contraseña y me dio error"* → *"a, go"* → *"sí commit y push"*.
- Production password: *"no pude cargarla, no me deja, hagamos paso a paso"* … *"sí"* (to me building the env file from Neon) … *"listo"* … *"sí, entré"*.
- *"seguir… quiero que el próximo paso sea armar todo el dashboard completo, profesional, animado, con reglas de estructura y /diseno, hacela toda vos, sé crítico… no vuelvas hasta que esté terminado al 100 /loop"* → *"sí commit y push"*.
- *"no me gusta nada… súper difícil de entender, súper difícil de cancelar… no hay un navbar al costado, esto no es un dashboard"* → *"1 - nombre y teléfono 2 - esas tres"* → *"la 1 con la 3"* → *"1 - sí 2 - no 3 - go"* → *"1 - sí 2 - sí"* (production migration, then commit and push).
- *"no me gusta en la página de reserva cómo elegir la fecha, quiero que aparezca un calendario profesional… lo demás está bien"* → *"la 1, go"* → *"sí commit y push"* → *"ya lo vi en el iphone, está todo bien /cerrar"*.

**Done:**
- **Security scan.**
  - semgrep 1.178 (pip, user site) and the Trail of Bits `semgrep` skill installed globally (`~/.claude/skills/semgrep`).
  - Full-repo scan, 9 rulesets including Trail of Bits: **0 findings**. `p/nextjs` covered 0 files, reported as such.
  - A planted-bug control file caught 1 of 4, so 0 means "no obvious pattern bugs", not "audited".
  - jq installed with winget (`G-060`). Results only in the scratchpad.
- **Login** (`D-043`, commit `500bbae`): split screen with `public/media/fotos/jardin.jpg`, the public form's field, "Mostrar"/"Ocultar", the site's `.boton`, a GSAP curtain entrance and one shake on error. Files: `app/admin/login/page.tsx`, `login-form.tsx`, `login-escena.tsx` (new) and `login.css` (new).
- **Login speed and the missing password** (`D-044`, commit `b2ceca6`).
  - The form moved to the static shell; `Sesion` and `MarcaDeTiempo` (C-09 server time) are streamed, and "Entrar" waits for the mark.
  - Production had no `admin_credential` row (`G-058`). Mateo loaded it with `npm run rotate-password -- .env.produccion.local`; I wrote that file from Neon's connection string and deleted it after.
  - Cold first load is still ~3.2 s (`OQ-10`).
- **Panel v1** (`D-045`, commit `24d8451`): brand colours and a summary on top. **Rejected** by Mateo on the iPhone.
- **Panel v2** (`D-046`, commit `1cd0f26`).
  - Migration `drizzle/0001_swift_grim_reaper.sql`: `reservations`, and `module_blocks.reservation_id` on delete cascade.
  - `lib/reservas.ts` (new), `lib/dal.ts` (reads, `insertReservation`, `deleteReservation`, and the 90-day purge in `purgeAfterLogin`).
  - `app/admin/actions.ts`: `createReservation`, `cancelReservation`, `unblockModule` for legacy modules. `logout` no longer redirects.
  - Routes `app/admin/(panel)/layout.tsx`, `page.tsx`, `reservas/page.tsx`, `calendario/page.tsx`, `esqueleto.tsx`.
  - `components/admin/`: `panel-marco.tsx`, `secciones.tsx`, `dialogo.tsx`, `nueva-reserva.tsx`, `iconos.tsx`.
  - `app/admin/admin.css` rewritten.
  - Deleted: `app/admin/page.tsx`, `components/calendar/admin-calendar.tsx`, `components/ui/bottom-sheet.tsx`.
  - Production migration applied after the backup branch.
- **Date calendar** (`D-047`, commit `d89ddfe`): `nueva-reserva.tsx` (the month beside the day's modules), `takenInMonth` in place of `takenModules`, and `Dialogo amplio`.
- **Docs:** `04-DATA-MODEL` (table, purge), `05-API-CONTRACTS` (actions), `06-UI-UX` (§5 rows), `08-SECURITY` (access matrix, C-16, checklist), and `10-MEMORY` (`D-043` … `D-047`, `G-058` … `G-066`, `TD-010`, `OQ-10`).
- **Memory updated:** `referencias-uiverse-21st`. uiverse and 21st are one source among all, and nothing retro.

**Verified:**
- **Login:**
  - 1920 / 1440 / 1366 / 375 / 390 / 360: 0 overflow and 0 errors.
  - The entrance measured frame by frame.
  - The wrong-password shake, and the focus back in the field.
  - Reduced motion.
  - The session notice.
- **Production timing:**
  - form at 0.3–0.5 s warm and 3.2–3.6 s cold;
  - a wrong password answers in 0.75 s.
- **Panel v2 and the date calendar** (dev branch, test sessions revoked by the panel's logout):
  - create with and without a phone, and a whole day;
  - a taken module disabled; validation;
  - search; cancel with the question; "Deshacer";
  - cancel from the phone;
  - the calendar states (dot, struck, past), month navigation, and a free day opening the dialog with that day chosen.
  - Sizes 1920 / 1440 / 1366 / 375 / 360: 0 overflow and 0 errors. The public calendar still loads.
  - Contrast: every pair ≥ 4.5:1; the lowest is white on "Sí, cancelar", 4.86.
- **Mateo on his iPhone:** *"está todo bien"*.
- **Sin verificar:**
  - what causes the 3.2 s cold first load;
  - a real client's WhatsApp link from the panel;
  - the 90-day purge on real data (no reservation is 90 days old yet).

**Resolved on the way (real causes):**
- `G-058`: the password was missing in production.
- `G-059`: false hydration mismatch from Playwright's caret hiding.
- `G-060`: jq CRLF broke the semgrep runner.
- `G-061`: a drizzle `sql` template lost the regex backslash.
- `G-062`: the login's inline script after a client navigation.
- `G-063`: `font: inherit` beating the button classes.
- The chosen day lost its beige under the hover rule.

**Gates:** lint ✓ · typecheck ✓ · build ✓ before every push.

**Sigue:** Mateo decides whether to commit this record, rotates the production database password (`TD-010`), and names the next piece of work.

### 2026-09-26 · WU-11 (cierre) · la clave de la base de producción, rotada

**Asked:** *"por favor cerremos eso ahora así terminamos"* (`TD-010`).

**Done:** step by step and by Mateo, so the new value never passed through the chat:
- Neon, production branch: Roles → `neondb_owner` → Reset password.
- Vercel: `DATABASE_URL` (Production) replaced, then Redeploy.
- I only updated the record.

**Verified** in production with headless Chromium:
- the public calendar reads availability (32 days, no failure notice);
- `/admin/login` renders and enables "Entrar", with its streamed session check and no error screen.
- The old connection string is refused: `password authentication failed for user 'neondb_owner'`.
- The dev branch keeps its own role copy; the local `.env.local` was not touched.

**Gates:** none run (no code changed).

**Sigue:** Mateo names the next piece of work.

### 2026-09-26 · WU-11 (cierre) · el número de contacto, provisional (D-048)

**Asked:** *"utilizá este número para lo que es contactos en todo, de última luego que el cliente me diga si quiero cambiarlo, y luego de eso sí commit y push"* (3425450336).

**Done:**
- `D-048`; `docs/01-CONTEXT.md` (WhatsApp row); `docs/12-CLIENT-INPUTS.md` (`CI-01` PROVISIONAL).
- `components/admin/nueva-reserva.tsx` and `lib/reservas.ts`: the example phone no longer shows Mateo's own number.
- "Llamar" already used 3425450336.
- The WhatsApp links read `NEXT_PUBLIC_WHATSAPP_NUMBER`, which only Mateo sets, in Vercel.

**Sin verificar:** the WhatsApp links in production, until Mateo changes the variable and redeploys.

**Gates:** lint ✓ (the touched files).

### 2026-09-26 · WU-11 (cierre) · el header marca la sección correcta (G-067)

**Asked:** *"en desktop, cuando vas pasando en secciones, el header no subraya la sección que corresponde; en la captura estoy en disponibilidad pero está subrayado qué incluye"*.

**Done:**
- `components/nav/nav.tsx`: the active link is the section crossing mid-screen, looked up on every scroll update. It replaces the four per-section ScrollTriggers.
- `components/calendario/calendario.tsx`: `ScrollTrigger.refresh()` when the streamed calendar arrives.
- `G-067`.

**Verified:**
- Production before the fix: reproduced. At 1440 × 900, "Disponibilidad" was never marked; clicking it left "Qué incluye" or "Dónde estamos" marked.
- Locally, with a temporary 4 s delay in `Disponibilidad` (removed after): the old code failed twice; the fix gives 0 mismatches at 1920 × 911 and 1440 × 900, scrolling, clicking every header link and with the wheel.
- **Production after the push** (`9d85312`, 2026-09-26 10:59 ART): 0 mismatches scrolling at 1920 and 1440, and 14 of 14 right on header clicks and the wheel.

**Gates:** lint ✓ · typecheck ✓ (touched files).

### 2026-09-26 · WU-11 (cierre) · el logo de Instagram vuelve a su degradé (G-068)

**Asked:** *"el logo de Instagram también está bugueado, no se muestra el que habíamos puesto; luego sí commit y push"*.

**Done:**
- `components/cierre/logos.tsx`: gradient and clip ids per instance with `useId()`.
- `G-068`.

**Verified** locally at 1920 and 375:
- 0 duplicate ids on the page.
- The footer logo's pixels show the Instagram gradient.
- 0 console errors.

**Gates:** lint ✓ · typecheck ✓.

**Production check after `9d85312`:**
- the footer's Instagram logo paints its gradient;
- 0 duplicate ids;
- every WhatsApp link goes to `wa.me/5493425450336`.

### 2026-09-26 · WU-11 (cierre) · `/cerrar`

**Asked:** `/cerrar`.

**Done:** this record. §1 was updated: the date, the real `main` commit (`c17a1f8`), the chat span, `CI-01` provisional, and the Vercel variables rule. Every code change of this chat was already committed, pushed and checked in production (see the entries above).

**Gates:** none run (docs only).

**Sigue:** Mateo names the next piece of work; `OQ-10` (slow first load after idle) stays open.

### 2026-09-26 · WU-11 (after close) · the admin password, rotated in production (D-049)

**Asked (Mateo's words, in order):** `/retomar` → *"dame para reiniciar la contraseña del login"* → (I asked for the Neon connection string) *"la del login te dije, no la base"* → *"para entrar al admin, esa contraseña quiero cambiar"* → *"el comando que me dabas para cambiar la contraseña del login de admin"* (I gave `npm run rotate-password`) → *"¿podés hacerlo vos? la contraseña quiero que sea: <13 characters>"* → I warned it was under the 20-character minimum and easy to guess → *"bajala a esa, sino siempre es un quilombo acordarse para ellos"* → plan table → **"go"** (which included the "sí" to touch production) → *"si commit y push"* → `/cerrar`.

**Done:**
- `lib/auth/config.ts`: `MIN_PASSPHRASE_LENGTH` 20 → 13, comment points at `D-049`. Only `scripts/rotate-password.ts` reads it; the login never checked the length.
- Production `admin_credential` rotated to **version 2**: hashed locally with `hashPassword` from `lib/auth/password.ts` (self-check with `verifyPassword` = true), then the script's own `with credential as (insert … on conflict (id) do update …) insert into admin_audit …` statement run with the Neon MCP `run_sql` on project `rapid-scene-48728943`, branch `br-purple-star-acul4a08` (`production`). It returned `version 2` and wrote an audit `password_rotated`. No connection string was used or printed. Every session open before it is now invalid.
- `docs/08-SECURITY.md`: `C-01` rewritten (chosen by Mateo, ≥ 13 characters, the §5 limits protect it; the old rule kept in parentheses), and §6 "Run" says ≥ 13.
- `docs/10-MEMORY.md`: `D-049`. In the `/cerrar` pass its first line was changed so it no longer describes the password's content, and it now says never to describe it: the repo is **public** (`gh repo view` → `PUBLIC`).

**Files:** `lib/auth/config.ts`, `docs/08-SECURITY.md`, `docs/10-MEMORY.md` (commit `1e73789`, pushed); `docs/10-MEMORY.md` again and `WORKLOG.md` in the `/cerrar` pass (not committed yet).

**Verified:**
- Headless Chromium at 1440 × 900 against `https://araucaria-multiespacio.vercel.app/admin/login`: the new password → `/admin` (screenshot: Inicio with "Reservas en septiembre 1", "Días libres en septiembre 5"); then "Cerrar sesión" → back at `/admin/login`, so the test session is revoked. That login left one `login_ok` audit row and one successful `login_attempts` row in production.
- **Not verified:** that the old password is refused (not tried, to keep failures out of the rate-limit counters); Mateo logging in on his own phone.

**Resolved on the way:** Node's `process.loadEnvFile` does **not** override a variable already set in the environment (tested: an env var set before wins over the file). So `$env:DATABASE_URL = …; npm run rotate-password` would target that database even though the script loads `.env.local`. Not used in the end.

**Gates:** typecheck ✓ · lint ✓ (`eslint . --max-warnings 0`, no output). Build not run (a one-constant change).

**Sigue:** Mateo decides whether to keep this password (see §1, Waiting on Mateo (c)) and names the next piece of work; `OQ-10` stays open.
