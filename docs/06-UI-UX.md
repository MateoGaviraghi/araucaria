# 06 — UI / UX

> The structure of the landing and the owner panel: which blocks, in what order, with what content and states. Visual design is not decided here — it is decided section by section on the running site with `seccion-premium`.

## 1. Principles

- **Design happens on the running site** (`D-010`): `/diseno` → `seccion-premium`, one section at a time, named by Mateo. No mockups, wireframes, Figma or standalone HTML.
- **Mobile first.** The audience arrives from Instagram on a phone.
- **Real content only.** Every fact comes from `01-CONTEXT.md`; gaps are `{{CONFIRMAR}}`.
- **The salon sells itself with images.** Photos and video carry the page; copy stays short.
- **Argentine Spanish, "vos".**
- **Block names** are the canonical vocabulary from the workspace (`NAV`, `HERO`, …). Visual form and motion per block are decided in its section round.

## 2. Landing `/` — block sequence

The order below is the structure. Mateo decides which section is designed next, and may reorder after seeing it built.

| # | Block · variant | Job on this page | Content (from `01-CONTEXT.md`) |
|---|---|---|---|
| 1 | `NAV.sections` | Brand + one always-reachable action | Logo · anchors (Espacio, Módulos, Disponibilidad, Ubicación) · CTA "Consultar disponibilidad" → §5 |
| 2 | `HERO.media-bg` | Say what this is in one screen | Built 2026-09-21 (`D-023`). H1 "Salón de eventos con *patio, pileta y parrilla*" · SUB: the uses + capacity 35 + address · CTA-1 "Consultar disponibilidad" (shortened to "Disponibilidad" in the header under 560 px) · MEDIA: two wide takes of the walkthrough that rotate, opening from a vertical frame |
| 3 | `MEDIA-EMBED.gallery` | Show the space: salon, patio, pool, grill | Built 2026-09-23 (`D-028`, `D-029`, `D-030`). One story per space (El salón · El patio · La parrilla · La pileta), each with its number, name, one line from `01-CONTEXT` and its takes (the 6 short videos + 3 photos) shown one at a time at full size: tap to move, advances on its own, a button opens the viewer. On the phone, a stack of four cards driven by the scroll; from 1000 px, the four side by side in one screen, passing the turn left to right |
| 4 | `FEATURE-GRID` | What the rental includes | The 11 amenity rows, capacity 35 highlighted |
| 5 | `PRICING-TABLE.tiers` | Make the money decision explicit | Three tiers: Mediodía · Noche · Día completo, with hours and price. LEGAL: "Incluye la limpieza del lugar" + VAT/validity `{{CONFIRMAR}}` (`CI-05`) · rule "No habilitado para previas ni fiestas nocturnas" · CTA per tier preselects that module in §6 |
| 6 | `LEAD-FORM.qualifying` with the availability calendar | Turn intent into a complete inquiry | §4 below. **The calendar is built** (2026-09-23, `D-033`) as its own section right after the gallery, `id="disponibilidad"`; it stays local until the form exists |
| 7 | `MAP-LOCATION.static-image+link` | Physical trust and how to arrive | ADDRESS Güemes 3660 · TRANSPORT "a una cuadra de Bv. Gálvez, cerca de la Estación Belgrano" · HOURS = module hours · PHONE · CTA "Cómo llegar" (Google Maps link, no iframe) |
| 8 | `FOOTER.minimal` | Contact of last resort | Logo · phones · email · Instagram · © Araucaria |

## 3. The calendar (inside block 6)

### Day states

| State | Condition | Shown as |
|---|---|---|
| Past | date < today (Buenos Aires) | Not selectable |
| Out of range | date > today + 12 months (`CI-04`) | Not selectable |
| Free | no blocks | Selectable |
| Partial | exactly one module blocked | Selectable; the taken module appears crossed out |
| Full | both modules blocked | Not selectable; reads as taken |
| Unknown | availability failed to load | Every date selectable; a notice says availability could not be loaded |

### Module choice after picking a day

| Option | Enabled when |
|---|---|
| Mediodía · 10:00 a 17:00 hs · $240.000 | `mediodia` not blocked |
| Noche · 19:00 a 02:00 hs · $240.000 | `noche` not blocked |
| Día completo · 10:00 a 02:00 hs · $400.000 | **neither** module blocked |

The calendar is animated and professional; its visual and motion design was decided in a `seccion-premium` round (`D-033`): free days lit, one module left at half light with "solo noche" / "solo mediodía", taken days dark with a RESERVADO stamp; picking a day slides a curtain over the photo with the date and the modules. **Accessibility is fixed now:** reachable and operable by keyboard, each day announces its date and state, and focus stays visible.

## 4. The inquiry form (block 6)

### 4.1 Fields

| Field | Control | Validation | Error copy |
|---|---|---|---|
| Nombre | text | required, 1–60 | "Escribí tu nombre" |
| Apellido | text | required, 1–60 | "Escribí tu apellido" |
| Teléfono | tel | required, 8–15 digits after removing spaces and dashes | "Revisá el teléfono" |
| Tipo de evento | select | one of the six options | "Elegí el tipo de evento" |
| Cantidad de personas | number | integer 1–35 | "La capacidad máxima es de 35 personas" |
| Fecha + módulo | calendar + module choice | a selectable date and an enabled module | "Elegí una fecha y un módulo disponibles" |
| Forma de pago | radio | Efectivo · Transferencia | "Elegí cómo pagarías" |

### 4.2 Behaviour

- Validation runs on blur and on submit. The first invalid field receives focus on submit.
- Choosing a tier in §2 block 5 preselects its module here.
- A summary line before the button shows date, module and price as they will be sent.
- Submit button: **"Enviar consulta por WhatsApp"**.

### 4.3 Handoff status (`STATUS-PANEL.pending`)

After submit, the form area shows:

- TITLE: "Te abrimos WhatsApp con tu consulta"
- SUMMARY: the date, module and price
- NEXT-STEPS: "Enviá el mensaje y Araucaria te confirma la disponibilidad"
- PRIMARY-ACTION: "Si no se abrió WhatsApp, tocá acá" (the same `wa.me` URL)
- A secondary link to edit the inquiry

## 5. Owner panel `/admin`

| Screen | Blocks | Content |
|---|---|---|
| `/admin/login` | `AUTH-CARD.signin` | TITLE "Panel de Araucaria" · FIELD password · SUBMIT "Entrar" · ERROR-STATE (below) · no "forgot password" (rotation is manual) |
| `/admin` | `APP-SHELL.topbar` + month calendar + upcoming list + confirmation alert | Topbar: logo and a **visible "Cerrar sesión"** · month navigation · **each day split in two ("Mitades", `D-019`): top half = Mediodía, bottom half = Noche**, beige free / teal reserved · legend "Libre · Reservado · Arriba mediodía · abajo noche" · list **"Próximos reservados"** with "Liberar" per module (`D-020`) |
| Day action (`D-019`, replaces the confirmation dialogs) | Bottom sheet on the phone, side panel on desktop | Tap a day → "Tocá para reservar o liberar" + the long date + two large toggles **Mediodía** / **Noche** ("Libre" / "Reservado") + "Reservar el día completo" when both are free. Each tap saves at once, closes the sheet and shows the confirmation alert. No confirmation step before saving |
| Confirmation alert (`D-020`) | Centered card over the dimmed page (Apple alert) | A ring and a check drawn with GSAP DrawSVG (a cross on errors), title, detail "Sábado 19/09 · Mediodía", buttons **Deshacer** · **Listo**. Closes by itself after 4 s, paused while the pointer or keyboard focus is on it; Escape closes it |

### Error and feedback copy

| Code | Message |
|---|---|
| `INVALID_CREDENTIALS` | "Contraseña incorrecta." |
| `RATE_LIMITED` | "Demasiados intentos. Probá de nuevo más tarde." |
| `ALREADY_TAKEN` | Alert with a cross: "Ese módulo ya estaba reservado." (`D-020`) |
| `UNAUTHORIZED` | Redirect to login, message "Tu sesión terminó. Entrá de nuevo." |
| `RETRY` | Alert with a cross: "Algo falló. Reintentá." |
| Success block / unblock | Alert with a check: title "Reservado" / "Liberado", detail "Sábado 19/09 · Mediodía" (or "· Día completo") (`D-020`) |
| `NOT_FOUND` on unblock | Alert with a cross: "Ese módulo ya estaba liberado." (`D-018`) |
| After "Deshacer" | Alert with a check: "Deshecho" + the same detail (`D-020`) |
| Stale Server Action after a deploy | Alert with a cross: "Se actualizó la página, reintentá" (G-009) |
| Empty upcoming list / desktop panel with no day | "No hay módulos reservados desde hoy." / "Tocá un día del calendario para reservar o liberar." (`D-020`) |

## 6. Brand starting point

- **Name:** ARAUCARIA · subtitle "multiespacio".
- **Colors:** a deep teal/navy and a warm light beige, seen in the Instagram material. **Exact values `{{CONFIRMAR}}`**: extract them from the original logo (`CR-03`), never from screenshots.
- **Aesthetic stance:** declared in one line before the first pixel of the first section (`seccion-premium` step 0), and stated where it comes from.

## 7. Media rules

| Rule | Detail |
|---|---|
| LCP element | The hero **poster image**, not the video |
| Video | Muted, `playsinline`, starts only when visible, pauses off-screen and under `prefers-reduced-motion`. Never autoplay with sound |
| Temporary assets | Screenshots and WhatsApp videos are replaced when originals arrive (`CR-01`, `CR-02`); layouts must not depend on their exact crop |
| No AI-generated people | Only real photos of the space |

## 8. Accessibility

- `lang="es-AR"`; one `h1`; headings do not skip levels.
- `ACC-1` manual pass on the whole page; `ACC-2` on the inquiry form and the login.
- Touch targets ≥ 44×44 px, including calendar days on a 360 px screen.
- Everything animated has a `prefers-reduced-motion` version with the same information.
