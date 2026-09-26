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

### D-032 · 2026-09-23 · The panel uses the full width of the screen — closes `OQ-07`
**What he asked, in his words** (asked whether the panel should fill a large screen): *"si"*.
**Decision:** `/admin` drops the centred `max-w-6xl` column (1152 px); the page keeps its side padding (16 px, 40 px from `lg`). The month grid keeps its `1fr` column and the list keeps its 22 rem aside, so on a 1920 screen the grid grows to about 1440 px and each day cell gets wider; its height stays capped at 5.5 rem (`app/admin/admin.css`).
**Not verified by me:** the panel needs the dev passphrase, which only Mateo holds, so this change was not looked at on a running screen.
**Reopen if:** the wide cells read worse than the centred column on his screen.

### D-033 · 2026-09-23 · Public calendar: "La foto se cambia" + "Sello con luces" — closes `OQ-06`
**Sources:** `seccion-premium` round for the calendar. First round, 15 calendars checked, 6 sent: Cal.com booking page, Resy · Carbone, CodeFronts · Fluid Split-Screen, CodeFronts · Kinetic Typography, CodeFronts · Horizontal Scroll / Timeline, CodeFronts · CSS Grid Calendar Layout. Mateo: *"1 con la 3"* (Cal.com structure + Split-Screen photo). Three prototypes on `/prototipo-calendario` (Tres columnas · Foto de fondo · La foto se cambia); he picked *"la de foto se cambia"*, but *"el diseño de tacha una parte hace que no se entienda que está reservado… no me gustó nada"*. A second round of state references (Airbnb, Tock, Cal.com, Resy, CodeFronts dots) got *"no me convencen… no encuentro ese diseño donde diga wow"*. Three animated prototypes of the state (Luces · Sello · La foto responde); he chose a mix: *"la de sello con los colores de luces ya que se llega a identificar bien cuáles son los disponibles aún"*, then *"si queda así"*, plan answered *"go"*.
**Decision:** the calendar is its own section after the gallery (`id="disponibilidad"`, the hero CTA's anchor), dark blue against the gallery's beige. Two halves: the photo of the place with the month name large (a different photo per month, 1.2 s fade while it scales 1.08 → 1), and the month grid. Picking a day slides a curtain over the photo (1.1 s `power3.inOut`, the gallery's story curtain) with the date large and the three modules with hours and price (`content/modulos.ts`); taken ones are crossed out and say "Reservado"/"Reservada"/"No disponible". Day states: **free** = the cell lit in warm beige; **one module left** = half light and "solo noche"/"solo mediodía" under the number (two lines on the phone); **taken** = dark cell with a RESERVADO stamp across it; past and beyond the horizon = faint numbers. The legend shows the three. **Motion:** the entrance fires when the section reaches 70 % of the screen (ScrollTrigger, once), not on load: title and numbers rise from their mask (0.9 s `power3.out`, 12 ms between days), the days light up one after another (0.7 s each, 28 ms apart, from 0.3 s), and the stamps drop (scale 1.9 → 1 in 0.42 s `power4.in`, from 0.55 s). The same plays on every month change. Everything waits hidden from before the first paint (script in `app/page.tsx`, like the gallery). Reduced motion: everything shown at once. The public calendar has its own visual language; from the panel it keeps only the word "Reservado" (`D-020`) — this closes `OQ-06`.
**Not in production until the form exists:** "Seguir con mis datos" leads to the inquiry form (block 6), which is not built. Mateo: *"si"* to keeping the calendar local until then, so the public site never shows a dead button.
**Rejected (do not retry):** a day split in two with the taken half hatched (the panel's "Mitades" idea on the public side); the calendar as three columns (photo · month · day); the photo filling the section behind a light card; static state markers taken literally from booking sites (grey struck numbers, filled vs plain cells, circles, dots under the number).
**Not chosen, may come back:** "La foto responde" (the photo changes with the day under the pointer); it has no equivalent on the phone and needs night photos.
**Traps found:** GSAP reads a CSS `translateX(-101%)` as `x` in px and keeps it under `xPercent` — every tween on something pre-positioned by CSS carries `x: 0`/`y: 0` (same family as the gallery's name, `G-040`…`G-043`). In development React mounts twice; a ref that remembers "this photo is already shown" survives the first unmount's revert and left the photo invisible — gate on the element's real opacity, not on a ref. `gsap.fromTo` on an empty selector or array logs a warning: months without taken days have no stamps, so the stamp tweens are skipped when there are none.
**Measured (local, real dev database, which has no taken days ahead):** 1440, 1920 and 1366 × 650 fit in one screen; 375, 390 × 664 and 360 × 640 scroll below the grid for the modules; zero overflow, zero console errors or warnings; before arrival the numbers sit 25–30 px down in their mask and the lights are at 0, after arrival at 0 and 1; reloading while parked on the section shows nothing early. The stamps and half light were checked with sample data on the prototype, with these same components. `npm run build`: `/` is a partial prerender.
**Reopen if:** a real phone shows the stamp unreadable at ~40 px cells, or the form needs the selection shown differently.

### D-034 · 2026-09-23 · Inquiry form: "Sigue en la cortina", animated fields, +54 phone and a people counter
**Sources:** `seccion-premium` round for the form (block 6). Three rounds of references were rejected whole: Codrops/CodeFronts/Dennis Snellenberg forms (*"la verdad muy feos y malos los diseños… quiero componentes con los campos que sean realmente inmersivos y creativos"*), award-winning studio contact pages (Vitra, Coeval, Co.Bo., Cocota — *"¿pero esto qué tiene que ver? te pedí formularios como estos"*, pointing to Uiverse, Justinmind, a Pinterest board and 21st.dev), and seven components from those galleries (*"sigue sin gustarme… no lo veo reflejado en este sistema"*). He then brought Uiverse · Novaxlo · yellow-fly-74 (*"me gustó mucho, ponela como ejemplo también"*). Four prototypes on the real page under the calendar (Sigue en la cortina · Tarjeta con canto · El mensaje se escribe solo · Afiche); after *"vamos por buen camino… no me gustan los rellenos, le faltan animaciones… el campo número debería ser más fácil… dale ese toque realmente wow"* and the Afiche recoloured to the brand (*"seguís sin usar los colores de araucaria"*), he chose *"vamos por el de sigue la cortina"*, with a vote-style counter for people and a +54 phone. Plan answered *"si go"*.
**Decision:** the form lives inside the calendar panel. "Seguir con mis datos" runs the curtain again over the chosen day (1.1 s `power3.inOut`) and shows three steps — ¿Quién consulta? (nombre, apellido, teléfono) · Tu evento (tipo, "¿Qué evento es?" when "Otro", personas) · ¿Cómo pagarías? (pago + summary + "Enviar consulta por WhatsApp") — with the chosen date and module fixed on top and "Cambiar". Each step slides in (0.6 s) with its lines rising from their mask (0.07 s apart). **Fields:** the label sits inside, large, and rises and shrinks on focus (0.5 s) while the underline draws from the left (0.6 s); an error paints the line and shakes the field. **Choices** (tipo, pago): a light slides to the chosen option (0.55 s). **"Otro"** opens "¿Qué evento es?" (0.6 s) and the message says "Tipo de evento: Otro (Bautismo)". **People:** a card with the number (editable by hand), "personas" beside it, and round up/down buttons; the number rolls (0.45 s) and the tapped arrow nudges. **Phone:** a fixed "+54"; what autofill or pasting adds (+54, the mobile 9, a leading 0) is stripped; exactly 10 digits are required (an Argentine number without 0 or 15), replacing the 8–15 of `06-UI-UX.md` §4.1; a meter fills per digit ("7/10"), draws a check at 10 and turns red with "Sobran números: fijate de no poner el 15." above 10. **Chrome autofill** no longer paints the fields light blue (it hid the +54): kept transparent with the site's text colour. **Sent:** a circle and check draw (DrawSVG), then the handoff status of §4.3. The WhatsApp message changes in `05-API-CONTRACTS.md` §3 (+54 and "Otro (…)"); nothing is stored (`D-004`).
**Rejected (do not retry):** "Tarjeta con canto" (*"el que quiero que descartes por completo"*); the 35 lit seats for choosing people (replaced by the counter); the three reference rounds above; forms styled with the reference's own colours instead of the brand's.
**Not chosen, may come back:** "El mensaje se escribe solo" (a WhatsApp bubble typing the message live, flying off on send) and "Afiche" (Novaxlo's bars in brand colours).
**Traps found:** React reuses a DOM node across a ternary when both branches are the same element type in the same place — the bubble that GSAP had faded and moved became the "sent" panel, invisible; give each branch its own `key`. A component defined inside another component's render remounts on every keystroke and steals focus — define it outside. ScrollTrigger positions computed before the calendar above settled its height never fired for a section below; an IntersectionObserver did. `window.open(url, "_blank", "noopener")` returns null and Playwright's popup capture is unreliable — tests read the fallback link's `href` instead.
**Measured (local, real dev database):** the full flow at 1440 and 375 on `/` — errors on empty steps, the phone cases ("03425162081" and "+54 9 342 516-2081" → "3425162081" 10/10 ✓; "342155162081" → 12/10 in red), "Otro (Bautismo)", 35 people, send — opens `wa.me` with the number and the exact message; zero console errors; the calendar entrance unchanged. `npm run build` passes (`/` partial prerender). **Not verified:** Chrome autofill itself (cannot be triggered from a script) and a real phone.
**Reopen if:** the client wants landlines or foreign numbers (the 10-digit rule), or the three steps feel long on a real phone.

### D-035 · 2026-09-24 · On the phone, picking a day scrolls to the day panel

Mateo, looking at the calendar on a phone: *"cuando elegís un día deslice hacia abajo, no tenga que scrollear yo para tener que ir a rellenar la info; la idea es facilitar la carga de toda la info lo mayor posible"*. Plan answered *"go"*.

**Decision:** on narrow screens, where the day panel sits below the grid, tapping a day, and later "Seguir con mis datos", brings the panel to 16 px from the top of the screen (`components/calendario/calendario.tsx`). With a finger the browser's native smooth scroll is used, because Lenis runs with `syncTouch: false` and ignores `scrollTo` during a touch; with a mouse, `lenis.scrollTo` runs for 1.1 s. On the desktop the panel is beside the grid and nothing moves.

**Exception to a standing rule:** `seccion-premium` says the scroll never moves by itself. This movement is started by the person's own tap and was asked for by Mateo; it is the only exception. Snap, stops between sections and scroll-jacking stay forbidden.

### D-036 · 2026-09-24 · The page closes with "Dónde nos encontramos" + a floating footer card; no NAV, no pricing table

**Order of the public page.** Mateo: *"lo mejor es dejar hecha al completo la parte pública y luego terminamos el dashboard admin; los precios ya están; solo agregaría un 'dónde nos encontramos' junto con el CTA y el footer; las cosas que incluye el alquiler las incluiría dentro de la galería, debe ser resumido"*, then *"1 - el cierre 2 - sacarlo"*. So: `NAV` (block 1) is not built, and the hero keeps its top bar. `PRICING-TABLE` (block 5) is not built, because the prices live in the calendar's day panel. `FEATURE-GRID` (block 4) goes into the gallery as a summary, in a later round. Blocks 7 and 8 are one closing section.

**Round.** `seccion-premium`:
- **References.** First round: 17 sites checked, 5 sent (Codrops ScrollMap, Olivier Larose Sticky Footer, Dennis Snellenberg, Locomotive, Times Event). Mateo: *"1 con la 2"*.
- **Three prototypes on `/prototipo-cierre`**: A · the map is the lid · B · map first, then the footer · C · the map as a window. Mateo: *"me gustó el diseño de la B"*.
- **Map.** *"No me gusta la animación del mapa que recorra desde un lugar, porque todos vienen de otro sitio; tendría que verse bien las calles, lugares, tipo Google Maps"*. Then *"sacar y agregar lugares importantes, que la gente se ubique"*.
- **Footer.**
  - First footer rejected whole: *"no hiciste absolutamente nada en el footer, sigue todo igual, asqueroso… eso no son footer, horrible tanto en mobile como desktop"*.
  - A round of the 51 footers on 21st.dev (7 sent). Mateo picked *"la 2"* (21st · Hover Footer, mdafsarx), *"hacelo dinámico, más premium… combinalo"* with the contact links (21st · Social Links, serafimcloud).
  - Three footer prototypes (A · card that lights up · B · buttons with logo · C · floating card). Mateo: *"la C"*.
  - Corrections, all applied:
    - the card overlapped the map;
    - original logos (WhatsApp, Gmail, Google Maps, Instagram);
    - salon links in rows on the phone;
    - nothing lights up with the mouse;
    - the logo is the link, with no text beside it;
    - a single phone;
    - smaller logos (34 px);
    - a phone icon like WhatsApp's;
    - a better clock icon;
    - the whole ARAUCARIA in one colour.
  - Mateo: *"si pasalo"*.

**Decision.**
- **Location section** (`components/cierre/cierre.tsx`, `id="ubicacion"`): beige. On the left, the address in the title face with the Barrio line, the walk-in line from `01-CONTEXT.md` and two actions ("Cómo llegar" → Google Maps directions; "Consultar disponibilidad" → `#disponibilidad`).
- **The map** (`mapa.tsx`, data in `mapa-datos.ts`) is an SVG of Candioti Norte generated once from OpenStreetMap (ODbL, credited on the map). It shows:
  - streets with their names on them;
  - Laguna Setúbal (named only where it fits);
  - 9 landmarks: Estación Belgrano, Liceo Municipal, Plaza Pueyrredón, Museo MAC, Puente Colgante, Monumento Brigadier López, Club Regatas, Costanera, Plaza de las Banderas;
  - a drop marker on Güemes 3660 with its label above.
- **Map scale and entrance.** 0.5 px/m on the desktop, 0.62 on the phone. It enters at `top 70%`: it zooms 0.92 → 1 (2.4 s), names fade in at random, the marker drops (0.7 s) with one ripple.
- **Footer card.** A blue card that rises 140 → 0 px (1.3 s) and sits 36 px over the beige below the map; it tilts slightly with the mouse (≤ 4°). It has four columns (Araucaria · Contacto · Horarios · El salón), a © line, and ARAUCARIA as a large outline, the whole word in `--ar-beige-vivo`: the stroke draws (1.6 s), then a 14 % fill (0.9 s).
- **Everything waits hidden before paint** (`GUION_CIERRE` in `app/page.tsx`). With reduced motion, all is shown at once.

**Rejected (do not retry):**
- the walking route drawn from the station;
- the map as the page's lid (A) and the map in a window (C of the first round);
- the first footer (contacts in three columns with a lone giant "Araucaria" and dead space);
- a footer that only changes on hover;
- the light that follows the mouse (on the card and on the letters);
- text next to the contact logos;
- two phone buttons;
- the beige round phone icon and the flat clock;
- ARAUCARIA lit only where the light passes;
- the round of 44 generic 21st footers (SaaS link columns, newsletter boxes).

**Trap:** a constant exported from a `"use client"` module reaches a server component as a client reference, not as its value, so the pre-paint CSS lives as a literal in `app/page.tsx` (see `G-055`).

### D-037 · 2026-09-24 · "Lo que incluye el alquiler" is a short band of four numbered groups with bullets, after the gallery

**Round.** `seccion-premium`, block 4 (`D-036`: *"dentro de la galería, debe ser resumido"*). Mateo placed it as a band after the four spaces rather than inside each card (*"la b"*).
- **References.** uiverse.io first, as he asked: only pricing cards with ticks and loose icon grids, none of them this component, so nothing was sent from there (it also blocks headless browsers). 21st.dev: 22 checked, 7 sent. Mateo: *"la 1 o 2"* (21st · Hover Image Preview, avanishverma4 · 21st · Cinematic List, daiwiikharihar).
- **First prototype round** on `/prototipo-incluye`: A · Frase (a sentence whose words lift a photo card on hover) · B · Filas (rows that open with the photo) · C · Mezcla (rows with the card following the mouse). Rejected whole: *"quiero algo más sencillo, que sea fácil de ver, fácil de entender, pero profesional, serio y prolijo, y que siga con la estética de esto… hacelo vos… no me traigas cualquier pavada, necesito terminar con esto"*.
- **Second round**, everything visible and nothing on hover: A · Ficha (a big 35 and a spec sheet) · B · Columnas · C · Con foto (the salon photo with a two-column list). Mateo: *"me gustó el b pero me gustaría que tenga viñetas, algo más prolijo y lindo, siempre respetando el GSAP"*.

**Decision** (`components/incluye/incluye.tsx`, `id="incluye"`, between the gallery and the calendar):
- Same beige, blue and title face as the gallery.
- Head: the small label "Lo que incluye el alquiler", then two title-face lines: "Para hasta 35 personas." and, muted, "La limpieza del lugar está incluida."
- Four groups numbered 01–04, like the gallery's four cards: El salón · El patio · La parrilla · Para la mesa. Each has a hairline on top, its number, its name in the title face, and its items with a 6 px blue bullet.
- Four columns from 900 px; on the phone one group per row, number on the left.
- Every fact comes from `01-CONTEXT.md` §Amenities and the cleaning line from §Modules and prices.
- **Entrance**, once, at `top 75%`:
  - the hairlines draw left to right (0.9 s);
  - the lines rise from their masks (0.9 s, 0.045 s apart);
  - each bullet pops in with a small `back.out(2)` (0.5 s, 0.07 s apart), just before its line.
  - Nothing moves after that.
- Everything waits hidden before paint (`GUION_INCLUYE` in `app/page.tsx`). With reduced motion it is all shown at once.

**Rejected (do not retry):**
- a photo that appears only on hover (a sentence with preview cards, rows that open, a card following the mouse): information that needs the mouse is not "fácil de ver";
- the spec sheet with a giant 35;
- the salon photo beside a ten-item list;
- the 21st marquees and ribbons (pill marquee, infinite ribbon, marquee along an SVG path);
- the rolling-word text marquee;
- the SaaS feature grids and bentos.

**Trap met again:** `G-047`. The pre-paint `translateY(120%)` was read by GSAP as `y: 22px`, and the lines ended up hidden under their masks on the real page (the prototype had no pre-paint script, so it did not show there). Fixed with `y: 0` at both ends of the tween.

### D-038 · 2026-09-24 · Phone corrections: the day panel fills the screen, ARAUCARIA as CSS text, a slightly larger gallery take

Mateo looked at production on his iPhone and sent three screenshots: *"hay detalles que mejorar, más que nada en mobile"*.

1. *"Cuando toco un día el scroll me lleva, y si ves el formulario aparece cortado o corto, entonces te quita la experiencia; ver lo del mapa… hacelo que se vea completo ese form, si no se ve feo."*
   - **Measured** at 390 × 664 (an iPhone with Safari's bars): after the tap the panel sat 16 px from the top but was 460 px tall, so 188 px of the map showed below it. The form (484 px) did not fit and scrolled inside the panel.
   - **Fix** (`components/calendario/calendario.css`): below 1000 px, `.cal-panel` has `min-height: max(460px, calc(100svh - 32px))`, so the panel fills the screen (16 px above and below). The step button of each state (`.cal-telon .cal-seguir`, `.cal-continua .fo-c-botones`) goes to the bottom of the panel with `margin-top: auto`, near the thumb, like an app sheet.
   - **Result:** 632 px panel at 390 × 664 and 780 at 375 × 812; the form fits whole (no inner scroll). Desktop is untouched: from 1000 px the panel keeps `min-height: 0`.
2. *"El footer de mobile, el Araucaria abajo no se ve directamente."*
   - On his iPhone the ARAUCARIA outline at the bottom of the footer card was blank. It was an SVG `<text>` drawn with `stroke-dasharray` / `stroke-dashoffset`.
   - **Fix** (`components/cierre/cierre.tsx` `Contorno`, `cierre.css` `.pie-araucaria*`, `GUION_CIERRE` in `app/page.tsx`): the outline is now plain HTML text. Two stacked layers: the faint fill (`color-mix(… beige-vivo 14%, transparent)`) and the outline (`color: transparent; -webkit-text-stroke: max(1px, 0.18cqw)`).
   - **Sizing:** it keeps the old SVG's proportions, `font-size: 19.6cqw` of the card plus `scaleX(1.22)`, measured so the desktop card is the same height as before (233 px at 1440).
   - **Entrance:** the outline is uncovered left to right with `clip-path: inset(0 100% 0 0) → inset(0)` (1.6 s), then the fill fades in (0.9 s). The old one-letter-at-a-time drawing is gone.
   - A small bottom padding stops the letters' feet from being cut by the card's edge.
3. *"Las tarjetas de la galería, me gustaría que sean más grandes las imágenes y videos, ya que se ve muy chico; no tanto, un poco nomás, no rompamos la estética y el diseño."*
   - **Fix** (`components/galeria/galeria.css`, phone only; desktop overrides all of it):
     - `--margen` 4svh → 2.5svh;
     - `--apilado` 10 → 8 px;
     - `--relleno` 16 → 14 px;
     - the card's `gap` 14 → 10 px;
     - the name's minimum 2.2rem → 2rem.
   - **Result:** the take grew about 9 % at 390 × 664 (238 × 424 → 259 × 461). At 375 × 812 it is width-bound, so only 311 × 553 → 315 × 560. On desktop it stays 319 × 567.

**Not verified:** Mateo's real iPhone. WebKit on Windows (Playwright 1.56) rendered BOTH the old SVG and the new text, so the iPhone failure was never reproduced here; see `G-057`.

### D-039 · 2026-09-24 · On the phone the day panel stays in place while the form is filled in

Mateo, on his iPhone: *"mientras fui rellenando, no sé por qué el form no queda fijo y se hace como scroll para abajo, es raro, no queda fijo mientras voy pasando las secciones"*.

**Cause** (my own `D-038`): the form's "Siguiente" had been pushed to the bottom of the full-screen panel. With the iPhone keyboard open it sat under the keyboard, and Safari scrolled the page to show it. When the step changed, the focused field was removed, the keyboard closed, and the page stayed shifted.

**Decision:**
- **`calendario.css`:** only "Seguir con mis datos" (no keyboard there) stays at the bottom of the panel. In the form, the step button goes back right under the fields.
- **`calendario.tsx`:** `alPanel()` (the `D-035` scroll, now a `useCallback`) runs in two cases, and only when the panel sits below the grid:
  - on every step change, through the new optional prop `Formulario.alCambiarPaso`;
  - when the keyboard closes, detected as `visualViewport` growing by more than 120 px while the form is open.
- **Effect:** the panel goes back to 16 px from the top. Desktop is untouched: there the panel is beside the grid.

**Verified** at 390 × 664 in headless Chromium: with the page pushed away, "keyboard" closed → panel back at 16 px; "Siguiente" tapped → panel at 16 px on step 2; the step-2 button sits 497 px into a 632 px panel. **Not verified:** the real iOS keyboard (it cannot be emulated here).

### D-040 · 2026-09-25 · A custom fixed navbar (replaces the "sacarlo" of D-036); every section ends on the calendar

Mateo: *"además agregale el navbar todo personalizado, fijo con GSAP para ambos, ya que no lo tiene, y también quitá ese call to action rápido"*. From a `seccion-premium` round (18 navbars on 21st.dev plus two real sites; 6 sent) he picked **1: Dennis Snellenberg** (dennissnellenberg.com, with Olivier Larose's curved menu). On the CTA: *"todas las secciones deben ser call to action al calendario de reserva"*.

**Decision** (`components/nav/nav.tsx`, `nav.css`, mounted first in `app/page.tsx`):
- **Top bar** (not fixed, over the hero): logo + "Araucaria multiespacio" on the left; the links on the right from 900 px: El espacio `#espacio` · Qué incluye `#incluye` · Disponibilidad `#disponibilidad` · Dónde estamos `#ubicacion`. The underline draws on hover. The old provisional bar `components/hero/hero-nav.tsx` and its quick "Disponibilidad" button are deleted.
- **Round button** (fixed, top right, `--ar-azul`, 54–72 px, two lines that cross into an X).
  - Desktop: hidden until 160 px of scroll, then it grows with `back.out(1.8)` (0.55 s).
  - Phone: visible from the start. It hides upwards (`yPercent -170`) while scrolling down past 160 px and comes back on scrolling up, so it never covers "Cambiar" in the day panel (which the page parks 16 px from the top, `D-035`) or the gallery's expand button.
- **Panel** (`--ar-azul-hondo`, `min(480px, 100vw)`), from the right in 0.8 s `power3.inOut`.
  - An SVG edge on its left bulges out while it moves and settles flat (`M100 0 L100 1000 Q-100 500 100 0` → `Q100 500`, 0.9 s).
  - A veil darkens the page.
  - Items arrive 0.06 s apart: "Navegación", the four links in the title face (`clamp(2.4rem, 5.2vw, 3.4rem)`), "Consultar disponibilidad", and WhatsApp (only if `NEXT_PUBLIC_WHATSAPP_NUMBER` is set) and Instagram.
  - Lenis stops while it is open.
  - It closes with the X, the veil, Esc, or a link. A link closes it, then scrolls: `lenis.scrollTo` with a mouse, native `scrollIntoView` with a finger (`G-056`).
- **Every section leads to the calendar:** "Lo que incluye el alquiler" (`D-037`) gets a "Consultar disponibilidad" button under its four columns. The hero and the closing already had one, and the gallery flows into "Lo que incluye".

**Verified** (headless Chromium, 1440 × 900, 375 × 812, 1920 × 1080, 390 × 664):
- **Round button:** `scale(0)` at the top and `scale(1)` after scrolling on desktop. On the phone it is 70 px from the top at rest, hidden (−22) after scrolling down to the calendar and with the form open, and back (70) after scrolling up 150 px.
- **Panel:** 480 px on desktop, full width on the phone.
- **Link "Qué incluye":** closes the panel and lands `#incluye` at 0.
- 0 px overflow, 0 errors.

**Rejected in the round:** the SaaS bars (Login / Get Started); the glass and "tubelight" pills; the dashboard-style nav; menu-toggle icons without a navbar.

### D-041 · 2026-09-25 · The whole header is fixed and follows the page (replaces the round button of D-040)

Mateo, after trying `D-040` in production: *"el navbar funciona súper mal y solamente dejaste las tres líneas; no baja el header completo donde siga toda la web, lo mismo en desktop, malísimo, eso no es lo que pedí"*. Plan → *"1 - go 2 - b"* (b: the header hides only while the gallery passes, so the gallery cards keep their size).

**Decision** (`components/nav/nav.tsx`, `nav.css`):
- **Fixed header** (`.nav-barra`, `position: fixed`, `z-index: 70`) with logo + "Araucaria multiespacio" and, from 900 px, the four links.
  - One number, `--nav-p`, goes 0 → 1 (GSAP, 0.5 s `power3.out`) after 60 px of scroll. The CSS derives everything from it:
    - background: `color-mix(azul-hondo calc(p·92%), transparent)`;
    - blur up to 14 px;
    - shadow and bottom hairline;
    - padding: 24 → 12 px on desktop, 22 → 11 px on the phone;
    - logo: 52 → 44 px on desktop, 46 → 38 px on the phone.
  - Heights: 101 → 70 px on desktop and 91 → 67 on the phone (measured).
- **Entrance:** the header drops from `yPercent -110` (0.9 s) after load. `GUION_NAV` in `app/page.tsx` keeps it up before first paint.
- **During the gallery** (`#espacio`, `start "top 10%"`, `end "bottom 45%"`) it goes up (`yPercent -110`, 0.4 s) and comes back after (0.6 s).
- **Current section:** its link gets `aria-current="location"` and a beige-vivo underline (ScrollTriggers at 50 %).
- **Phone:** a 44 px round menu button inside the header. It opens the same right-hand panel with the curved edge as `D-040`; the panel starts under the header, the X stays in the header and the header stays solid while it is open. On desktop there is no menu button or panel.
- **Offsets:** `--alto-nav` in `app/globals.css` (66 px phone, 68 px desktop) plus `html { scroll-padding-top }`.
  - Links land their section just under the header (measured at 66 / 68 px).
  - The calendar's day panel now parks under the header with 12 px of air (`altoNav()` exported from `nav.tsx`; measured at 78 px on 390 × 664).
  - The panel measures `calc(100svh - var(--alto-nav) - 24px)`.

**Rejected (do not retry):** a navbar that is only a round floating button, with no header following the page (`D-040`); the header shrinking the gallery cards (Mateo chose b).

### D-042 · 2026-09-25 · The header is laid out like Sanalys's: logo, centred links and the button with its edge

Mateo sent four screenshots, two of Araucaria's `D-041` header and two of Sanalys's: *"en el header de desktop y de mobile quiero que quede como este ejemplo"*.

**Decision** (`components/nav/nav.tsx`, `nav.css`; the behaviour of `D-041` stays the same):
- `.nav-barra-cuerpo` is a three-column grid, `1fr auto 1fr`.
- **Desktop (from 1080 px, it was 900):** logo + name on the left, the four links centred, and on the right `.nav-cta`, the site button `boton boton-chico boton-en-oscuro` "Consultar disponibilidad", with its 4 px edge always showing, as in the example.
- **Phone and tablet (below 1080 px):** the isotype alone on the left (the name only from 560 px); the button centred, reading "Disponibilidad" below 560 px and "Consultar disponibilidad" above; on the right the menu as two 26 × 2 px lines with no circle.
- **Measured:** 70 px tall at 1440 and 1920, 67 px at 1024, 390 and 360; 0 px overflow; 0 errors.

### D-043 · 2026-09-25 · The /admin login is a split screen with the garden photo

**What he asked, in his words:** after a reference round made only of uiverse.io and 21st.dev items, he rejected all of it: *"no me gustó ninguna… jugás con eso como que aparecerán componentes retro, es todo lo contrario a eso… la idea era uno de los ejemplos, no que TODO lo hagas en base a eso"*. Then: *"por cuestiones de tiempo vamos con la 5, adaptala al diseño de Araucaria, sé profesional, no cometas errores"*. Reference 5: [21st · Bhomik · Sign In Page](https://21st.dev/@bhomikproductivitylab/components/sign-in-page) (photo on one side, form on the other).

**Decision** (`app/admin/login/page.tsx`, `login-escena.tsx`, `login-form.tsx`, `login.css`):
- **Layout.** Desktop (from 900 px): two columns, `minmax(0, 1.15fr) minmax(28rem, 0.85fr)`; the photo fills the left at full height with a clean cut, no gradient. Phone: the photo is a band on top, `38svh` (min 200 px), fading into the deep blue; the form sits right under it. Everything fits in one screen down to 360 × 640 (button bottom at 567 px).
- **Photo.** `public/media/fotos/jardin.jpg` (the garden with the araucaria), provisional like every photo until `CR-01`.
- **Panel.** Title "Panel de Araucaria" in Instrument Serif: 2.5rem phone, 3.5rem desktop, 4.5rem from 1600 px. Line "Entrá con la contraseña del salón." The name appears once: no logo in the panel (the badge is dark on the dark blue and repeats the name).
- **Field.** The public form's underlined field with the label that rises (`components/formulario`), plus a 44 px "Mostrar"/"Ocultar" button (a ≥ 20-character passphrase is typed on a phone). Button: the site's `.boton .boton-en-oscuro`, "Entrar" with an arrow; while waiting it reads "Entrando…" and is disabled.
- **Messages.** Unchanged copy (`§5`). The error carries a drawn "!" in a circle and the field's line turns red, so it is not only colour; the session-ended notice carries an "i". After any answer the cursor goes back to the field.
- **Motion (GSAP).** Entrance: a deep-blue curtain slides off the photo, 1.2 s `power3.inOut` (to the right on desktop, downwards on the phone), while the photo settles 1.12 → 1 in 2 s `power2.out`; the two title lines rise from their masks, 1 s `expo.out`, from 0.5 s with 0.08 s between them; the line under them at 0.7 s; the field at 0.85 s (its base line draws from the left, 1 s `expo.out`); the button at 1 s. Error: the field shakes once, 0.45 s, x 0 → −9 → 8 → −6 → 4 → −2 → 0 px, and the message enters in 0.32 s. `GUION_LOGIN` hides the pieces before first paint and removes itself after 3 s. Reduced motion: no curtain and no shake, everything visible at once.
- **Security unchanged.** `login-action.ts`, `lib/auth/*`, the honeypot, the time trap and the copy are untouched.

**Rejected (do not retry):** the whole first round (`seccion-premium`, 2026-09-25): 1 · uiverse andrew-demchenk0 card with a hard edge; 2 · uiverse 0xnihilism "Smooth Brutalist" input; 3 · uiverse 0xnihilism inverting input; 4 · uiverse Galahhad shaking input as a component; 6 · 21st LN letter-by-letter feedback. In his words, anything **retro or neubrutalist** is "todo lo contrario". Also: a reference round built only from uiverse and 21st (they are one source among all, with `/ui-ideas`, `/web-distintiva`, studios and real sites).

**Reopen if:** the logo (`CR-03`) or the original photos (`CR-01`) arrive: the tokens and the photo change, not the layout.

### D-044 · 2026-09-25 · The login form is in the static shell; the session check and the C-09 time arrive streamed (changes the wait of D-021 for this page)

**What he asked, in his words:** trying D-043 in production, *"demora MUCHÍSIMO en entrar o decir contraseña incorrecta"*. Measured: the free Neon compute scales to zero after 5 idle minutes and the page waited for `requireAdmin()` before showing the form, so a cold visit showed the form after **3.6 s** (warm: 0.3–0.5 s; a wrong password answers in about 0.75 s either way). Function (`gru1`) and database (`sa-east-1`) are both in São Paulo, so distance is not the cause. Options given: a · form at once, b · paid Neon plan, c · leave it. He answered *"a, go"*.

**Decision** (`app/admin/login/page.tsx`, `login-form.tsx`):
- `LoginForm` renders in the prerendered shell (checked: `.next/server/app/admin/login.html` has `id="password"` and no `renderedAt`).
- Two parts stream in their own `Suspense`: `Sesion` (`requireAdmin()` → `redirect("/admin")`, plus the "Tu sesión terminó" notice) and `MarcaDeTiempo` (`await connection()`, then the server time for C-09 as the hidden `renderedAt`). Opening the page still queries the session, which wakes the database while the owner types.
- "Entrar" stays disabled until the time mark has arrived (`Marca` tells the form through a context); without it the server would answer `INVALID_INPUT`.

**Security (checked with `/seguridad`):** `login-action.ts`, `lib/auth/*`, the honeypot and the limits are unchanged. C-09 still uses server time taken at request time, never at build time. C-05: the session check still runs on every request and redirects. G-017: the action is still imported by the page's tree. G-020: the redirect still travels in the streamed part.

**Also found (not a code bug):** the production branch had **no row in `admin_credential`**, so every password was rejected there. The owner's passphrase lives only in the `dev` branch (version 3, rotated 2026-09-23). Mateo loads it with `npm run rotate-password -- <env file with the production DATABASE_URL>`; target host `ep-green-butterfly-acy6w1j5.sa-east-1.aws.neon.tech`.

**Rejected:** none. b (paid Neon plan) stays open if the first submit after idle still feels slow.

### D-045 · 2026-09-25 · The owner panel redesigned whole: brand colours, summary on top, structure rules from CRITERIO-DISENO

**What he asked, in his words:** *"quiero que el próximo paso sea armar todo el dashboard completo, profesional, animado, con reglas de estructura y /diseno; hacela toda vos, sé crítico, revisá todo paso a paso, tomate el tiempo que sea necesario pero no vuelvas hasta que esté terminado al 100"*. Earlier: *"quiero que modifiquemos todo el dashboard admin porque no me gustó nada"*, with his `CRITERIO-DISENO.md` (in his Downloads folder) as the rules.

**Kept (already decided):**
- "Mitades" and one large toggle per module that saves at once (`D-019`).
- The Apple-style confirmation with the GSAP ring and tick, "Deshacer" and "Listo" (`D-020`, *"genial, está perfecto"*).
- The whole width of the screen (`D-032`).
- The month range and Monday weeks (`D-018`).
- No Server Action, query or security control changed.

**Decision** (`app/admin/page.tsx`, `app/admin/admin.css`, `components/calendar/admin-calendar.tsx`, `components/ui/bottom-sheet.tsx`):
- **Look.**
  - The deep blue and beige of the public site and the login (`D-043`), replacing the provisional teal-on-paper panel.
  - Surface levels instead of a colour per zone: `--pn-lienzo` 0.17 → `--pn-capa` 0.215 → `--pn-capa-2` 0.255 (OKLCH L, hue 236, chroma ≠ 0), with borders `--pn-borde` / `--pn-borde-2`.
  - One solid card per screen: the next reservation.
  - Instrument Serif for dates and figures; the system sans for everything else.
  - Fixed rem sizes; radii 8 / 12 / 16 px.
  - No gradients, glass, side stripes, or border plus diffuse shadow.
- **Bar.** "Araucaria · Panel" (the page's `h1`), "Ver el sitio" (icon only below 40rem) and "Cerrar sesión" (C-10).
- **First line answers on entry.** "Hoy es viernes 25 de septiembre", then three cards:
  - *Lo próximo reservado*: day, what, and "mañana" / "en N días"; "Nada" when empty.
  - *En {mes}*: modules reserved in the month on screen, and the whole free days left.
  - *Los próximos 7 días*: seven small split days. Tapping one opens it, also across the month change.
- **Month.**
  - Name in serif with the year; "Hoy" when away from the current month; arrows, disabled at the ends of the range.
  - Cells split in two. A reserved half fills beige with a 220 ms sweep and, from a 5.5rem-wide cell (container query), says "Mediodía" / "Noche", so state is not only colour.
  - Today has a light ring; the chosen day a beige one.
  - Past days lose the middle line, which read as crossing the number out.
  - On desktop the cell height is `clamp(3.25rem, (100dvh − 33rem) / 6, 6.5rem)`, so six weeks fit under the summary at 1440 × 900.
- **Day panel** (side on desktop, bottom sheet on the phone):
  - "Día elegido" and the long date.
  - Two toggles with the hours from `01-CONTEXT` ("10 a 17 h", "19 a 02 h"). The state is in words and in a drawing: an empty circle for "Libre", a tick for "Reservado".
  - "Reservar el día completo" with the site's `.boton` when both are free.
- **Próximos reservados.** Grouped by day (weekday + dd/mm in serif), with one "Liberar" per module and a full `aria-label`.
- **Motion.**
  - Entrance by CSS keyframes when the data arrives: 320 ms ease-out-quart, cards 60 ms apart, days 8 ms apart.
  - The nodes stay mounted, so `router.refresh()` never replays the entrance; a month change replays only the new days.
  - GSAP stays for the one big moment, the confirmation.
  - Reduced motion: no keyframes and no sweep.
  - Loading: a still skeleton in the same places.

**Verified** on the dev branch, with a test session created for this and revoked by the panel's own "Cerrar sesión":
- 1440 × 900, 1920 × 1080, 1366 × 650, 375 × 812 and 360 × 640: 0 overflow, 0 console errors.
- Reserve, "Deshacer", "Reservar el día completo", free from the sheet and from the list, month forward and "Hoy" back, reduced motion, logout.
- Every text pair ≥ 4.5:1; the lowest is the error red on the light alert card, 5.00.
- The dev data were left as they were.

**Rejected (do not retry):** the provisional light panel of WU-04 (*"no me gustó nada"*).

**Reopen if:** the logo (`CR-03`) brings final colours (token values only).

### D-046 · 2026-09-25 · The owner panel is a real dashboard: side menu, reservations with the client's name and phone (replaces D-045 and the "Mitades" of D-019)

**What he asked, in his words:** on `D-045` in production, *"no me gusta nada el diseño de reserva, súper difícil de entender, súper difícil de cancelar, súper desorganizado, no se entiende nada, no hay un navbar al costado, esto no es un dashboard; te dije que te tomes el tiempo que sea necesario, no que hagas cualquier cosa"*. Plan questions: *"1 - nombre y teléfono 2 - esas tres"* (Inicio, Reservas, Calendario). References round (7 panels, tested) → *"la 1 con la 3"*. Plan → *"1 - sí 2 - no 3 - go"*:
- he answered "sí" to clearing the name and phone 90 days after the date;
- he answered "no" to making the phone required.

**Sources:**
- [shadcnuikit · Hotel Management](https://shadcnuikit.com/dashboard/hotel) (reference 1): the structure.
- [Origin UI (Cal.com) · Event Calendar](https://full-calendar-steel.vercel.app/) (reference 3): the calendar, with each event written in its day and opened by a tap.

**Decision:**
- **Data** (migration `drizzle/0001_swift_grim_reaper.sql`, additive; applied to the dev branch on 2026-09-25):
  - a new table `reservations` (id, date, client name 1–80, optional phone `+54` + 10 digits, created_at);
  - `module_blocks.reservation_id`, with `on delete cascade`.
  - Creating a reservation is one batch: the reservation, its modules and the audit row. The unique `(date, module)` still decides conflicts.
  - Cancelling deletes the reservation and, with it, its modules.
  - Modules loaded before this have no reservation. They show "Sin datos del cliente" and are cancelled with `unblockModule`.
  - The purge after login clears the name and phone 90 days after the date (C-16).
  - The audit rows carry no name or phone.
- **Actions** (`app/admin/actions.ts`): `createReservation`, `cancelReservation`, `unblockModule` (legacy) and `takenModules`. Each has `requireAdmin()` first and then zod. `blockModules` is gone.
  - `logout` no longer redirects: the panel loads `/admin/login` as a full page, so the login's pre-paint script runs (it did not after a client navigation, which logged a React warning).
- **Routes:** `app/admin/(panel)/` with `layout.tsx` (the frame), `page.tsx` (Inicio), `reservas/` and `calendario/`. Each page runs `requireAdmin()` inside its own `Suspense`, behind a still skeleton. The login stays outside the group.
- **Frame** (`components/admin/panel-marco.tsx`):
  - **Desktop:** a 16rem side menu with "+ Nueva reserva", Inicio / Reservas / Calendario (the current one in `capa-2` with a beige icon), "Ver el sitio" and "Cerrar sesión" (C-10).
  - **Phone:** a top bar (brand, site, logout) and a bottom tab bar (Inicio, Reservas, Calendario, "+ Nueva").
  - Shared dialogs on a native `<dialog>` (`dialogo.tsx`): Nueva reserva, the detail, and the cancel question. Then the `D-020` alert with "Deshacer":
    - undoing a new reservation cancels it;
    - undoing a cancel creates it again with the same name and phone.
- **Sections** (`components/admin/secciones.tsx`), where everything is said in words ("Noche · Juan Pérez"), never a colour or half a square:
  - **Inicio:**
    - cards: "Próxima reserva" (the one solid card), reservations this month, whole free days left;
    - "Los próximos 7 días", where each day lists its reservations or "Libre · reservar";
    - "Próximas reservas" (5).
  - **Reservas:** Próximas / Pasadas tabs, a search by name or phone, and rows with date, client, module and hours, a WhatsApp phone and "Cancelar".
  - **Calendario:**
    - desktop: a month grid, each reservation a beige label in its day, and "+ Reservar" on a free day;
    - phone: an agenda of the month that starts today.
- **Nueva reserva** (`nueva-reserva.tsx`):
  - native date input;
  - module radio cards, where modules already taken that day (read with `takenModules`) are disabled and say "Ocupado";
  - name (required) and phone (optional, with a fixed +54);
  - errors under each field with a drawn "!".
- **Look** (`app/admin/admin.css`):
  - the tokens of `D-045`, plus `--pn-fondo` for the menu;
  - buttons: 10 px radius; primary solid beige; cancel outlined in the error colour; "Sí, cancelar" filled;
  - `:where()` for the button base, so each class keeps its own size;
  - entrance by CSS keyframes once, and dialogs 220 ms.

**Verified** on the dev branch with a test session, later revoked by the panel's own logout:
- Flows:
  - three reservations created (Noche with phone; Día completo without phone; Mediodía);
  - "Noche" of an already-booked day shown disabled;
  - three validation errors on an empty form;
  - search "ana" → 1 and "516" → 1;
  - cancel from the calendar detail with the question, then "Deshacer" brought it back;
  - the three cancelled from the phone list.
- Sizes: 1440 × 900, 1920 × 1080, 1366 × 650, 375 × 812 and 360 × 640, with 0 overflow and 0 console errors.
- The public calendar still loads.
- Contrast: every pair ≥ 4.5:1; the lowest is white on the "Sí, cancelar" red, 4.86.
- The dev branch ended with 0 reservations and its 3 original modules.
- **Not verified:** the production migration, and the real iPhone.

**Rejected (do not retry):**
- `D-045` whole: the split "Mitades" cells as the way to book, "Liberar" hidden in a list or in the same toggle, a dashboard with no side menu. In his words: *"súper difícil de entender, súper difícil de cancelar… no hay un navbar al costado, esto no es un dashboard"*.
- Also, from the reference round:
  - calendarcn (an hourly agenda);
  - ReUI (repeats 3, paid);
  - uiverse sidebars (toy-like or retro);
  - generic SaaS dashboards.

**Reopen if:** the owner needs more than one reservation per module (it cannot happen: the unique constraint), or wants to edit a reservation instead of cancelling and creating it again.

### D-047 · 2026-09-25 · "Nueva reserva" picks the date on a month calendar beside the day's modules

**What he asked, in his words:** trying `D-046` on the iPhone, *"no me gusta en la página de reserva cómo elegir la fecha, quiero que aparezca un calendario profesional para elegir; lo demás está bien"*. Round of 4 date pickers (Origin UI Appointment picker, shadcn/ui Calendar date picker, coss Calendar, Apple Calendar Picker) → *"la 1, go"*.

**Decision** (`components/admin/nueva-reserva.tsx`, `components/admin/dialogo.tsx` `amplio`, `app/admin/actions.ts` `takenInMonth`, `lib/dal.ts` `getTakenInMonth`, `app/admin/admin.css` `.pn-cal-mini*`):
- The native date input is gone. The dialog widens to 46rem.
- **Left: the month.**
  - Arrows are limited to the bookable range; today is ringed; the chosen day is beige.
  - A day with one module reserved carries a beige dot. A full day is struck out in the error red and cannot be chosen.
  - Past days are only dimmed. At first they were struck too, and read like "Completo".
  - Each day's `aria-label` says its state ("sábado 26, con un módulo reservado").
  - 44 px targets, also at 360 px.
- **Right: the chosen day.** Its long date and the three modules, with the taken ones disabled and saying "Ocupado".
- The month's taken modules come from `takenInMonth` (date and module only, after `requireAdmin()`); it replaces `takenModules`.
- The name and phone fields sit side by side from 40rem.
- A free day tapped in the Calendario opens the dialog with that day chosen.

**Verified** on the dev branch, with a test session revoked by the panel's own logout and the test reservations cancelled:
- 26/09 Noche and 27/09 Día completo reserved from the new calendar.
- Then: 26 had the dot and its Noche and Día completo were disabled; 27 was struck and disabled; past days were disabled.
- Month forward and back, with the back arrow disabled on the first month.
- The day comes chosen from the Calendario.
- At 375 and 360: 0 overflow and 44 px days. 0 console errors.
- Found and fixed: the hover style beat the chosen day's beige (dark text on dark while the pointer stayed on it).

**Rejected:** the native date input (*"no me gusta… cómo elegir la fecha"*); the Apple Calendar Picker (all red, with a time field this salon does not use).

## Open questions

| ID | Question | Why it matters | Default until answered |
|---|---|---|---|
| OQ-01 | **`D-MEASURE`**: which number proves the site works, where it fires, what records it (in whose account), who reads it and when | Without it nobody can say whether phase 2 is justified | Proposal: "consultas enviadas por WhatsApp por semana", counted when the handoff status panel is shown. Tool and reader undecided. Set before launch (WU-09) |
| OQ-02 | The client contact's name, and the person who will hold the admin password | Ledger owner; password handover | `CI-02` |
| OQ-03 | Whether and when hosting and database move to client-owned accounts | `S1-15`: the client should own its accounts | Phase 2, with the domain |
| OQ-04 | Error tracking (e.g. a free Sentry plan) in phase 1 or not | Vercel logs last 1 hour | Not in phase 1 |
| OQ-05 | Vercel runtime support for Node 24 and Next 16.3 support for TypeScript 7 | Pinned versions in `02-STACK.md` | Verified in WU-01 |
| OQ-06 | Whether the public calendar borrows the panel's "Mitades" cell and its "Reservado" vocabulary, or gets its own visual language | `06-UI-UX.md` §3 and the WU-08 design round | Decided in the `seccion-premium` round Mateo names for the public calendar. **Closed 2026-09-23 by `D-033`:** its own language (lights and stamps); only the word "Reservado" is shared |
| OQ-07 | On a 1920 screen the panel sits in a centred 1152 px column, with wide margins. Mateo's general criterion for the public site is "usá el ancho" | Panel layout on his own screen | Stays centred until he says otherwise (asked 2026-09-17, unanswered). **Closed 2026-09-23 by `D-032`:** full width |
| OQ-08 | Whether `.claude/launch.json` belongs in the repo. It is the config that starts the dev server for the design rounds; it has stayed untracked through four commits because Mateo has not said | Anyone picking up the project cannot start the preview with one command | Stays untracked and gets named in every handoff. **Closed 2026-09-23:** Mateo said *"si"*; `.claude/launch.json` is committed |
| OQ-09 | In variant B the captions read *El salón · El salón · El patio · El patio · El patio · El patio · La parrilla · La pileta · La pileta*. Four "El patio" in a row is faithful to the four-space split but it shows | Whether the gallery stays at nine pieces | Stays at nine; the clean fix is dropping one of the four patio pieces and going to eight (raised 2026-09-23, unanswered). **Closed 2026-09-23 by `D-028`:** variant B no longer exists; in the stories each space shows its own takes, so no caption repeats |

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
| G-045 | CodePen's `full` and `debug` views answer the headless shell with a Cloudflare human check, so a CodePen demo cannot be captured as a reference — and the check is not to be bypassed. Look for the same demo hosted elsewhere, or drop it with that reason |
| G-046 | Touch events sent over CDP (`Input.dispatchTouchEvent`) reach the page 30–50 ms apart, whatever the script waits: a scripted "fast flick" of 47 px moved at 0.24 px/ms, slower than a real finger. Test a flick with few, large moves and no waits between them, and measure a gesture's speed on its last ~80 ms, never from the first touch (that counts the pause before moving) |
| G-047 | GSAP reads an existing CSS `transform` (a `translateX(-101%)` in the stylesheet, or the `translateY(110%)` of a pre-paint script) as `x`/`y` in **px** and keeps it under `xPercent`/`yPercent`: the calendar's curtain never opened and hidden numbers stayed low. Every tween on something pre-positioned by CSS carries `x: 0` / `y: 0` explicitly |
| G-048 | In development React mounts twice; `useGSAP` reverts the first mount, but a `useRef` that remembered "this photo is already shown" survives, so the second run skipped the fade and the photo stayed invisible. Gate on the element's real state (`gsap.getProperty(el, "opacity")`), not on a ref |
| G-049 | `gsap.fromTo`/`set` on a selector or array that matches nothing logs "GSAP target not found" in the console: months without taken days have no stamps. Collect with `gsap.utils.toArray` and skip when empty |
| G-050 | A ternary whose two branches render the same element type in the same place makes React reuse the DOM node: the WhatsApp bubble that GSAP had faded and flown away became the "sent" panel, still invisible. Give each branch its own `key` |
| G-051 | A component declared inside another component's render is a new type on every render: its inputs remount and lose focus on each keystroke. Declare helper components at module level |
| G-052 | A ScrollTrigger created for a section below the calendar was positioned before the calendar finished measuring its height, so its start sat lower than the real section and never fired. For a one-shot "arrived on screen", an `IntersectionObserver` does not depend on precomputed positions |
| G-053 | `window.open(url, "_blank", "noopener")` returns `null` and Playwright's popup event is unreliable for it; the tests read the fallback link's `href` ("Si no se abrió WhatsApp, tocá acá"), which is the same URL |
| G-054 | Chrome's autofill paints filled inputs light blue with its own text colour, covering the design (it hid the fixed "+54"). Neutralise with `:-webkit-autofill` → `-webkit-text-fill-color` + a very long `background-color` transition, and `:autofill { background: transparent }`. It cannot be triggered from a script, so it is checked by eye |
| G-055 | A `.cie-linea` that GSAP animated on entry keeps an inline `transform`, which beats any `:hover { transform }` on the same element: the contact logos, which were also the mask line, never jumped. Put the hover movement on an inner wrapper (`.pie-logo-cuerpo`). A value exported from a `"use client"` module (like a CSS string) arrives in a server component as a client reference, not as text: keep such literals in the server file |
| G-056 | Lenis with `syncTouch: false` ignores `scrollTo` while a finger is on the screen; on touch devices use `window.scrollTo({ behavior: "smooth" })`. A programmatic scroll also stops at the page end: with the calendar as the last section, "go to the panel" fell 237 px short until the closing section existed below it |
| G-057 | The footer's ARAUCARIA (an SVG `<text>` drawn with `stroke-dasharray`/`stroke-dashoffset`, `textLength` + `lengthAdjust="spacingAndGlyphs"`) was blank on Mateo's iPhone but fine in Chromium, and also fine in Playwright's WebKit on Windows. That build does not share iOS's graphics stack, so the cause was **not reproduced** (suspected: iOS Safari and dashed strokes on SVG text). Do not rely on stroke-dash tricks on SVG `<text>` for anything that must be seen: use HTML text with `-webkit-text-stroke` and reveal it with `clip-path`. And a WebKit pass on Windows does not prove iOS: a real phone does |

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
| TD-008 | The two superseded gallery variants (`galeria-mosaico.tsx`, `galeria-corre.tsx`, the pinned walkthrough of `D-026`) were never committed and now live only in this session's scratchpad at `…/scratchpad/variantes-viejas/`. A temp cleanup loses them | They broke `typecheck` once the picker stopped importing them, and deleting without a copy is not reversible | If Mateo asks for either back, or when the gallery is finally merged and the folder can be dropped for good. **Paid 2026-09-23:** Mateo said *"si"* to dropping them; the folder was deleted |
| TD-009 | The rejected gallery code of this round was deleted from the repo after being copied, and the copies live only in the session scratchpad: `variantes-viejas/ronda-d027/` (A · Fila, B · Calma, C · Una por vez, their `galeria.css` and `pieza.tsx`, and the four files of `app/prototipo-galeria/`) and `variantes-viejas/ronda-d028/` (the stack with fixed-size takes: `pieza.tsx`, `tarjeta.tsx`, `galeria.tsx`, `galeria.css`). The versions of `D-028` that reached a commit are none — `3a0989f` already has `D-030`. A temp cleanup loses them | Keeping rejected variants in the repo breaks `typecheck` and invites reusing what Mateo rejected | If Mateo asks for any of them back; otherwise drop them for good with `TD-008`. **Paid 2026-09-23** with `TD-008`: deleted |

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
