# 10 — Memory

> Every decision, open question and gotcha of Araucaria, with its reason. Append-only: a changed decision is a new dated entry, never an edit.

## Decisions

### D-001 · 2026-09-16 · Phase 1 is the event salon only
**Decision:** a one-page landing for the SUM with an inquiry form that opens WhatsApp, plus an owner panel to cross out booked modules.
**Alternatives rejected:** full booking with Mercado Pago and automated WhatsApp now; one landing for all four spaces.
**Reasoning:** the client wants it fast; WABA approval alone takes 5–10 business days; the other spaces have different audiences and rental models.
**Reopen if:** phase 1 is live and working → phase 2 (Mateo, 2026-09-16).

### D-002 · 2026-09-16 · PRIMARY `A1` + SECONDARY `A5`
**Decision:** public static-marketing landing; the owner panel is a minimal internal tool in the same app.
**Alternatives rejected:** `A3 LEADGEN-TX` (the public stores nothing); `A5` as primary (the public page is the product).
**Reasoning:** the public submits nothing that persists; only the owner logs in. Security tier becomes `S1` + `S2` for the panel.
**Reopen if:** any public write is added (stored inquiries, online booking) → `A3`.

### D-003 · 2026-09-16 · Availability unit is `(date, module)`
**Decision:** rows `(date, 'mediodia' | 'noche')` with `unique (date, module)`. "Día completo" = both rows. The night module belongs to its start date.
**Alternatives rejected:** free time ranges with an `EXCLUDE` constraint; a separate "día completo" row.
**Reasoning:** the client sells three fixed modules (client's WhatsApp reply). Mateo: *"hay que respetar la función del multiespacio"*. Midnight becomes a display concern; uniqueness is one constraint.
**Reopen if:** the client starts selling other durations.

### D-004 · 2026-09-16 · Inquiry handoff through a `wa.me` link, nothing stored
**Decision:** the form builds the message in `05-API-CONTRACTS.md` §3 and opens `wa.me`. The number comes from `NEXT_PUBLIC_WHATSAPP_NUMBER`; testing uses Mateo's `5493425162081`.
**Alternatives rejected:** WhatsApp Cloud API (outbound templates, WABA); storing inquiries in the DB first.
**Reasoning:** the flow is inbound-only. A deep link needs no approval, no cost and no data retention.
**Reopen if:** phase 2 needs confirmations or reminders sent by the system.

### D-005 · 2026-09-16 · Hosting on Vercel Hobby
**Decision:** free plan, `*.vercel.app` link in the Instagram bio.
**Alternatives rejected:** Vercel Pro (monthly cost now); Cloudflare (Next.js adapter maturity unverified).
**Reasoning:** zero cost and zero friction for a fast phase 1. **Known risk:** Hobby's terms restrict use to non-commercial, personal projects and this is a client site. Accepted consciously; written in the proposal.
**Reopen if:** the domain is bought (phase 2) → Pro, quoted then.

### D-006 · 2026-09-16 · Database: Neon Postgres Free + Drizzle
**Alternatives rejected:** Supabase (vetoed by Mateo: free projects pause after inactivity); no database.
**Reasoning:** constraints enforce the availability invariant; same stack as Sanalys.
**Reopen if:** free-tier limits are reached.

### D-007 · 2026-09-16 · One shared admin password — deviation from `S2-01` and `S2-06`
**Decision:** a single `admin` account for the salon, protected by one generated passphrase and the controls C-01…C-15 of `08-SECURITY.md`.
**Alternatives rejected:** Auth.js with Google sign-in for allowlisted emails (recommended); Clerk Free; one password per person (recommended over a shared one).
**Reasoning:** Mateo's choice. His instruction was to apply `/seguridad` so the option is built securely, not to veto it. What a provider would add and this design lacks: MFA and email reset. Compensated by a generated passphrase, scrypt, per-IP and global limits, server-side sessions, one-step revocation and an audit trail.
**Reopen if:** phase 2 adds money or online booking; more than two people need access; one person must be revoked alone; any panel incident.

### D-008 · 2026-09-16 · Session lifetime 30 days
**Decision:** absolute 30 days.
**Alternatives rejected:** 7 days (recommended); 1 day.
**Reasoning:** Mateo's choice, for the owner's convenience on the phone. Compensated by a visible "Cerrar sesión" and by rotation killing every session.
**Reopen if:** a lost or shared phone incident.

### D-009 · 2026-09-16 · Prices and salon texts are content constants in the repo
**Decision:** `content/salon.ts`, edited by Mateo; a change is a deploy.
**Alternatives rejected:** editable from the panel.
**Reasoning:** prices change rarely; a CMS surface adds security scope for no current need.
**Reopen if:** the client asks for text or price changes more than about once a month.

### D-010 · 2026-09-16 · Design on the running site with `seccion-premium`; no visual mockups
**Decision:** every public section is designed through `/diseno` → `seccion-premium`, on the running app. The block order in `06-UI-UX.md` §2 is the structure. The client approves the visual design (`GATE V`) on the preview URL of the complete landing.
**Alternatives rejected:** structural mockups (`SM-1`) and a visual mockup before code.
**Reasoning:** Mateo's method for every project from 2026-09-16, proven on Sanalys. A one-page landing is small enough that the structure is visible in the built page.
**Reopen if:** the client needs to approve structure before any build.

### D-011 · 2026-09-16 · Address is Güemes 3660
**Decision:** show Güemes 3660.
**Alternatives rejected:** 3650 (Instagram screenshots).
**Reasoning:** the client's own WhatsApp reply says 3660; Mateo confirmed.
**Reopen if:** the client corrects it.

### D-012 · 2026-09-16 · No proposal, prices or timelines — the build starts directly
**Decision:** no `PROPOSAL-v1.md` and no `GATE P`. Prices, payment plans, hours estimates and dates are not part of this project's documentation. The build starts at WU-01.
**Alternatives rejected:** a one-page proposal accepted by WhatsApp (the workspace default for small projects).
**Reasoning:** Mateo's decision: *"haremos directo, no hablamos de precios ni de tiempos"*. This supersedes the phrase "written in the proposal" in `D-005`: the Vercel Hobby terms risk is recorded here and accepted by Mateo, not written into any client document.
**Reopen if:** Mateo asks for a proposal or a timeline.

### D-013 · 2026-09-16 · TypeScript pinned at 6.0.3, not 7.0.2 — closes `OQ-05`
**Decision:** `typescript` 6.0.3. Node.js stays on 24 (`engines.node: "24.x"`; 24.21.0 locally).
**Alternatives rejected:** `typescript` 7.0.2 as planned; running TS 7 for `tsc` side by side with the TS 6 API for `typescript-eslint` (an extra aliased dependency for no gain in phase 1).
**Reasoning:** verified in WU-01 on Node 24.21.0. With 7.0.2, `next build` and `tsc --noEmit` pass and do catch a deliberate type error, but `npm run lint` crashes: `typescript-eslint` 8.70.0, pulled in by `eslint-config-next` 16.3.5, throws "typescript-eslint does not support TS 7.0" (peer `>=4.8.4 <6.1.0`). Lint is a blocking CI gate. 6.0.3 is the newest release inside that range; with it `npm ci`, `build`, `typecheck` and `lint` pass. Node 24.x is offered by Vercel (its Node.js versions docs use `"24.x"` as the `engines` example); the first deploy log is the final confirmation. Mateo pre-approved the fallback in the WU-01 plan.
**Reopen if:** `typescript-eslint` supports TypeScript 7.

### D-014 · 2026-09-16 · Region: São Paulo for Vercel functions and Neon
**Decision:** Vercel function region `gru1`; Neon project in `aws-sa-east-1`.
**Alternatives rejected:** the defaults, `iad1` + `aws-us-east-1` (US East).
**Reasoning:** visitors and the owner are in Santa Fe; São Paulo is the closest region both providers offer (verified in the Neon account's region list), and the database sits next to the functions. Mateo: "sí".
**Reopen if:** the Vercel Hobby plan does not allow choosing `gru1` → both go to US East before the Neon project is created (its region is permanent).

### D-015 · 2026-09-16 · Vercel project name `araucaria-multiespacio`
**Decision:** the public link is `araucaria-multiespacio.vercel.app`, matching the Instagram handle.
**Alternatives rejected:** `araucaria` (`araucaria.vercel.app` already answers HTTP 200, so it is taken).
**Reasoning:** the link goes in the Instagram bio until the domain is bought. Mateo: "sí".
**Reopen if:** the domain is bought (phase 2).

### D-016 · 2026-09-16 · Neon root branch keeps its default name `production`
**Decision:** the Neon project `araucaria` (Postgres 18, `aws-sa-east-1`) has the root branch `production` for production and the child branch `dev` for local development and Vercel previews.
**Alternatives rejected:** renaming the root branch to `main`, as `07-INFRASTRUCTURE.md` first said.
**Reasoning:** Neon now creates the root branch as `production`; the name has no effect on the app, which only reads `DATABASE_URL`. Also confirmed while setting up WU-01: the Vercel project reports Node.js Version `24.x`, the last open check of `D-013`.
**Reopen if:** —

### D-017 · 2026-09-17 · WU-03 auth build choices
**Decision:**
- Layout additions: `lib/action-result.ts` (the `ActionResult` / `ErrorCode` types) and `app/admin/login/login-form.tsx` (the client form next to its page).
- WU-03 ships functional, undesigned `/admin/login` and `/admin` screens so the login is testable end to end; WU-04 completes them. The `/admin/*` headers (`noindex`, `no-store`) also ship in WU-03 instead of WU-09.
- The C-09 time trap starts when the form becomes usable in the browser (`useEffect`), because React's purity lint rule forbids `Date.now()` during render.
- On a successful login the session, the attempt row and the `login_ok` audit row are written in one `db.batch` (one transaction on the HTTP driver), so the audit row always carries the session id; then the cookie and the purges.
- `scripts/rotate-password.ts` runs on Node 24 type stripping, with no new dependency (`allowImportingTsExtensions` in `tsconfig.json`).
- `server-only` 0.0.1 guards `lib/dal.ts`.
**Alternatives rejected:** login screen only in WU-04 (the login could not be tested end to end); server render time for the time trap (lint error); running the script through `tsx`, which is only a transitive dependency of `drizzle-kit`.
**Reasoning:** Mateo answered "sí" to the three WU-03 questions on 2026-09-17; the rest follows from verification in WU-03.
**Reopen if:** WU-04 needs the login form elsewhere.

### D-018 · 2026-09-17 · WU-04 owner panel choices
**Decision:**
- `blockModules` / `unblockModule` call `updateTag("availability")`, not `revalidateTag(tag, "max")`: the next visitor waits for fresh data instead of getting the stale calendar (G-003).
- The panel is built functional first (data, actions, dialogs, toasts, minimal styling); the visual design of `/admin/login` and `/admin` is a later `seccion-premium` round named by Mateo.
- The panel navigates from the current month to 12 months ahead, the same range where modules can be crossed out (C-08). An invalid or out-of-range `?mes=` falls back to the nearest valid month.
- Copy not in `06-UI-UX.md` §5, approved by Mateo: "Listo, Día completo del 18/10 tachado." and "Ese módulo ya estaba liberado." (NOT_FOUND). Gender follows the module: "Mediodía … tachado/liberado", "Noche … tachada/liberada".
- Tapping a day opens one dialog: choose what to cross out (only free options; "Día completo" only when both are free) and a "Liberar" button per crossed-out module, which asks "¿Liberar Noche del domingo 18/10?". One 44 px target per day instead of one per module.
- Weeks start on Monday (Intl `es-AR` weekInfo `firstDay` = 1).
**Alternatives rejected:** `revalidateTag` with the `max` profile (serves stale availability); separate tap targets per module in the grid (under 44 px at 360 px width).
**Reasoning:** Mateo answered "sí" to the three WU-04 questions on 2026-09-17; the rest follows from G-003, C-08 and `06-UI-UX.md` §8.
**Reopen if:** the design round changes the interaction.

### D-019 · 2026-09-17 · Owner panel design: "Mitades" + undo instead of confirmation
**Decision:** the owner calendar shows each day split in two (top half = Mediodía, bottom half = Noche; beige free, teal crossed out). Tapping a day opens a bottom sheet on the phone (a side panel on desktop) with two large toggles; each tap saves at once and offers "Deshacer" for 6 s. A "Próximos tachados" list under the month frees a module without searching for its day. `blockModules` returns the new ids so undo is immediate. Colors are provisional (`{{CONFIRMAR}}` until the logo, CR-03). This supersedes the confirmation dialogs of `06-UI-UX.md` §5 and the one-dialog interaction of `D-018`.
**Sources:** `seccion-premium` round. References: Bookingmood availability calendar (split day), Airbnb host calendar (bottom sheet), Cal.com date overrides (list of blocked dates). Three variants were built on `/admin/prototipo` and tried by Mateo on the preview.
**Mateo's words:** on the functional panel, "no me resulta una experiencia de usuario fácil y amigable" (answer "4 todo": state unreadable, too many steps, looks bad). On the winner: "1, mitades · está bien así me gusta". Undo instead of confirmation: "sí".
**Rejected (do not retry):** the functional panel with "M"/"N" letters under each number and a dialog with radio buttons; variant **Diagonal** (triangles, Bookingmood literal); variant **Barras** (two small bars under the number); date-range forms in modals (Hospitable, Hostfully); generic date pickers (React Aria, Mobiscroll); multi-day selection (the salon rents by day).
**Reopen if:** the owner finds it slow or confusing on the phone; the logo brings final colors (tokens change, not the design).

### D-020 · 2026-09-17 · Confirmation alert (Apple style, GSAP) and "Reservado" vocabulary
**Decision:** after reserving or freeing a module the day sheet closes and a centered card appears over the dimmed calendar: a teal ring and check drawn with GSAP DrawSVG (a red cross on errors), title "Reservado" / "Liberado" / "Deshecho", detail "Sábado 19/09 · Mediodía", buttons "Deshacer" and "Listo". It closes by itself after 4 s (paused while the pointer or keyboard focus is on it) and Escape closes it. Timeline: overlay 0.3 s; card 0.94 → 1 in 0.45 s `power3.out`; ring 0.55 s `power2.inOut` from 0.1 s; check 0.35 s from 0.55 s; text 0.35 s with 0.06 s stagger from 0.45 s. No overshoot. Reduced motion: a 0.2 s fade, no scale, no drawing. The panel says "Reservado" instead of "Tachado" everywhere (toggles, legend, "Próximos reservados", messages), and dates show two digits ("19/09"). This replaces the bottom undo bar of `D-019`. New dependency `@gsap/react` 2.1.2; plugins registered in `lib/gsap.ts`.
**Sources:** `seccion-premium` round. Reference chosen: Apple Human Interface Guidelines · Alerts (centered card). The drawn ring-then-check order comes from Mateo's brief ("con la animación del tilde con gsap profesional").
**Mateo's words:** "ejemplo tocás un día, tachás mediodía y salta la alerta sábado Reservado Mediodía 19/09 ejemplo con la animación del tilde con gsap profesional" · "quiero que sea una exp de usuario muy amigable, profesional y seria" · chose "la de apple, la 1". The three plan questions ("Reservado", close the sheet, auto-close 4 s) went with the recommended "sí" under his "go".
**Rejected (do not retry):** the bottom "Listo, … · Deshacer" bar; overshoot/bounce entrances (CodeFronts "Success Checkmark Pop"); confetti success modals; filled green circle checks; Lottie success animations (another library).
**Reopen if:** the owner finds the alert slows down reserving several days in a row.

### D-021 · 2026-09-17 · Cache Components for the public availability read
**Decision:** `cacheComponents: true` in `next.config.ts`. `getAvailability(today)` is a `use cache` function tagged `availability` with the `hours` profile (revalidate 1 h, expire 1 day); the owner's actions call `updateTag`, so a change is visible on the next request, and the profile is only the ceiling if a row is ever edited outside the app. A failed read returns `null` instead of throwing, and the page renders with the "no pudimos cargar la disponibilidad" notice. `/admin` and `/admin/login` now read the session inside `<Suspense>`, so their shell is prerendered and the data streams. The public day states and module enablement live in `components/calendar/month.ts`.
**Alternatives rejected:** `unstable_cache` (replaced in Next 16); no cache at all (Neon Free sleeps when idle, so the first visit after a quiet spell would wait for the database to wake up).
**Found while verifying:** with the login form reset that React does after a failed attempt, the hidden `renderedAt` field (set on the DOM by an effect, `D-017`) came back empty, so **every attempt after the first failed as `INVALID_INPUT` without ever checking the password or counting toward the rate limit** — the owner had to reload the page to log in. Now the server passes `renderedAt` as a prop (possible because the login is dynamic) and the input is controlled. Verified in a real browser: a wrong password answers "Contraseña incorrecta." and the sixth attempt from one IP is refused.
**Reopen if:** the public page needs fresher data than the panel's own invalidation provides.

### D-022 · 2026-09-17 · Media encoding values, replacing the reference command
**Decision:** `scripts/build-media.sh` is the pipeline, and its values are the measured ones: hero 720×1280 CRF 30 (10 s), gallery tiles 480×848 CRF 28 (≤ 8 s), stills and posters JPEG `-q:v 4`, hero poster also AVIF CRF 34, `-map_metadata -1` on everything. Total committed: 6.64 MB of the 25 MB budget.
**Alternatives rejected:** the reference command in `07-INFRASTRUCTURE.md` (1080, CRF 26), measured at 14.6 MB per 8 s — 78 MB for the hero alone; 1080 at CRF 32 (5.9 MB per 8 s) still costs 3× the chosen recipe for a video that plays behind text; 540 px reads soft on a phone.
**Also decided here:** the hero is 7–17 s of the walkthrough (covered gallery → grill → pool → patio), not the whole clip; the night video is not published, because guests' faces are recognisable in it; five stills come out of the 1080 walkthrough, and the two professional photos inside the "Salón usos múltiples" carousel are cropped in as well — they are a quarter of the resolution but better framed than any frame of the videos.
**Reopen if:** the originals arrive (`CR-01`, `CR-02`) — same script, new numbers — or a design round needs a longer hero.

### D-023 · 2026-09-21 · HERO: media que se abre, tomas en plano general y botón con canto
**Decision:** the `HERO` is `HERO.media-bg` and it starts **closed** —the whole screen is the brand's dark
blue— and opens as a **rectangle growing from the middle**: lying down on desktop, standing on the
phone (Mateo: "que se abra como un rectángulo desde el medio, vertical para mobile y acostado en
desktop"). Four panels slide out, one per side, and the window is what is left between them. All four
move **together** with the same curve, so the window keeps the screen's own proportion while it
grows: that is what makes it lying down on a desktop and standing on a phone, with a margin on all
four sides the whole way. 0.3 s hold, then 1.5 s `expo.inOut`. Only `transform` moves, on four flat elements: the video is never
scaled, counter-scaled or clipped. The text enters at 0.55 s, staggered 0.09 s. Behind the fixed headline the takes rotate every 8.25 s, and the new
take enters as a **curtain** (1.25 s, `expo.inOut`): it slides up over the previous one while its
own content slides the opposite way, so the image stays still and only the edge that uncovers it
moves. The outgoing take keeps playing until the curtain covers it. Mateo picked reference 1 (SHA, fixed headline + rotating takes) + 2 (Auberge,
availability always reachable) with the opening of reference 5 (Lanserhof), and "fondo" over "marco".
The button is reference 7 (hover.dev · Neu): it lifts and a solid edge grows, 0.85 s; translated to
the brand, the edge is beige on dark, never the original's black. The header button behaves the same.
**Also decided here:** the hero uses only the two stretches of the walkthrough filmed **wide**
(12–17 s and 1–5 s), both 720 px; the tiles are out of the hero because they are 480 px wide.
Typography: Instrument Serif for the headline (`next/font`), italic for the highlighted half.
**Rejected, not to be retried:** the crossfade between takes ("la transición está malísima, se ve
muy mal"): two different wide shots dissolved into each other read as a double exposure, and the
criterion already said it — nothing appears out of nowhere, it opens. Variant "Ficha" (the floating module card) and variant "Barra" (the
three modules pinned at the bottom); the untreated video as background; the tile of the pool as the
first take; and the hero taken from 7–17 s, which reads as a close-up once cropped to a wide screen
("hay todos videos muy muy cerca en desktop").
**Rejected before this, in order:** a frame that grew from a small vertical rectangle (it started
from something already visible instead of from closed, and counter-scaling the media made it look
enlarged and soft while it moved); two curtains opening on a single axis; and the same four panels moved with a
0.34 s offset between pairs, which opened a band from edge to edge instead of a rectangle. Mateo
settled it with a drawing: a small rectangle in the middle, margin on every side, growing.
**Smoothness, measured on the production build:** the opening runs at **60 fps**, median frame
16.7 ms, worst 16.8 ms, zero frames over 32 ms, on both 1440 and 390. The take change first
measured 50 fps with 30 dropped frames because both videos were playing at once; with only the
active one playing it is 59 fps and 2 slow frames.
**Measured, not guessed:** `expo.out` spends 90 % of the travel in the first 30 % of the time, so a
1.4 s move reads as a 0.4 s jolt with an invisible tail — "nada rápido de arranque" in the criterion.
With `power2.inOut` the same 1.4 s is still moving at 900 ms. The opening's first frame is set by a
script that runs before paint (`hero-apertura.tsx`), because doing it from React showed the image
full-screen first and then snapped back to the small frame.
**Two traps found building it:** the curtains were painted *behind* the video, because the take
layers use `z-index: 1/2` and their wrapper did not isolate them (`G-027`); and `page.screenshot`
waits for `document.fonts.ready`, so every timed frame came out late until the captures moved to
CDP (`G-028`).
**Reopen if:** the originals arrive (`CR-01`, `CR-02`) with wide material, which removes the whole
framing problem.

### D-024 · 2026-09-22 · The headline names the event, the subhead names the spaces — replaces the copy of `D-023`
**Decision:** the `HERO`'s `h1` is "Espacio versátil para cumpleaños, eventos infantiles, talleres y *celebraciones de todo tipo*" and the subhead is "Salón de usos múltiples con patio, pileta, parrilla y horno pizzero. Hasta 35 personas, en Güemes 3660, Santa Fe." Both are drawn from `docs/01-CONTEXT.md`: the uses from §Audience, the spaces and the capacity from §Amenities, the address from `D-011`.
**Alternatives rejected:** the previous copy, "Salón de eventos con *patio, pileta y parrilla*" over a subhead that listed the uses. Mateo: *"esta tinvetrido el titulo, la idea es atraer tood tipo de evento luego vas a contar los espacios que tiene"* — the page was selling the place before the event.
**Note:** Mateo's own list leaves out "reuniones", which `01-CONTEXT.md` does include among the uses. His wording was kept literally, and the gap was named to him; adding it is a one-word change.
**Side effect, measured:** the longer headline broke into five cramped lines against the left edge with half the screen empty, so `.hero-titulo` went from `max-width: 17ch` / `clamp(2.35rem, 6.2vw, 5.4rem)` to `26ch` / `clamp(1.95rem, 4.3vw, 4rem)` — three lines at 1440, 741×182 px.
**Reopen if:** the client gives its own claim, or "reuniones" has to appear in the headline.

### D-025 · 2026-09-22 · Gallery: a mix of the Apple Cards Carousel with the varied positions of the Layout Grid
**Decision:** after a `seccion-premium` round of 12 references, Mateo picked a **mix**: *"combinaria la 1 con las difentes posciones de la 4"* — reference 1, [Aceternity · Apple Cards Carousel](https://ui.aceternity.com/components/apple-cards-carousel) (a horizontal row of vertical cards, draggable, with the name of the space on top), with reference 4, [Aceternity · Layout Grid](https://ui.aceternity.com/components/layout-grid) (pieces of different sizes and positions, and tapping one opens it large). A mix goes to the prototype branch of the method: three variants built in the page behind the standard picker.
**Also decided, answering the plan's two questions:** **9 pieces** — the 6 gallery videos plus 3 photos — and the name of each space **always visible**, never only on hover, because on a phone there is no hover.
**Not authorised yet:** Mateo answered the questions and then wrote **"aun no go"**. No gallery file exists.
**Alternatives rejected, with their reason:** 2 · Focus Cards (the blur lives on hover, which does not exist on a phone) · 3 · Parallax Scroll (with 13 pieces it becomes an endless column on a phone) · 5 · Aman and 6 · Soho House (square cells: the vertical videos would have to be cropped in half) · 7 · Images Slider (one piece at a time is slow for six spaces). Discarded before presenting: the three GSAP gallery demos (`G-029`), Skiper UI (404), cult-ui's 3D Carousel (only documentation rendered), Magic UI's Marquee (its example is text testimonials) and Othership (no gallery, only a hero).
**Constraint that decided it:** the material is vertical — 6 videos at 480×848 and 5 photos at 1080×1920 — so only the references whose pieces are taller than wide use it without cropping. Measured on each reference: Apple Cards 0.60, Focus Cards 0.67, Parallax Scroll 0.79, Aman and Soho House 1.00, Images Slider 1.44, GSAP demos 1.77.
**Reopen if:** the originals arrive (`CR-01`, `CR-02`) with horizontal material, which would put the square-cell galleries back in play.

### D-026 · 2026-09-22 · The gallery is the walkthrough: variant C, split into four spaces
**Decision:** of the three variants built behind the picker, Mateo picked **C** — the section pins to the screen and the pieces run sideways as you scroll — and asked for it to be **split into chapters, one per space**, with GSAP presenting each one as the walkthrough reaches it: *"me gusta el de corre, pero me gustaria mas si lo dividmos mejor en secciones tipo patio, slon asi, y que luego cundo vaymos correindo vya haciendo una animacion degsap para ir mostrando los diofenrets espacio y mostrar esa exprecia inmersiva y fluida"*.
**Four spaces, not seven** (Mateo, same day): *"el jardin y el patio es lo mimso y tambien la parte de la pergola es dentro del patio, dejalo en salon, patio, parrilla, y pileta"*. The covered gallery, the pergola and the lawn are all **El patio**. The nine pieces split 2 · 4 · 1 · 2. The names of the pieces were rewritten to that vocabulary of four, so no caption contradicts its chapter.
**How it is built:** one tween moves the track, and everything else hangs off it through GSAP's `containerAnimation` — each piece rises as it crosses the right edge of the screen, each chapter's name and rule draw themselves as its cover arrives, and the covers lag 120 px behind their photos over the whole run. Four marks under the track say which space you are in, written straight into the DOM so lighting one does not re-render nine videos.
**Measured:** the run is 2898 px of scroll at 1440 and 2959 at 1920 — about three screens — with the section pinned at `top: 0` throughout and zero console errors. Below 900 px and under `prefers-reduced-motion` nothing pins: the chapters stack, each name becoming the heading of its group of photos, which is the shape variant C did not have on a phone.
**This is scroll hijacking, and it was chosen with the page in front of him.** It was flagged as the risky variant precisely because he rejected it in Sanalys; the difference is that the gesture is still scrolling down, the movement is proportional to it, and you can go back at any point.
**Alternatives rejected:** a fixed label in a corner that changes name instead of a cover travelling with the track — it says the same thing twice. Naming the third chapter "La parrilla y el horno": Mateo wrote "parrilla", so the horno pizzero is named in the section's subhead instead of the chapter title.
**Superseded from `D-025`:** the caption of each piece is no longer *below* it but *over* it, and in this variant the pieces do not write the space name at all — the chapter does. "Always visible" still holds: the name is on screen the whole time, in the cover and in the marks.
**Reopen if:** the split of the nine pieces across the four spaces turns out wrong once the originals arrive (`CR-01`, `CR-02`), or if the run proves too long on a real machine.

### D-027 · 2026-09-23 · The gallery is an ordered carousel of identical upright pieces — replaces `D-025` and `D-026`
**What was rejected, in his words:** after the three variants of `D-026` were built and shown, Mateo threw all of them out: *"re dseña las tre opcione s prique no me ha gustado ninguna, relamente no le encuntro la forma yt no me gusta el desorden ese genrado ya que todas son vertcales, busca inspiraciones nuevas de carosueles y haz tres opcines profesinales"*. The three shared one piece of DNA — pieces of different heights and offset positions — which came straight from the "varied positions" half of the Layout Grid in `D-025`. That is the thing that reads as disorder, and it is now forbidden.
**The rule that replaces it:** **every piece is identical.** Same size, same 9:16 shape (the shape of the material), same top edge, inside each variant. Measured on the built variants: one single size per variant — 324×576 in A, 263×468 in B, 344×612 in C, the nine of them. No piece crops the material.
**Second round of references, carousels only:** seven live sites were opened, scrolled until the carousel appeared and made to advance — [Nobu Barcelona](https://www.nobuhotels.com/barcelona/) 0.62 · [Ace Hotel](https://acehotel.com/new-orleans/) 0.73 · [Habitas Tulum](https://www.ourhabitas.com/tulum/) 0.78 · [The Hoxton Rome](https://thehoxton.com/rome/) 1.5 · [Faena Miami](https://www.faena.com/miami-beach) 1.52 · [Amangiri](https://www.aman.com/resorts/amangiri) 1.0 · [Mama Shelter](https://mamashelter.com/paris-east/) 1.24. Mateo picked: **"paradas, la 1 y la 3"** — upright pieces, Nobu plus Habitas.
**The number that decided "upright":** the material is 9:16 (480×848 the videos, 1080×1920 the photos), so a landscape frame throws away most of each take. Computed and shown to him: 0.62 loses 9 % of the height · 0.73 → 23 % · 0.78 → 28 % · 1.0 → 44 % · 1.24 → 55 % · 1.5–1.52 → **62 %**.
**The three variants that stand now**, all upright and all with pieces of one size, differing only in rhythm: **A · Fila** (Nobu — three cards in view and the fourth peeking, name over the photo, `01 — 09` counter and arrows) · **B · Calma** (Habitas — smaller pieces, five in view, no arrows or dots, a hairline showing the progress, name *below* the photo as a catalogue caption, centred heading) · **C · Una por vez** (the mix — two-column card: name in large type, counter, arrows and a strip of thumbnails on the left; the take on the right with the next one peeking, dimmed).
**Alternatives rejected in this round:** Embla, Swiper, Splide, Keen Slider, Motion Primitives and Aceternity's Carousel — all of them render documentation, not a finished design (`G-037`). Six Senses blocked the request, Casa Cook and Standard answered 404, Casa Bonay has no carousel. The landscape references (Hoxton, Faena, Amangiri, Mama Shelter) fell with "paradas".
**Also dropped from `D-026`:** the four chapters with their covers, the parallax and the pinned run. The four space names survive and are the vocabulary of the captions: El salón · El patio · La parrilla · La pileta.
**Reopen if:** the originals arrive (`CR-01`, `CR-02`) filmed wide, which puts the landscape references back in play with no crop.

### D-028 · 2026-09-23 · The gallery is a stack of cards, one per space, driven by the scroll — replaces the three variants of `D-027`
**What was rejected, in his words:** the three carousels of `D-027` (A · Fila, B · Calma, C · Una por vez), all of them: *"no me gusto ninguna opcion asi que quiero que redsieemos toda la galeria traeme nuevas animaciones seria"*. The round went back to references, this time searching for **the motion**, not for the shape of a carousel.
**Third round of references:** 25 opened with the rueda at 1440 and 375; 5 presented — [Olivier Larose · Cards Parallax](https://blog.olivierlarose.com/demos/cards-parallax) · [White Desert · "Our camps"](https://white-desert.com/) (Awwwards SOTD 2026-09-11) · [Codrops · SVG Mask Scroll Transitions](https://tympanus.net/Tutorials/SVGMaskScrollTransition/) · [Codrops · Sticky Grid Scroll](https://tympanus.net/Tutorials/StickyGridScroll/) · [Codrops · One Element Scroll](https://tympanus.net/Development/OneElementScroll/). Mateo: *"me encantaron mucho todas pero voy a quedar con la 1, porfavor quiero que sea con scroll animacion, gsap, lo mas fluido inmersivo y profesional posible"*. Plan answered *"1 - si 2 - vaya 3 - go"*: smooth scroll on the landing, and the line from `01-CONTEXT` on each card.
**How it is built:** the stack is plain CSS — four capas of `100svh`, each `position: sticky; top: 0`, siblings inside one parent, so every new card rises and stays over the previous one, and all four release together after a 30 svh tail. GSAP adds, all scrubbed with 1 s of smoothing: while a card rises its takes climb 16 % staggered and their image goes from 1.3× to 1×; when it reaches 40 % of the screen its number, name and line open from their masks (1.2 s `power3.out`, 0.1 s apart, not scrubbed); while the next ones cover it, it shrinks 3 % and darkens 14 % per card above (0.91 / 0.94 / 0.97 and 0.42 / 0.28 / 0.14 at the end). Each card sits 16 px lower than the previous one (10 px on phones), which is the edge that shows behind. Lenis on the landing only (`components/scroll-suave.tsx`): lerp 0.075 on the wheel, native touch, one clock (GSAP's ticker), not mounted under reduced motion; the viewer stops it while open.
**Cards:** El salón · El patio · La parrilla · La pileta, on azul hondo · beige vivo · azul · blanco roto (provisional tokens, `{{CONFIRMAR}}` until `CR-03`). Lines, verbatim rows of `01-CONTEXT` §Amenities: "Salón de usos múltiples, hasta 35 personas" · "Sillones y livings de exterior" · "Asador y horno pizzero grande" · "Patio exterior con pileta".
**The rule of `D-027` still holds and was measured:** one single take size per screen in the four cards — 261×464 at 1440, 316×561 at 1920, 155×276 at 1366×650, 150×267 at 375, 114×202 at 390×664, 108×191 at 360×640.
**Videos take turns (measured, not guessed):** only the card on top plays, and inside it **one video at a time** — when one ends it hands the turn to the next; the others wait on their frame. With the real GPU (RTX 4060) and the wheel through the whole stack, three videos at once gave 110 of 530 frames at 33 ms; one at a time gives 0 of 619, the same as the hero alone. The card scale, the image zoom and the rising takes cost nothing measurable — it was decoding several videos at once, the same thing `D-023` found in the hero.
**Alternatives rejected in this round:** Telescope Zoom, Infinite Scroll Gallery and the pixel-reveal gallery (pieces of different sizes and positions — the disorder of `D-027`); Horizontal Parallax (a horizontal carousel, rejected twice); Fullscreen Clip-path (ends in a horizontal row of ovals); 3D Stack Motion (a toy); Sticky Sections (made for text, and the same idea as the winner); Card Stack Effects (hover only) and Perspective Section Transition (a transition between sections, not a gallery); the scroll-scrubbed video (CodePen asks for a human check, which is not bypassed; the Webflow copy never showed its video); Units, KUBE, Palazzo Sogni and Vander (a promotion popup covers the page); Coquelicots (playful blob masks); Mont Rural and Tengile (still photos in rows); Studenterkilden (an event venue, but its gallery scatters pieces of different sizes); Tandjung Sari (its own scroll, could not be moved). Not reintroduced: horizontal carousels, pieces of different sizes, landscape crops.
**Copies:** the three rejected variants of `D-027` and the prototype route were deleted from the repo after being copied to the session scratchpad (`variantes-viejas/ronda-d027/`), like `TD-008`.
**Reopen if:** the originals arrive (`CR-01`, `CR-02`) with more or wider takes per space, or a real phone shows the stack or the turns stuttering.

### D-029 · 2026-09-23 · Inside each card, the takes are a full-size story, one at a time — corrects the composition of `D-028`
**What he corrected, in his words** (with two phone captures of El salón and La parrilla): *"no me gusto ya que hay muchos espacios libres tanto en mobile como desktop no termina siendo una carousel, creo que tambien me estas dando ejemplos de desktop y esto esta mas ligado a telefono [...] o hacer esto pero de una manera responsive que quede bien que se pueda ver todo como corresponde, no digo que el diseño sea feo me encanta pero no le encuentra la manera facil sencilla y linda de mostrar esto, necesito que sea algo claro que se vea bien y sea profesional pero la facilidad de la persona de conocer cada uno de los espacios y buscar esa atraccion"*. The cause, measured: every take had the same size in the four cards, so a card with one take (La parrilla) used 13 % of its area. The stack, its motion and its colours are approved and stay.
**Decision, answering the plan with "1 - forma 2 - solas 3 - go":** each card shows its space's takes **one at a time at full size**, in the shape of Instagram stories — where most of the audience comes from. On the phone the take fills the card's width (311×553 at 375, 70 % of the card); on the desktop it fills the card's height on the right (386×687 at 1440, 475×844 at 1920) with the name at 144 / 172 px on the left. What is left of the card is the same take blurred under 55 % of the card's colour: the light of the place, not an empty field. Tap right → next, left → previous; bars on top, one per take; arrows and a counter on the desktop; a small button opens the viewer.
**Advances on its own ("solas"):** a video when it ends, a photo after 6 s. It stops when the card is not on top, off screen, with the mouse over it, with the viewer open and under reduced motion. Still one video at a time (`G-041`): measured with the real GPU, 0 of 599 frames over 33 ms, and 2 of 663 with the CPU throttled ×4.
**Change of take:** the new one enters as a curtain over the previous one, 0.9 s `power3.inOut` — the window rises while the image inside moves down the same amount, so the image stands still and the edge travels; the one leaving drifts 12 % up. Transforms only. Same gesture as the hero's takes; no crossfade.
**Measured at the six sizes:** one single frame size per screen in the four cards (262×466 at 1366×650, 238×424 at 390×664, 226×402 at 360×640), zero console errors, zero horizontal overflow. 13 of 13 interaction checks after correcting two faulty ones.
**Rejected here, not to be retried:** takes of one fixed size scattered inside a large card (the empty space); designing the gallery desktop-first.
**Copies:** `pieza.tsx` (replaced by `historia.tsx`; the `Pieza` type moved to `contenido.ts`) and the `D-028` versions of `tarjeta.tsx`, `galeria.tsx` and `galeria.css` are in the session scratchpad, `variantes-viejas/ronda-d028/`.
**Reopen if:** the originals arrive (`CR-01`, `CR-02`) filmed wide, or a real phone shows the taps, the curtain or the auto-advance misbehaving.

### D-030 · 2026-09-23 · On the desktop the four spaces sit side by side — the stack stays for the phone
**What he corrected, in his words:** *"no me gusta el de desktop que al ser en vertical haya tantos espacios no me cierra"*. A single vertical take inside a landscape card always leaves most of it empty — 26 % of the card at 1440 — and no tuning fixes the geometry. The phone was not questioned and did not change.
**Decision, answering "1 - solos 2 - go":** from 1000 px wide the gallery is **a row of four stories, one per space, all the same size, edge to edge**, with the section's title above — the whole section fits one screen. Measured: 319×567 at 1440×900 (row from y=279 to y=846), 416×740 at 1920×1080, 225×400 at 1366×650, 243×432 at 1100×800. Below 1000 px it is still the stack of `D-028`/`D-029` (checked at 999). Same markup for both; the stylesheet lays it out. Number, name and line sit over the bottom of each take on a gradient, always visible.
**Turns ("solos"):** one video at a time across the row. Each space plays its take and, when it ends, advances its own story and hands the turn to the next space, left to right: El salón 6 s (photo) → El patio 8 s → La parrilla 8 s → La pileta 2.2 s → again, measured second by second. The space under the mouse takes the turn and keeps it until the mouse leaves. Click right/left on a take moves it; the viewer stops the row.
**Motion:** as the row arrives the four rise 18 % and open from the bottom (clip-path), staggered 0.08 and scrubbed from the row's top at 95 % of the screen to 60 %; their images go from 1.3× to 1×. It finishes at 60 % on purpose: finishing at 35 %, anyone who stopped scrolling half-way saw the columns at different heights — the disorder rejected in `D-027`. The names open (1.2 s) when the row's bottom edge enters the screen; with "bottom 92 %" they never opened in the resting position at 1440×900.
**Measured:** 10 of 10 interaction checks; with the real GPU, 0 of 433 frames over 33 ms through the arrival, and 0 of 431 with the CPU ×4; zero console errors and zero overflow at every width.
**Removed:** the desktop arrows and counter beside the text (the row has no text column; clicks go on the take).
**Reopen if:** more spaces are added (five or more columns get narrow), or the originals arrive filmed wide.

### D-031 · 2026-09-23 · On the phone the takes follow the finger
**What he asked, in his words** (approving `D-030` and the commit `3a0989f`): *"en mobile me gustaria que vos tengas para deslizar con el dedo entre el carosuel de las imagenes y no esperar"*. Plan answered *"go"*.
**Decision:** on the phone (the stack, below 1000 px) the take follows the finger. Dragging left, the next take enters from the right edge as the same curtain, but in the hand — the window follows the finger and the image inside stays still; dragging right brings back the previous one. On release it completes if it travelled more than 25 % of the width, or if the last 80 ms of the gesture went faster than 0.4 px/ms (a flick); otherwise it goes back. Completing or going back takes 0.45 s scaled by what is left, `power3.out`. The vertical gesture stays with the page (`touch-action: pan-y` on the frame, native touch scroll — Lenis does not smooth touch). While the finger is on it the auto-advance waits, and it resumes on its own ("solas" still holds). A drag never counts as a tap. On the phone taps and the auto-advance also change takes sideways, in the same direction as the finger; the desktop row keeps the vertical curtain approved in `D-030` and has no drag (clicks).
**Measured with real touch events (CDP `Input.dispatchTouchEvent`) at 375:** 9 of 9 — 40 % to the left passes, 10 % slowly returns with nothing left peeking, 40 % to the right goes back, a 21 % flick passes by speed alone, a vertical gesture scrolls the page 285 px without changing the take, the tap still works, 0 of 346 frames over 33 ms during four drags with the real GPU, one video at most, no console errors or warnings. The desktop row still passes its 10 checks.
**Trap found testing it:** synthetic touch events over CDP arrive 30–50 ms apart, so a "fast" scripted flick actually moved at 0.24 px/ms — slower than a real finger. The velocity is measured on the last 80 ms of the gesture, not from the first touch, which also counted the pause before moving.
**Reopen if:** a real phone shows the drag fighting the page scroll, or the thresholds feel wrong in the hand.


## Open questions

| ID | Question | Why it matters | Default until answered |
|---|---|---|---|
| OQ-01 | **`D-MEASURE`**: which number proves the site works, where it fires, what records it (in whose account), who reads it and when | Without it nobody can say whether phase 2 is justified | Proposal: "consultas enviadas por WhatsApp por semana", counted when the handoff status panel is shown. Tool and reader undecided. Set before launch (WU-09) |
| OQ-02 | The client contact's name, and the person who will hold the admin password | Ledger owner; password handover | `CI-02` |
| OQ-03 | Whether and when hosting and database move to client-owned accounts | `S1-15`: the client should own its accounts | Phase 2, with the domain |
| OQ-04 | Error tracking (e.g. a free Sentry plan) in phase 1 or not | Vercel logs last 1 hour | Not in phase 1 |
| OQ-05 | Vercel runtime support for Node 24 and Next 16.3 support for TypeScript 7 | Pinned versions in `02-STACK.md` | Verified in WU-01 |
| OQ-06 | Whether the public calendar borrows the panel's "Mitades" cell and its "Reservado" vocabulary, or gets its own visual language | `06-UI-UX.md` §3 and the WU-08 design round | Decided in the `seccion-premium` round Mateo names for the public calendar |
| OQ-07 | On a 1920 screen the panel sits in a centred 1152 px column, with wide margins. Mateo's general criterion for the public site is "usá el ancho" | Panel layout on his own screen | Stays centred until he says otherwise (asked 2026-09-17, unanswered) |
| OQ-08 | Whether `.claude/launch.json` belongs in the repo. It is the config that starts the dev server for the design rounds; it has stayed untracked through four commits because Mateo has not said | Anyone picking up the project cannot start the preview with one command | Stays untracked and gets named in every handoff |
| OQ-09 | In variant B the captions read *El salón · El salón · El patio · El patio · El patio · El patio · La parrilla · La pileta · La pileta*. Four "El patio" in a row is faithful to the four-space split but it shows | Whether the gallery stays at nine pieces | Stays at nine; the clean fix is dropping one of the four patio pieces and going to eight (raised 2026-09-23, unanswered) |

## Gotchas

| ID | Gotcha |
|---|---|
| G-001 | The iPhone video is **HEVC**, which does not play in every browser. Every published video is transcoded to H.264 (`07-INFRASTRUCTURE.md`) |
| G-002 | In-memory rate limiting does nothing on Vercel: each invocation starts from zero. Counters live in Neon |
| G-003 | A stale public calendar is worse than no calendar: it tells people a taken date is free. The owner's discipline (`CI-03`) is part of the system |
| G-004 | Vercel Hobby keeps runtime logs for 1 hour. Anything needed later goes to `admin_audit` |
| G-005 | Node's `crypto.scrypt` defaults `maxmem` to 32 MiB; N = 2^17 with r = 8 needs ~128 MiB. Set `maxmem` explicitly or hashing throws |
| G-006 | The Neon HTTP driver has no interactive transactions. "Día completo" is one multi-row `INSERT`, which is atomic on its own |
| G-007 | `wa.me` numbers are digits only: Argentina mobile = `54` + `9` + area code without `0` + number without `15` |
| G-008 | `SameSite=Strict`: opening `/admin` from a link in another app (e.g. WhatsApp) sends no cookie on that first navigation, so the owner sees the login once. Bookmark the panel; a reload keeps the session |
| G-009 | Server Action IDs change between deploys (and at least every 14 days). An open panel tab can fail with "Failed to find Server Action"; `error.tsx` treats it as retryable |
| G-010 | "Today" must be computed in `America/Argentina/Buenos_Aires`. A UTC "today" is already tomorrow after 21:00 in Santa Fe |
| G-011 | `next dev` (16.3) appends a managed `<!-- BEGIN:nextjs-agent-rules -->` block to the repo's `CLAUDE.md`, and re-adds it on every run if removed (seen in WU-01). It is controlled by `agentRules` in `next.config.ts` (default `true`). Do not commit that block by accident |
| G-012 | npm 11.19 warns that `esbuild` (×3, via `drizzle-kit`) and `unrs-resolver` (via `eslint-config-next`) have install scripts "not yet covered by allowScripts". Verified in WU-01: build, lint and `drizzle-kit` work without approving them. Do not approve them blindly |
| G-013 | `cookies().delete()` sends no `Secure`, and browsers ignore any `Set-Cookie` for a `__Host-` cookie without it, so the session cookie would survive logout. Clear it with `set(name, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })` |
| G-014 | Next's Server Action origin check (C-07), verified in WU-03: a POST whose `Origin` differs from the host is aborted ("Invalid Server Actions request", HTTP 500, the action does not run). A POST with **no** `Origin` only logs a warning and runs. Browsers always send `Origin` on form POSTs, so that is not a CSRF path, and `SameSite=Strict` is the second layer. Test scripts must send a matching `Origin` |
| G-015 | On Mateo's Windows (`core.autocrlf=true`) git checks migrations out with CRLF, so `drizzle.__drizzle_migrations.hash` for `0000_init` differs between `dev` (applied from LF, 2026-09-16) and `production` (applied from CRLF, 2026-09-17). The SQL is identical and drizzle picks pending migrations by `created_at`, so nothing re-runs. Production got `0000_init` on 2026-09-17 after the backup branch `backup-pre-0000-init` |
| G-016 | The date examples in `05-API-CONTRACTS.md` §3 and `06-UI-UX.md` §5 ("sábado 18 de octubre de 2026", "sábado 18/10") use a wrong weekday: 18/10/2026 is a **domingo**. The code formats the real weekday with `Intl`; do not copy the example as a test expectation |
| G-017 | A Server Action only executes on routes whose page imports it. Posting its id elsewhere (`/`, `/admin/login`, a 404) returns `{}` and runs nothing (verified in WU-04). The owner actions run only on `/admin`, behind `proxy.ts` and `requireAdmin()` |
| G-018 | `Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" })` still prints the month without a leading zero ("21/9"). `formatDayMonth` builds "21/09" from the ISO string instead |
| G-019 | The React Compiler lint rules (`react-hooks/refs`, `react-hooks/purity`) reject `contextSafe(fn)` called during render when `fn` reads refs, and `Date.now()` in functions defined in the component body. Wrap with `contextSafe` inside the handler; derive ids from state |
| G-020 | Since Cache Components (`D-021`), `/admin` with an **invalid** cookie answers **HTTP 200** instead of 307: the prerendered shell (title, "Cerrar sesión", "Cargando el calendario…") is sent first and the redirect to `/admin/login?sesion=terminada` travels in the streamed part. Checked on production 2026-09-17: the body carries no calendar data and no blocks, and the response still has `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`. A test that asserts 307 for an invalid cookie must assert the streamed redirect instead; with **no** cookie `proxy.ts` still answers 307 |
| G-021 | The 6 WhatsApp videos are coded 848×480 with **90° rotation metadata**, so they display vertical (480×848). ffmpeg applies the rotation before the filter chain, so `scale=480:-2` sets the *displayed* width; the `scale=-2:480` of the old reference command would have produced 272×480 |
| G-022 | `IMG_9789.MOV` is usable only between 0 and 17 s: after that it shows a corridor, a dated kitchen and a bathroom, and it ends on a **CapCut watermark** (~42 s). The filmer's shadow is visible on the floor in several frames — unavoidable with this temporary material (`CR-02`) |
| G-023 | iPhone `.MOV` files embed GPS coordinates and timestamps. Every output of `build-media.sh` carries `-map_metadata -1`; a published file must never ship the client's location metadata |

| G-024 | A **vertical** video cropped to a wide screen turns any close shot into a blurry close-up, and no `object-position` fixes it: only material filmed wide survives the crop. On a phone the same file shows its whole frame and the setting does nothing, because the crop happens horizontally |
| G-025 | A solid-edge button (the "Neu" hover) has to contrast with the **background**, not with the button: the dark-blue edge was invisible over the hero. On dark backgrounds the edge goes light (`.boton-en-oscuro`) |
| G-026 | With Cache Components, reading `searchParams` in a page breaks the prerender ("uncached or runtime data") unless the part that reads it lives inside `<Suspense>`, exactly like the admin pages (`D-021`) |

| G-027 | Layers with their own `z-index` inside a wrapper that has `z-index: auto` join the PARENT stacking context, so they compete with siblings of that parent: the hero's curtains sat behind the video until the wrapper got `isolation: isolate` |
| G-028 | Playwright's `page.screenshot` waits for `document.fonts.ready`, so a frame asked for at 200 ms can be taken hundreds of ms later. Timed frames of an entrance must be captured with `Page.captureScreenshot` over CDP, or the timing being measured is fiction |
| G-029 | The URLs of the GSAP demo hub (`demos.gsap.com/demo/<name>`) render the hub's own listing, not the demo, so an automated capture shows a grid of cards and never the effect. Any GSAP demo has to be opened by hand, or its iframe source pulled out, before it can be called a reference |
| G-030 | Aiming a hover or a click at the `<img>` proves nothing when the effect lives on its container: three interaction tests came back identical before and after. Aim at the wrapper — on Focus Cards the blur appeared on the first try afterwards |
| G-031 | With the desktop app's Browser pane **hidden**, `requestAnimationFrame` stops, so a GSAP tween freezes mid-way and the screenshot shows a half-finished state while the DOM already reports the final value. Three "entrances are broken" reports were that and nothing else. Every motion measurement goes through the project's own chromium headless shell, never the app's pane (it also compounds `G-028`) |
| G-032 | A `<video>` carrying its own `z-index` inside the piece paints above the click layer and eats the click: the viewer never opened, and the focus landed on the `video` element. The video already covers the poster by document order, so it needs no `z-index`; with `pointer-events: none` on both media the click reaches the button |
| G-033 | Next 16 streams the contents of a `<Suspense>` into a `<div hidden>` at the end of `<body>` first, and only then moves it into place. Measuring geometry before that returns **0×0 for the whole subtree** with `display: block` and `opacity: 1`, which reads exactly like a broken layout. Wait for the section to have a real height before measuring |
| G-034 | Closing a `<dialog>` by comparing `e.target === dialog` never fires when a child covers the dialog edge to edge — that is the normal case for a full-screen viewer. Ask instead whether the click landed outside the real content: `!target.closest(".contenido, .mandos")` |
| G-035 | Two grid traps, both found the same day: a percentage in `grid-auto-rows` resolves against nothing when the height is indefinite, so the square lattice has to be computed from an explicit width variable; and a `1fr` column takes the **min-content** of its contents, which for a carousel rail is all nine pieces — the phone went wider than the screen until it became `minmax(0, 1fr)` |
| G-036 | `rm -f a*.png` inside the captures folder deleted two whole reference series (`ace-*`, `amangiri-*`) that had cost minutes of browsing. Temporary files written next to material get a prefix of their own (`tmp-`), and the glob names it |
| G-037 | The documentation pages of the carousel libraries (Embla, Swiper, Splide, Keen Slider, Motion Primitives, Aceternity) render **docs** — install commands, prop tables, numbered boxes — not the component. As a design reference they are worthless; a live site has to be opened and scrolled until the carousel appears |
| G-038 | The prototype picker listens for the arrow keys on `document`, so it stole the keyboard from a variant that moves its carousel with them: the variant's `preventDefault()` does not stop a listener further up. It now bails on `e.defaultPrevented`, which is general and needs no list of exceptions |
| G-039 | A ScrollTrigger hung off `containerAnimation` with `start: "left right"` gives the **first** element a progress that is already spent, because it is born inside the screen and never crosses the right edge: the first chapter cover started shifted and ate its own first letter. A parallax that has to start at zero hangs off the whole run, not off each element's crossing |
| G-040 | A card with a top margin inside a sticky capa that has no padding, border or own formatting context: the margin **collapses through** the capa, and every card ends up stuck at the same height with no edge showing behind. `display: flow-root` on the capa keeps the margin inside |
| G-041 | Several `<video>` decoding at once is what drops frames, not the transforms around them. Measured with the real GPU on the gallery stack: three at once, 110 of 530 frames at 33 ms; one at a time, 0 of 619. Removing the card scale, the image zoom or the rising takes changed nothing. The rule for this site: one video playing at a time per section, the rest waiting on their frame |
| G-042 | The project's chromium headless shell renders with SwiftShader (software) by default, which inflates every frame-time number. With `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist --enable-gpu-rasterization` it uses the machine's real GPU (reported renderer: NVIDIA RTX 4060, D3D11). Frame timings are taken with those flags; CDP `Emulation.setCPUThrottlingRate` 4 approximates a mid-range phone |
| G-043 | A mask (`overflow: hidden`) that reserves more height than its text — here two lines for a one-line caption — lets the text stay visible after sliding "out" by 110 % of its own height. The reserved height goes on the text, never on the mask. And a mask with bottom padding for descenders needs more than 110 %: the name kept 5 px in view until it moved 125 % |
| G-044 | `getBoundingClientRect().top + scrollY` of a sticky element reports where it is **stuck**, not where it sits in the flow: two tests scrolled "to the second card" and did not move at all. Natural positions are measured on load, before anything sticks |

## Technical debt taken on purpose

| ID | Debt | Why it was taken | When it is paid |
|---|---|---|---|
| TD-001 | `eslint` is pinned at 9.39.5, which npm marks as no longer supported | ESLint 10 is outside the peer range of `eslint-plugin-import` and `eslint-plugin-react` inside `eslint-config-next` 16.3.5 | When `eslint-config-next` supports ESLint 10 |
| TD-002 | `npm audit` reports 4 moderate findings, all the esbuild `serve` advisory (GHSA-67mh-4wv8-2f99) reached through `drizzle-kit`'s `@esbuild-kit/*` loader | Dev-only CLI, never deployed, and its config loader does not start esbuild's dev server. The only offered fix downgrades `drizzle-kit` to 0.18.1 | When `drizzle-kit` drops `@esbuild-kit` |
| TD-003 | There is no test runner in the repo. Everything built in WU-01…WU-05 was verified with one-off Node and Playwright scripts that live in the session scratchpad, not in git, so a later chat cannot re-run them | Speed during the first units; the scripts needed the real dev database and a running server | Before launch, or the first time a regression is missed. The checks worth keeping: the 44 action checks, the login limits, and the availability cache |
| TD-004 | `typescript` stays on 6.0.3 while 7.x is released (`D-013`) | `typescript-eslint` refuses to load with TS 7, and lint blocks CI | When `typescript-eslint` supports TypeScript 7 |
| TD-005 | The panel's teal/beige tokens in `app/admin/admin.css` are provisional and were not taken from the brand | The original logo has not arrived (`CR-03`), and colours must not be picked from screenshots | When the logo arrives: swap the token values, no layout change |
| TD-006 | After logging in, the panel always lands on `/admin`, even when the visitor asked for another admin URL (Mateo hit this opening `/admin/prototipo` and landing on `/admin`) | Keeping the login action to the exact order of `08-SECURITY.md` §5 during WU-03 | If the owner ever needs deep links into the panel |
| TD-007 | The hero video is 720 px wide, so on a 1920 screen it is enlarged 2.7×. The treatment (the brand tint plus the gradients) disguises it, and on a phone there is no enlargement at all | 1080 at CRF 26 measured 14.6 MB per 8 s, against a 25 MB budget for all media (`D-022`), and the source itself is only 1080 wide | When `CR-02` arrives with real footage, or if the budget moves to object storage |
| TD-008 | The two superseded gallery variants (`galeria-mosaico.tsx`, `galeria-corre.tsx`, the pinned walkthrough of `D-026`) were never committed and now live only in this session's scratchpad at `…/scratchpad/variantes-viejas/`. A temp cleanup loses them | They broke `typecheck` once the picker stopped importing them, and deleting without a copy is not reversible | If Mateo asks for either back, or when the gallery is finally merged and the folder can be dropped for good |

## Dependencies reviewed

| Package | Why | Verdict |
|---|---|---|
| `next` 16.3.5 | Framework (`02-STACK.md`) | Approved with the stack. No `npm audit` finding |
| `react` · `react-dom` 19.3.0 | Required by Next 16 | Approved with the stack |
| `typescript` 6.0.3 | Types; 7.0.2 breaks lint (`D-013`) | Approved in the WU-01 plan as the fallback. Dev-only |
| `tailwindcss` · `@tailwindcss/postcss` 4.3.3 | Styling | Approved with the stack. Dev-only |
| `gsap` 3.15.0 | Motion | Approved with the stack |
| `lenis` 1.3.26 | Smooth scroll | Approved with the stack |
| `zod` 4.6.5 | Validation | Approved with the stack |
| `@neondatabase/serverless` 1.1.0 | Neon HTTP driver | Approved with the stack |
| `drizzle-orm` 0.45.2 | ORM | Approved with the stack |
| `drizzle-kit` 0.31.10 | Migrations CLI | Approved with the stack. Dev-only. `npm audit`: 4 moderate findings, all the same advisory (GHSA-67mh-4wv8-2f99, the `serve` dev server of esbuild ≤ 0.24.2) through its `@esbuild-kit/*` loader. Not reachable: the CLI is never deployed and its config loader does not start esbuild's dev server. The only offered fix downgrades `drizzle-kit` to 0.18.1 → not applied; re-check when `drizzle-kit` drops `@esbuild-kit` |
| `eslint` 9.39.5 | `npm run lint` (Next 16 has no `next lint`) | Approved by Mateo, 2026-09-16. Dev-only. npm marks 9.x as unsupported; 10.x is outside the peer range of the plugins inside `eslint-config-next` |
| `eslint-config-next` 16.3.5 | Next's rules: core-web-vitals, TypeScript, jsx-a11y | Approved by Mateo, 2026-09-16. Dev-only. Pulls in `typescript-eslint` 8.70.0 (TypeScript ≤ 6.0) |
| `@types/node` 24.13.5 · `@types/react` · `@types/react-dom` 19.3.0 | Type definitions for Node 24 and React 19 | Approved by Mateo, 2026-09-16. Types only, no runtime code |
| `server-only` 0.0.1 | Build fails if browser code imports `lib/dal.ts` (recommended by Next's auth guide) | Approved by Mateo, 2026-09-17. Official React package (maintainer sebmarkbage), no dependencies, no install script |
| `@gsap/react` 2.1.2 | `useGSAP`: GSAP inside React with scoping and cleanup (`D-020`) | Approved by Mateo with the alert plan, 2026-09-17. Published by GreenSock, no dependencies, no install script; peers `gsap ^3.12.5`, `react >=17` |
