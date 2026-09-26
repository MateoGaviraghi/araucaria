# 05 — Contracts

> The Server Actions and reads of phase 1, their inputs and results, and the exact WhatsApp message the form builds.

There are **no REST endpoints and no route handlers that write**. Every mutation is a Server Action, which is a public POST endpoint. Each one runs in this order:

1. authenticate / rate-limit;
2. validate with zod;
3. act;
4. return a narrow result.

## 1. Result shape

```ts
type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: ErrorCode };

type ErrorCode =
  | 'UNAUTHORIZED'        // no valid session
  | 'INVALID_INPUT'       // zod failed
  | 'INVALID_CREDENTIALS' // wrong password (never says more)
  | 'RATE_LIMITED'        // per-IP or global limit reached
  | 'ALREADY_TAKEN'       // unique (date, module) conflict
  | 'NOT_FOUND'
  | 'RETRY';              // unexpected; generic message, details only in server logs
```

Expected failures are returned values. Only programmer errors throw. The UI maps each code to one Spanish message (`06-UI-UX.md` §5).

## 2. Server Actions and reads

| Name | Who | Input (zod) | Does | Result |
|---|---|---|---|---|
| `getAvailability(today)` | Public (server read) | `today` (Buenos Aires, computed by the caller) | `select date, module from module_blocks where date between today and today + 12 months`. Cached under tag `availability`, profile `hours` (`D-021`) | `{ date: 'YYYY-MM-DD'; module: 'mediodia' \| 'noche' }[]` — nothing else — or **`null`** when the database could not be read, so the page still renders with the notice |
| `login(formData)` | Anonymous | `password: string (1–200)`, `website: string` (honeypot, must be empty), `renderedAt: number` (time trap) | §5 order of `08-SECURITY.md`. Success → session + cookie + audit + purges → redirect `/admin` | `ActionResult` |
| `logout()` | Admin | none | `requireAdmin()` → set `revoked_at` → clear cookie → audit. The panel then loads `/admin/login` as a full page (`D-046`) | `void` |
| Panel reads (`getUpcomingReservations`, `getPastReservations`, `getReservationsForMonth`) | Admin (server read in each `/admin` page after `requireAdmin()`) | today / `month: 'YYYY-MM'` | Modules joined with their reservation, grouped per reservation (`lib/reservas.ts`) | `Reserva[]`: `{ id \| null; blockIds; date; modules; clientName; clientPhone }` |
| `takenInMonth(input)` | Admin | `month: 'YYYY-MM'` | `requireAdmin()` → every module taken that month, date and module only (`D-047`) | `ActionResult<{ taken: { date; module }[] }>` |
| `createReservation(input)` | Admin | `date` (today_AR ≤ date ≤ today_AR + 12 months) · `choice: 'mediodia' \| 'noche' \| 'dia-completo'` · `clientName: string (trimmed, 1–80)` · `clientPhone: string` (10 national digits without 0 or 15, or empty) | `requireAdmin()` → one batch: the reservation, its 1 or 2 modules, audit `block` (date, modules, reservation id; **no name or phone**) → on unique violation `ALREADY_TAKEN` → `updateTag('availability')` | `ActionResult<{ id: string }>`: the id, so the panel can undo at once |
| `cancelReservation(input)` | Admin | `id: uuid` | `requireAdmin()` → delete the reservation (its modules go with it) and audit `unblock` in one statement → `updateTag('availability')` | `ActionResult`; `NOT_FOUND` when already gone |
| `unblockModule(input)` | Admin | `id: uuid` (a module row) | Only for modules loaded before `D-046`, which have no reservation: `requireAdmin()` → delete by id → audit `unblock` → `updateTag('availability')` | `ActionResult` |

Signatures take **identifiers and changes, never whole objects**. Nothing the client sends decides identity.

```ts
export async function createReservation(input: { date: string; choice: string; clientName: string; clientPhone: string }): Promise<ActionResult<{ id: string }>>
export async function cancelReservation(input: { id: string }): Promise<ActionResult>
export async function unblockModule(input: { id: string }): Promise<ActionResult>
export async function takenInMonth(input: { month: string }): Promise<ActionResult<{ taken: AvailabilityEntry[] }>>
```

## 3. The WhatsApp handoff

### URL

```
https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<encodeURIComponent(message)>
```

- The number is digits only, in international format without `+`. Argentina mobile = `54` + `9` + area code without `0` + number without `15`.
- Testing (Mateo): `5493425162081`. Production: `CI-01`.
- It opens in a new tab (`target="_blank"`, `rel="noopener"`).

### Message template (exact text)

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

| Placeholder | Source | Format |
|---|---|---|
| `{nombre}` `{apellido}` | Form | Trimmed, as typed |
| `{telefono}` | Form | `+54` followed by the 10 national digits, no 0 or 15, e.g. "+54 3425162081" (`D-034`) |
| `{tipoEvento}` | Form choice | One of: Cumpleaños · Evento infantil · Reunión · Taller · Celebración · Otro. "Otro" carries what the visitor wrote: "Otro (Bautismo)" (`D-034`) |
| `{personas}` | Form | Integer 1–35 |
| `{fechaLarga}` | Calendar | `es-AR` long date with weekday, e.g. "sábado 18 de octubre de 2026" |
| `{moduloEtiqueta}` | Module choice | "Mediodía (10:00 a 17:00 hs)" · "Noche (19:00 a 02:00 hs)" · "Día completo (10:00 a 02:00 hs)" |
| `{precio}` | `content/` constants | `$240.000` or `$400.000` (`es-AR` thousands separator) |
| `{formaPago}` | Form radio | "Efectivo" · "Transferencia" |

### Example

```
Hola Araucaria! Quiero consultar por el salón para un evento.

Nombre: Laura Gómez
Teléfono: +54 3425551234
Tipo de evento: Cumpleaños
Cantidad de personas: 25
Fecha: sábado 18 de octubre de 2026
Módulo: Noche (19:00 a 02:00 hs)
Valor: $240.000
Forma de pago: Transferencia

¿Está disponible?
```

The text carries no emoji on purpose: it must arrive intact on every WhatsApp client. A test in WU-08 sends it to the test number from an iPhone, an Android and WhatsApp Web.
