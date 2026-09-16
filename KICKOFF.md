# KICKOFF — Araucaria · Event salon, phase 1

> Paste this whole file as the first message of a fresh chat opened in this repository. It is self-contained: everything needed to build phase 1 is written here in full.

---

You are building phase 1 of the website of **Araucaria Multiespacio**, a renovated house at **Güemes 3660, Santa Fe (Argentina)**, barrio Candiotti Norte, one block from Boulevard Gálvez and near Estación Belgrano. The work is for Nodo, Mateo's agency. **Talk to Mateo in Spanish.** Write code and docs in English, and UI copy in Argentine Spanish ("vos").

## 1. What to build

1. **A one-page public landing for the event salon (SUM)**: gallery of photos and videos, amenities, three modules with prices, an availability calendar, and an inquiry form that opens **WhatsApp with a complete prefilled message**. The public stores nothing.
2. **An owner panel at `/admin`**, behind one shared password, where the owner crosses out booked modules so the public calendar shows them as taken.

**Out of scope** (phase 2, do not build): online booking or payment, Mercado Pago, automated WhatsApp messages, the other spaces (offices, consulting rooms, meeting room, workspaces), own domain, storing inquiries, customer accounts, editing prices from the panel.

## 2. Salon facts (the only allowed source — never invent or round)

**Uses:** cumpleaños, eventos infantiles, reuniones, talleres, celebraciones.
**Rule to show:** "El espacio no está habilitado para previas ni fiestas nocturnas."

**Amenities:**
- Salón de usos múltiples
- Patio exterior con pileta
- Asador/parrilla
- Horno pizzero grande
- Baño
- Espacio de lavado con pileta
- Capacidad para hasta **35 personas**
- 30 sillas
- 3 mesas plegables
- 8 sillones/livings de exterior
- Vajilla y vasos para 30 personas

**Modules and prices:**

| Code | Label | Hours | Price |
|---|---|---|---|
| `mediodia` | Módulo mediodía | 10:00 a 17:00 hs | $240.000 |
| `noche` | Módulo noche | 19:00 a 02:00 hs | $240.000 |
| — | Día completo (both modules) | 10:00 a 02:00 hs | $400.000 |

The price includes cleaning ("El valor final incluye la limpieza del lugar"). VAT and validity are unknown: write `{{CONFIRMAR}}` in the legal line.

**Payment the visitor declares:** Efectivo · Transferencia. Nothing is paid online.

**Contact:**
- Phones: 3425450336 · 3425465599
- Email: Araucaria3650@gmail.com
- Instagram: @araucariamultiespacio

**WhatsApp that receives inquiries:** undecided by the client. During development use `5493425162081` (Mateo), read from `NEXT_PUBLIC_WHATSAPP_NUMBER`.

**Brand:** ARAUCARIA, subtitle "multiespacio". Deep teal/navy and warm light beige; exact values `{{CONFIRMAR}}` until the original logo arrives. Never pick colors from screenshots.

**Temporary media** in `C:\Users\mateo\Downloads\contenido-araucaria\`:
- 9 Instagram screenshots (~860 px, several with two photos side by side)
- a 4 KB logo
- `videos-muestra-salon\`:
  - `IMG_9789.MOV`: iPhone, HEVC, 1080×1920 vertical, 43 s, 58 MB
  - 6 WhatsApp videos at 480 p, 2–52 s

Originals arrive later. Layouts must not depend on the temporary crops.

## 3. Stack (pin these exact versions, commit the lockfile)

| Layer | Choice |
|---|---|
| Runtime | Node.js 24.21.0 LTS (if Vercel does not offer 24, use the previous LTS and tell Mateo) |
| App | `next` 16.3.5 (App Router, Server Actions) · `react` / `react-dom` 19.3.0 |
| Language | `typescript` 7.0.2, `strict` — if Next 16.3 does not type-check with TypeScript 7, pin the newest version it supports and tell Mateo |
| Styling | `tailwindcss` 4.3.3 + `@tailwindcss/postcss` 4.3.3 |
| Motion | `gsap` 3.15.0 (+ ScrollTrigger) · `lenis` 1.3.26. No other motion library |
| Validation | `zod` 4.6.5 |
| Database | Neon Postgres Free · `@neondatabase/serverless` 1.1.0 · `drizzle-orm` 0.45.2 · `drizzle-kit` 0.31.10 |
| Hashing | Node built-in `crypto.scrypt` |
| Hosting | Vercel Hobby, `*.vercel.app` link |
| Package manager | npm; CI uses `npm ci` |

**Forbidden:**
- a `.env.example` file
- Supabase
- in-memory rate limiting
- auth tokens in `localStorage`
- access decisions in `proxy.ts`
- route handlers that mutate
- a Google Maps iframe on first load
- any dependency Mateo has not approved

## 4. Repository layout

```
app/page.tsx                      landing
app/admin/login/page.tsx          login screen
app/admin/page.tsx                panel
app/admin/actions.ts              blockModules · unblockModule · logout
app/login-action.ts               login
app/error.tsx                     "Failed to find Server Action" → retryable message
components/sections/              one file per landing section
components/calendar/              shared logic + public view + admin view
components/ui/
content/salon.ts                  every fact from §2 — no literal anywhere else
lib/dal.ts                        requireAdmin() + all DB access (only importer of the DB client)
lib/db/                           Drizzle client + schema
lib/auth/                         scrypt, tokens, IP hashing, limits
lib/whatsapp.ts                   message + URL builder
lib/dates.ts                      Buenos Aires "today", es-AR formatting
drizzle/                          generated migrations
scripts/rotate-password.ts        operator-only
public/media/                     transcoded media (≤ 25 MB total)
proxy.ts                          redirect-only
```

## 5. Data model (write exactly this as the Drizzle schema; review the generated SQL before applying it)

```sql
create table module_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  module text not null check (module in ('mediodia','noche')),
  created_at timestamptz not null default now(),
  unique (date, module)
);
create table admin_credential (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null,               -- scrypt$N$r$p$saltB64$hashB64
  credential_version integer not null default 1,
  rotated_at timestamptz not null default now()
);
create table admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,           -- sha256 hex of the raw cookie token
  credential_version integer not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,           -- created_at + 30 days
  revoked_at timestamptz
);
create table login_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,                     -- HMAC-SHA256(IP_HASH_SALT, ip)
  at timestamptz not null default now(),
  success boolean not null
);
create index on login_attempts (ip_hash, at);
create index on login_attempts (at);
create table admin_audit (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  action text not null check (action in ('login_ok','login_fail','login_locked','logout','block','unblock','password_rotated')),
  detail jsonb not null default '{}',
  ip_hash text,
  session_id uuid
);
create index on admin_audit (at);
```

**Rules:**
- Availability is `(date, module)`. "Día completo" is two rows inserted in **one** multi-row `INSERT`, which is atomic without a transaction.
- The night module belongs to the date it starts.
- "Today" is always computed in `America/Argentina/Buenos_Aires`.
- Purges run inside a successful login, with no cron:
  - `login_attempts` older than 24 h
  - expired or revoked sessions
  - audit rows older than 12 months
- The credential is seeded by an operator script, never by a migration.

## 6. Server Actions and reads

Every Server Action is a public POST endpoint. Order: authenticate/rate-limit → zod → act → narrow result `{ ok: true, data? } | { ok: false, code }` with codes `UNAUTHORIZED`, `INVALID_INPUT`, `INVALID_CREDENTIALS`, `RATE_LIMITED`, `ALREADY_TAKEN`, `NOT_FOUND`, `RETRY`. Expected failures are returned codes, not throws.

| Name | Who | Input | Does |
|---|---|---|---|
| `getAvailability()` | public read | — | Blocks from today to today + 12 months, only `date` and `module`; cached under tag `availability` |
| `login(formData)` | anonymous | `password` (1–200), honeypot `website` (must be empty), `renderedAt` (reject if < 2 s) | Order in §8 |
| `logout()` | admin | — | `requireAdmin()` → `revoked_at` → clear cookie → audit |
| `getBlocks(month)` | admin | `YYYY-MM` | `requireAdmin()` → that month's blocks with ids |
| `blockModules({ date, choice })` | admin | date within today…+12 months; `choice` = `mediodia` \| `noche` \| `dia-completo` | `requireAdmin()` → one INSERT (1–2 rows) → unique violation → `ALREADY_TAKEN` → audit `block` → revalidate `availability` |
| `unblockModule({ id })` | admin | uuid | `requireAdmin()` → delete → audit `unblock` → revalidate `availability` |

## 7. The WhatsApp handoff

**URL:** `https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<encodeURIComponent(message)>`, opened in a new tab (`rel="noopener"`). Argentina mobile numbers are `54` + `9` + area code without `0` + number without `15`.

**Exact message** (no emoji):

```
Hola Araucaria! Quiero consultar por el salón para un evento.

Nombre: {nombre} {apellido}
Teléfono: {telefono}
Tipo de evento: {tipoEvento}
Cantidad de personas: {personas}
Fecha: {fechaLarga}
Módulo: {moduloEtiqueta}
Valor: {precio}
Forma de pago: {formaPago}

¿Está disponible?
```

**Placeholders:**
- `{fechaLarga}`: es-AR long date with weekday, e.g. "sábado 18 de octubre de 2026".
- `{moduloEtiqueta}`: one of
  - "Mediodía (10:00 a 17:00 hs)"
  - "Noche (19:00 a 02:00 hs)"
  - "Día completo (10:00 a 02:00 hs)"
- `{precio}`: "$240.000" or "$400.000".
- `{tipoEvento}`: one of Cumpleaños · Evento infantil · Reunión · Taller · Celebración · Otro.
- `{formaPago}`: "Efectivo" or "Transferencia".

Test it by sending to the test number from an iPhone, an Android and WhatsApp Web.

## 8. Security (build exactly this)

- **Password:** generated by Mateo (6 random words or ≥ 20 random characters), never chosen by the client, delivered in person.
  - Hash: `crypto.scrypt` with N = 131072, r = 8, p = 1, 16-byte salt, 64-byte key, **`maxmem` 256 MiB** (the default 32 MiB throws).
  - Compare with `crypto.timingSafeEqual`.
- **Sessions:** 32 random bytes → base64url token in the cookie; store only `sha256(token)`, with `credential_version`. Expires in **30 days**. New session every login.
- **Cookie:** `__Host-araucaria_admin`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, no `Domain`, `Max-Age` 30 days.
- **`requireAdmin()`** in `lib/dal.ts`: hash the cookie token → load the session → reject if missing, revoked, expired, or `credential_version` ≠ current. **First line of every admin action and every admin page data read.**
- **`proxy.ts`:** only redirects `/admin/*` (except `/admin/login`) to login when the cookie is absent. Nothing else.
- **Login order:**
  1. IP from Vercel's forwarding header → `HMAC-SHA256(IP_HASH_SALT, ip)`.
  2. ≥ 5 failures from that IP hash in 15 min → audit `login_locked` → `RATE_LIMITED`.
  3. ≥ 20 failures from anyone in 60 min → audit `login_locked` → `RATE_LIMITED`.
  4. zod + honeypot + time trap.
  5. scrypt verify.
  6. Insert `login_attempts` + audit.
  7. On success: session + cookie + purges + redirect `/admin`.
- **CSRF:** mutations only through Server Actions; leave `serverActions.allowedOrigins` unset.
- **Audit every:** `login_ok`, `login_fail`, `login_locked`, `logout`, `block`, `unblock`, `password_rotated`.
- **Rotation script** (`scripts/rotate-password.ts`): new hash + `credential_version + 1` + audit. It logs every session out and never prints the passphrase.
- **Errors:** generic messages to users, details only in server logs. Never log login request bodies.
- **Headers on every route:**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - A CSP written against the real assets
- **Headers on `/admin/*` in addition:** `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`.
- **Env vars** (values only in Vercel, `.env.local` locally, never a `.env.example`):
  - `DATABASE_URL`
  - `IP_HASH_SALT`
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`

## 9. Page structure

Mateo decides which section is designed next.

1. **`NAV`:**
   - logo
   - anchors: Espacio · Módulos · Disponibilidad · Ubicación
   - button "Consultar disponibilidad"
2. **`HERO`:**
   - H1 naming the event salon
   - the uses
   - CTA "Consultar disponibilidad"
   - the iPhone video, with its poster image as the LCP element
3. **Gallery:** photos + the 6 short videos as tiles, captions naming each space.
4. **Amenities grid:** capacity 35 highlighted.
5. **Modules and prices:**
   - three tiers
   - legal line "Incluye la limpieza del lugar" + `{{CONFIRMAR}}` for VAT and validity
   - the rule about previas and fiestas nocturnas
   - each tier's CTA preselects its module in the form
6. **Inquiry form with the calendar:**
   - **Fields:**
     - Nombre (1–60)
     - Apellido (1–60)
     - Teléfono (8–15 digits)
     - Tipo de evento (the six options)
     - Cantidad de personas (1–35)
     - Fecha + módulo
     - Forma de pago (Efectivo/Transferencia)
   - **Validation:** on blur and on submit, with focus moved to the first error.
   - **Error copy:**
     - "Escribí tu nombre"
     - "Escribí tu apellido"
     - "Revisá el teléfono"
     - "Elegí el tipo de evento"
     - "La capacidad máxima es de 35 personas"
     - "Elegí una fecha y un módulo disponibles"
     - "Elegí cómo pagarías"
   - **Summary line** before the button: date · module · price.
   - **Button:** "Enviar consulta por WhatsApp".
   - **After submit:**
     - "Te abrimos WhatsApp con tu consulta"
     - the summary
     - "Enviá el mensaje y Araucaria te confirma la disponibilidad"
     - "Si no se abrió WhatsApp, tocá acá" (same URL)
     - a link to edit
7. **Location:**
   - Güemes 3660
   - "a una cuadra de Bv. Gálvez, cerca de la Estación Belgrano"
   - module hours
   - phone
   - static map image + "Cómo llegar" (Google Maps link, no iframe)
8. **Footer:**
   - logo
   - phones
   - email
   - Instagram

**Calendar:**
- **Day states:**
  - past → not selectable
  - more than 12 months ahead → not selectable
  - free → selectable
  - one module taken → selectable, that module crossed out
  - both taken → not selectable
  - availability failed to load → all selectable, with the notice "No pudimos cargar la disponibilidad — consultanos igual por WhatsApp"
- **Module options:**
  - Mediodía enabled if `mediodia` is free
  - Noche enabled if `noche` is free
  - Día completo enabled only if **both** are free
- **Accessibility:** keyboard-operable, each day announces date and state, visible focus, 44 px targets at 360 px width.

**Owner panel:**
- **`/admin/login`:** title "Panel de Araucaria", password field, button "Entrar", no forgot-password link.
- **`/admin`:** topbar with logo and a **visible "Cerrar sesión"**, month navigation, each day shows mediodía/noche free or crossed out.
- **Day actions:**
  - Tap a day → cross out Mediodía / Noche / Día completo (with confirmation).
  - Tap a crossed-out module → "¿Liberar Noche del sábado 18/10?" → confirm.
- **Messages:**
  - "Contraseña incorrecta."
  - "Demasiados intentos. Probá de nuevo más tarde."
  - "Ese módulo ya estaba tachado."
  - "Tu sesión terminó. Entrá de nuevo."
  - "Algo falló. Reintentá."
  - "Listo, Noche del 18/10 tachada." / "…liberada."

**Media:**
- Transcode the HEVC video to H.264 without audio, with `faststart` and a poster.
- Crop screenshots to one photo each; never upscale.
- Videos are muted and `playsinline`, play only when visible, and pause under `prefers-reduced-motion`.
- No AI-generated people.

## 10. How to work with Mateo

- **Design:** every public section is designed with `/diseno` → `seccion-premium`, on the running site. Mateo names the section. Show references before any plan. Build mobile first. Look at it yourself at 375, 1440 and 1920 before reporting. No mockups, wireframes, Figma or standalone HTML.
- **Plans:** before touching files on multi-file work, show a table (file · what · governed by) and wait for his written GO-AHEAD.
- **Commits:** `type: descripción en español`. Commit and push only when he says so.
- **Security-sensitive work** (auth, actions, headers): load `/seguridad`.

## 11. Work units, in order

1. **Scaffold:** pinned versions, Tailwind, scripts `dev`, `build`, `lint`, `typecheck`, `db:generate`, `db:migrate`, layout, Vercel project, Neon project + dev branch, env vars.
2. **Data layer:** schema, migration reviewed and applied to dev.
3. **Auth:** hashing, sessions, limits, `requireAdmin`, proxy redirect, login/logout, audit, purges, rotation script, dev credential.
4. **Owner panel.**
5. **Public availability:** read + shared calendar logic.
6. **Media pipeline.**
7. **Landing sections**, one by one with `seccion-premium`.
8. **Inquiry form + calendar + WhatsApp handoff.**
9. **Hardening and launch:** headers/CSP, security checklist, accessibility pass, performance, backup restore test, production password rotated and handed over, client approval on the preview URL, production link.

## 12. Definition of done

- `npm ci`, `build`, `typecheck` and `lint` pass.
- A POST to `blockModules` without the cookie returns `UNAUTHORIZED`.
- 5 wrong passwords from one IP lock that IP for 15 minutes.
- Rotating the password logs out a logged-in phone.
- The message arrives intact on iPhone, Android and WhatsApp Web.
- **Public page at p75:**
  - CLS ≤ 0.1 is a hard gate
  - LCP ≤ 2.5 s is a warning
  - INP ≤ 200 ms is a warning
- **Accessibility:**
  - one h1
  - alt text
  - contrast over real media
  - full keyboard path with visible focus
  - 44 px targets
  - `lang="es-AR"`
  - 200 % zoom without horizontal scroll
  - meaningful link text
  - the form and the login fully usable by keyboard with announced errors
- **Security:** a post-build grep for secret values finds nothing, and there is no `.env.example` anywhere.
- **Data:** one production backup was restored into a scratch branch.
- **Content:** no price, hour, capacity or amenity differs from §2.

**Your first action:** read this whole file, then present the plan for work unit 1 as a table and wait for Mateo's GO-AHEAD.
