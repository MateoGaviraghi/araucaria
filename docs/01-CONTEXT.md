# 01 — Context

> The client, the audience, and the verified facts about the event salon. This file is the only source for salon content — never write a price, hour or amenity from memory.

## Sources

| Source | Date | Used for |
|---|---|---|
| Araucaria's standard WhatsApp reply to inquiries, forwarded by Mateo | 2026-09-16 | Uses, amenities, capacity, modules, prices, rules, address |
| Instagram screenshots (`@araucariamultiespacio`) | 2026-09-15 | Brand name, tagline, contact, the four spaces, photos |
| Conversation with Mateo | 2026-09-16 | Scope, payment methods, calendar model, test WhatsApp number |

When two sources disagree, the row says so and names the winner.

## The client

- **Business:** Araucaria Multiespacio — a renovated house with offices/consulting rooms, a meeting room, workspaces and a **SUM** (event salon with patio and pool). Tagline in their material: *"multiespacio"*.
- **Delivered by:** Nodo (Mateo's agency).
- **Owner / day-to-day contact:** `{{CONFIRMAR}}` (`CI-02`).
- **Stage:** new business. Instagram had 86 followers and 3 posts on 2026-09-15.

## Audience

- Comes from **Instagram** (bio link), almost always on a phone.
- Wants a place for: cumpleaños, eventos infantiles, reuniones, talleres, celebraciones.
- Today asks by WhatsApp: *"envianos la fecha en la que te gustaría alquilar el espacio y te confirmamos si está disponible"*.

## The event salon — facts

### Amenities

| Item | Detail |
|---|---|
| Salón de usos múltiples | — |
| Patio exterior con pileta | — |
| Asador / parrilla | — |
| Horno pizzero grande | — |
| Baño | — |
| Espacio de lavado con pileta | — |
| Capacity | **Up to 35 people** |
| Sillas | 30 |
| Mesas plegables | 3 |
| Sillones / livings de exterior | 8 |
| Vajilla y vasos | For 30 people |

### Modules and prices

| Module (code) | Label | Hours | Price |
|---|---|---|---|
| `mediodia` | Módulo mediodía | 10:00 a 17:00 hs | **$240.000** |
| `noche` | Módulo noche | 19:00 a 02:00 hs (ends the next day) | **$240.000** |
| — (both modules) | Día completo | 10:00 a 02:00 hs | **$400.000** |

- The price **includes cleaning** ("El valor final incluye la limpieza del lugar").
- VAT included or not, and how long prices are valid: `{{CONFIRMAR}}` (`CI-05`).

### Rules to show

- **"El espacio no está habilitado para previas ni fiestas nocturnas."**

### Payment (how the visitor says they would pay)

- Efectivo
- Transferencia

Nothing is paid online in phase 1.

### Location

| Field | Value |
|---|---|
| Address | **Güemes 3660, Santa Fe** |
| Neighbourhood | Barrio Candiotti Norte |
| How to get there | A una cuadra de Boulevard Gálvez, cerca de la Estación Belgrano |

> **Conflict, resolved:** the Instagram screenshots say **Güemes 3650**; the client's own WhatsApp reply says **3660**. Mateo confirmed **3660** (`D-011`). Correcting Instagram is on the client (`CR-04`).

### Contact

| Channel | Value |
|---|---|
| Phones | 3425450336 · 3425465599 |
| Email | Araucaria3650@gmail.com |
| Instagram | `@araucariamultiespacio` |
| WhatsApp that receives inquiries | **3425450336, provisional** (`D-048`, 2026-09-26): Mateo's choice until the client confirms or changes it (`CI-01`). Before that, testing used Mateo's own number |

## Assets on hand

| Asset | State | Usable for |
|---|---|---|
| 9 Instagram screenshots, ~860 px | Several show two photos side by side (~430 px each) | Temporary imagery only |
| Logo `logo-araucaria.jpg`, 4 KB | Too small for any real use | Reference only — original needed (`CR-03`) |
| `IMG_9789.MOV` — iPhone, HEVC, 1080×1920 vertical, 43 s, 58 MB | Good quality; must be transcoded (`07-INFRASTRUCTURE.md`) | Hero / gallery video |
| 6 WhatsApp videos, 480×848 or 848×480, 2–52 s | Low resolution | Small gallery tiles only |
| Original photos and 5 videos | With Mateo, not yet in the repo | Replace the temporary assets (`CR-01`, `CR-02`) |

Local path of the temporary assets: `C:\Users\mateo\Downloads\contenido-araucaria\` (videos in `videos-muestra-salon\`).

## Constraints

- **Speed:** the client wants this live fast; phase 1 is scoped to the salon.
- **Cost:** free plans (`D-005`, `D-006`).
- **Mobile, from Instagram:** first load weight matters more than desktop polish.
- **Owner capacity:** the calendar is only as good as the owner's discipline in crossing out modules (`CI-03`).
