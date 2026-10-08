# Ayzon Backend Implementation Plan

**Purpose:** Phased plan to stand up the real API, Postgres persistence, and cut the web app over from the browser `localStorage` pilot.  
**Audience:** Implementation agents + founder review.  
**Status:** Decisions locked — ready to implement from Phase A.

**This program = guest-booking Phase 3 (real auth + Postgres) + Phase 1 Stripe leftover (real Checkout + webhook, test mode).**  
WhatsApp OTP/templates and Daily.co rooms stay on a **separate Phase 2 track** (blocked on the founder’s Meta setup). Do not build them here.

---

## 0. Locked decisions

| # | Topic | Decision |
| --- | --- | --- |
| 1 | ORM | **Prisma** |
| 2 | Auth | **DB-backed cookie sessions** — `httpOnly`, `Secure`, `SameSite=None` |
| 3 | Payments | **Real Stripe Checkout + webhook in test mode from the start** — no payment stub |
| 4 | Provider approval | **Pending until approved** via **`ADMIN_TOKEN`-protected** endpoint — **no** auto-approve bypass |
| 5 | Hosting | **Railway** for API · **Neon** for Postgres |
| 6 | Slot times | **UTC instants** — `startsAt` / `endsAt` `DateTime` (`timestamptz`). **Do not** persist mock `dateIso` + `timeLabel` |
| 7 | Guest identity (until Phase 2) | **Email + manage token.** Store `manageTokenHash` / `joinTokenHash` on bookings. **No** `otp_codes` or `message_log` |
| 8 | Double-book guard | **Partial unique index** `bookings(slot_id) WHERE status = 'upcoming'` via **raw SQL** migration, plus transactional hold `UPDATE … WHERE status = 'open'` and an expired-hold sweeper |

These override any earlier “recommend / optional” language in this doc.

---

## 1. Current state (as of master)

### What works today (pilot)

| Layer | Reality |
| --- | --- |
| `apps/web` | Full product UI (browse, guest book, pay stub, join, pro availability, etc.) |
| Persistence | `apps/web/src/lib/db.ts` — **localStorage** key `ayzon-db-v1` (async API shape for later swap) |
| Auth | Passwordless mock (`mock-auth.ts`); password on register is discarded |
| Session | `sessionUserId` inside the same localStorage blob |
| Slots (pilot only) | `dateIso` + `timeLabel` strings — **do not copy this shape into Postgres** |
| Provider approval | `AUTO_APPROVE_PROFESSIONALS = true` in web — **must be removed** in backend cutover |
| Payments | Simulated “secure pay”; not Stripe |
| `apps/api` | Express skeleton; only `GET /health` is live; domain routes return **501** |
| Shared | `packages/shared` — UI types, sample seed data, routes, copy |
| ORM / Docker / migrations | **None** |

### Existing API module stubs (all 501)

Mounted under `apps/api` (see `src/app.ts`):

- `/health` — live
- `/auth/*` — login, register, forgot/reset, logout
- `/users/*`
- `/professionals/*`
- `/categories/*`
- `/bookings/*`
- `/availability/*`

### Core entities for Prisma (not a 1:1 copy of the mock)

- **User** — id, name, email, role (`client` \| `professional`), passwordHash, createdAt
- **Session** — id, userId, token hash, expiresAt, createdAt (DB-backed cookies)
- **Professional** — profile, languages, specialties, fee, status (`pending` \| `approved`), photoUrl, ratings
- **Slot** — professionalId, **`startsAt` / `endsAt` timestamptz (UTC)**, status (`open` \| `closed` \| `booked` \| `held`), holdExpiresAt, holdBookingId. Uniqueness: `@@unique([professionalId, startsAt])`. One hour: `endsAt = startsAt + 1 hour`. **No** `dateIso`, **no** `timeLabel` columns.
- **Booking** — client **or** guest fields (guest identity = **email**), slotId, fee, status (`held` \| `upcoming` \| `cancelled` \| `completed`), sessionCode, **`manageTokenHash`**, **`joinTokenHash`**, Stripe ids (`checkoutSessionId`, `paymentIntentId`), linkState

Day and clock labels are **derived at read time** from `startsAt`:

- Client / booker: local timezone of the browser
- Provider: **EAT** (Africa/Addis_Ababa)

The seed may *read* sample `dateIso` + `timeLabel` and convert them into UTC `startsAt`/`endsAt` (treat sample labels as EAT). Those strings are an input to the seed script only.

### Deferred tables (not in this program)

Do **not** create: `reviews`, `provider_payouts`, `otp_codes`, `message_log`.

### Spec / tracker sources

| Doc | Role |
| --- | --- |
| `docs/ethio-wellness-ui-spec/README.md` | UI authority; no API contracts |
| `docs/guest-booking-phases.md` | Phase 1 pilot done; Phase 3 = auth + Postgres; Phase 1 leftover = real Stripe; Phase 2 = WhatsApp / Daily.co (**out of this program**) |
| Standing rules | No account required to book · WhatsApp ≠ video venue · minimal PII · no clinical notes |

---

## 2. Goals and non-goals

### Goals

1. **Neon Postgres** as source of truth (local Postgres OK for laptop via Docker or Neon branch).
2. Express API on **Railway** with Prisma migrations (plus one raw SQL migration for the partial unique index).
3. Web talks to API over HTTPS (prod) / localhost (dev); domain data leaves localStorage.
4. Guest book + join + pro availability work across browsers/devices.
5. Real **email + password** auth with **DB-backed httpOnly cookies**.
6. Guest funnel stays **login-free**. Until Phase 2, guest identity is **email + manage token**.
7. **Stripe Checkout (test mode) + webhook** confirms bookings — no fake `pi_test_*` confirm path in the API.
8. New professionals stay **`pending`** until `ADMIN_TOKEN` approve; public directory lists **`approved` only**.
9. Slot times stored only as UTC instants; double-booking prevented in the database.

### Non-goals (Phase 2 and later — do not implement here)

- WhatsApp OTP, templates, transactional WhatsApp (blocked on founder Meta setup)
- Daily.co video rooms
- `otp_codes` and `message_log` tables
- `reviews` and `provider_payouts` tables
- Manage-booking `/b/<token>` UI (store `manageTokenHash` now; UI is later)
- Full admin console (approve endpoint only)
- CAPTCHA / fraud stack
- HIPAA BAA / legal review
- Stripe **live** mode (test mode only in this program)

---

## 3. Locked technical stack

| Area | Choice | Notes |
| --- | --- | --- |
| DB | **Neon Postgres** | `DATABASE_URL` (+ pooled URL if Neon recommends; prefer long-lived Prisma on Railway) |
| ORM | **Prisma** | Schema + migrations in `apps/api`. Partial indexes via raw SQL, not Prisma `@@unique` |
| Slot time | `DateTime @db.Timestamptz(6)` | `startsAt`, `endsAt` UTC. Labels computed in API/web, never stored |
| API host | **Railway** | Deploy `apps/api`; run `prisma migrate deploy` on release |
| Local DB | Docker Postgres **or** Neon dev branch | Document both; CI can use Neon |
| Auth | Opaque session id in cookie → **Session** row | `httpOnly`; `Secure`; `SameSite=None` |
| Cross-origin cookies | Required | Web and API on different origins → `SameSite=None; Secure` |
| Local HTTPS for cookies | Dev must use Secure cookies | Plain `http://localhost` cannot set `Secure` cookies — document `COOKIE_SECURE=false` **dev-only**; prod always `true` |
| Payments | **Stripe Checkout + webhook** | Test keys; webhook confirms hold → `upcoming` |
| Admin | `Authorization: Bearer ${ADMIN_TOKEN}` | Approve/reject professional |
| Web client | `apps/web/src/lib/api.ts` + `credentials: 'include'` | Replace `db.*` gradually |
| Env (API) | See §3.1 | |
| Env (Web) | `NEXT_PUBLIC_API_URL` | Checkout Session created server-side |

### 3.1 API environment variables

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon (or local) Postgres |
| `SESSION_SECRET` | Signing / hashing session tokens |
| `CORS_ORIGIN` | Web origin(s), comma-separated |
| `COOKIE_SECURE` | `true` in prod/Railway; optional `false` for local http debugging |
| `ADMIN_TOKEN` | Shared secret for approve endpoint |
| `STRIPE_SECRET_KEY` | Test secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `PUBLIC_WEB_URL` | Success/cancel Checkout return URLs |
| `PORT` | Railway injects; default 4000 locally |

---

## 4. Target architecture

```text
Browser (Next.js — e.g. Vercel or local)
  ├─ guest flows (no session cookie; identity = email + manage token)
  └─ signed-in flows (session cookie: httpOnly / Secure / SameSite=None)
        │  credentials: include
        ▼
  Express API (Railway)
        │
        ├─ Auth + Session table
        ├─ Professionals (public: approved only)
        ├─ Admin approve (ADMIN_TOKEN)
        ├─ Availability (startsAt/endsAt UTC)
        ├─ Bookings + transactional holds + hold sweeper
        └─ Stripe Checkout + webhook
        │
        ▼
     Neon Postgres
        ├─ @@unique([professionalId, startsAt]) on slots
        └─ partial unique index bookings(slot_id) WHERE status='upcoming'
```

**Cutover:** Feature-flag or phased `db.*` → API; then delete domain localStorage. No long-lived dual-write.

**Remove from web when API owns approval:** `AUTO_APPROVE_PROFESSIONALS` and any bypass that flips `pending` → `approved` on save.

**API responses** include `startsAt` / `endsAt` as ISO-8601 UTC. Clients format display labels. Do not accept or return `dateIso` + `timeLabel` as the stored contract (a request body may send an ISO instant the UI built from a picked hour).

---

## 5. Implementation phases

### Phase A — Foundation (Prisma + Neon/local + Railway-ready)

**Outcome:** Schema migrated; seed loads UTC slots; health checks DB; deployable to Railway against Neon.

**Steps**

1. Add Prisma to `apps/api`: `schema.prisma`, migrate scripts, seed.
2. Models: `User`, `Session`, `Professional`, `Slot`, `Booking` (+ enums). **No** `reviews`, `provider_payouts`, `otp_codes`, `message_log`.
3. Slot columns: `startsAt`, `endsAt` (`Timestamptz`), status, hold fields. `@@unique([professionalId, startsAt])`.
4. Booking columns include `manageTokenHash` and `joinTokenHash` (nullable until confirm).
5. After Prisma migration, add a **raw SQL** migration:

   ```sql
   CREATE UNIQUE INDEX bookings_one_upcoming_per_slot
     ON bookings (slot_id)
     WHERE status = 'upcoming';
   ```

   Prisma cannot express this partial index. Do not try to fake it with `@@unique([slotId])` (that would block cancelled/held history).
6. Other indexes: unique email; unique `sessionCode`; join lookup on session code + guest email.
7. Seed: convert sample `dateIso` + `timeLabel` (interpreted as **EAT**) into `startsAt`/`endsAt`. Sample pros **`approved`**; optional extra pro **`pending`**; demo users with **hashed** passwords. Seed does not write `dateIso`/`timeLabel` columns.
8. Zod (or similar) env validation. Stripe vars required by Phase E; warn if missing earlier.
9. `GET /health` → `{ status, db }`.
10. Local: `docker-compose` Postgres **or** Neon branch URL in `.env`.
11. README: Neon + Railway (`prisma migrate deploy` on release, including the raw SQL migration).

**Exit criteria**

- [ ] Migrate + seed against Neon (or local) succeeds  
- [ ] Slots have `startsAt`/`endsAt` only; no `dateIso`/`timeLabel` columns  
- [ ] Partial unique index exists on `bookings(slot_id) WHERE status = 'upcoming'`  
- [ ] `/health` reports DB up  
- [ ] Railway service can boot with Neon `DATABASE_URL`  

---

### Phase B — Public read APIs + web adapter

**Outcome:** Browse directory from Postgres; only **approved** professionals. Availability returned as UTC instants.

**API**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/categories` | Shared categories or DB |
| GET | `/professionals` | Filters; **`status=approved` only** |
| GET | `/professionals/:slug` | 404 if pending/missing |
| GET | `/professionals/:slug/availability` | Slots with `startsAt`/`endsAt` from now forward |

**Web**

1. `NEXT_PUBLIC_API_URL` + `apiClient` with `credentials: 'include'`.  
2. List/detail/slots read from API. Format `startsAt` in the booker’s local timezone for display.  
3. Writes still localStorage until later phases if needed; prefer `NEXT_PUBLIC_USE_API` flag.

**Exit criteria**

- [ ] Empty localStorage: approved pros + opens load from API  
- [ ] Display times shift correctly when the browser timezone changes; stored value stays UTC  
- [ ] Pending pro never appears in public list  
- [ ] CORS + credentials work for web origin  

---

### Phase C — Auth + DB-backed cookie sessions

**Outcome:** Register/login/logout real; session row + cookie.

**API**

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register` | Creates user; if role=professional → Professional **`pending`** |
| POST | `/auth/login` | Sets session cookie |
| POST | `/auth/logout` | Deletes session row + clears cookie |
| GET | `/auth/me` | User + professionalStatus |
| POST | `/auth/forgot-password` | Token table OK; email send can be log-only in v1 |
| POST | `/auth/reset-password` | Consume token |

**Cookie rules**

- Name e.g. `ayzon_session`  
- Value: opaque token (store **hash** in `Session`)  
- Attributes: `httpOnly`, `Secure` (prod), `SameSite=None`, `Path=/`  
- CORS: `credentials: true`, explicit origin (not `*`)  
- Professional with `pending`: can log in and edit profile/availability, but **not** listed publicly; keep `/professional/pending` UX

**Admin (can ship with C or D)**

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/admin/professionals/:id/approve` | Header `Authorization: Bearer ADMIN_TOKEN` → `approved` |
| POST | `/admin/professionals/:id/reject` | Optional; or stay pending |

**Web**

1. Wire login/register; remove mock auto-create-on-unknown-login.  
2. `SessionProvider` ← `/auth/me`.  
3. Set `AUTO_APPROVE_PROFESSIONALS = false` and remove bypasses.  
4. Seed QA passwords documented in README (not in public marketing copy).

**Exit criteria**

- [ ] Register professional → pending → invisible publicly  
- [ ] `curl` approve with `ADMIN_TOKEN` → visible in directory  
- [ ] Session cookie works cross-origin (deployed web↔Railway)  
- [ ] Guest browse still cookieless  

---

### Phase D — Availability + profile writes

**Outcome:** Pros persist hours as UTC instants; booked slots preserved.

**API**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/availability/me` | Auth professional; return `startsAt`/`endsAt` |
| PUT | `/availability/me` | Body is a set of UTC instants (or hour picks the server converts using EAT). Upsert by `(professionalId, startsAt)`. Never clobber `booked` |
| PATCH | `/professionals/me` | Profile / specialties / fee |

Provider UI may still show an EAT hour grid (12:00 AM–11:00 PM). On save, each selected hour becomes `startsAt` in UTC for that calendar date in **Africa/Addis_Ababa**, `endsAt = startsAt + 1 hour`. No overlapping windows.

**Web:** availability editor + profile/specialties → API; ownership checks server-side. Render the grid from `startsAt` in EAT.

**Exit criteria**

- [ ] Opens appear on public availability for **approved** pros  
- [ ] Same hour cannot be inserted twice (`@@unique([professionalId, startsAt])`)  
- [ ] Pending pro can still save availability (prep before approve)  
- [ ] Cross-pro mutation forbidden  

---

### Phase E — Bookings + Stripe Checkout + webhook + join

**Outcome:** End-to-end paid booking in **Stripe test mode**; no confirm-without-payment API. Double-booking blocked in Postgres.

**Booking API**

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/bookings/holds` | 10-min hold; transactional |
| PATCH | `/bookings/holds/:id` | Guest email (required) + optional name/phone/note, or clientId |
| POST | `/bookings/holds/:id/checkout` | Create Stripe Checkout Session; return `{ url }` |
| POST | `/stripe/webhook` | Raw body; verify signature; on `checkout.session.completed` confirm booking |
| GET | `/bookings/:id` | Confirmation |
| POST | `/bookings/:id/cancel` | v1 rules; sets status so the partial unique index releases the slot |
| GET | `/bookings/join` | `code` + **email** → lobby (no Daily.co) |
| GET | `/bookings/mine` | Client |
| GET | `/bookings/professional` | Pro |

**Hold + confirm (required mechanics)**

1. Create hold inside a transaction:

   ```sql
   UPDATE slots
      SET status = 'held', hold_expires_at = ..., hold_booking_id = ...
    WHERE id = $1 AND status = 'open';
   ```

   Zero rows updated → conflict (already held or booked). Insert the `held` booking in the same transaction.
2. **Sweeper** (interval job on the API process, plus lazy release on read): if `holdExpiresAt < now()` and slot is still `held`, set slot back to `open` and booking to `cancelled` (or a dedicated expired state that is **not** `upcoming`).
3. Webhook confirm, in one transaction: booking `held` → `upcoming`, slot `held` → `booked`, write `sessionCode`, `manageTokenHash`, `joinTokenHash`, Stripe ids. The partial unique index rejects a second `upcoming` row for the same `slot_id`.
4. Guest identity for this program is **email + manage token**. Join lookup stays code + email. Do not add WhatsApp OTP.
5. Lobby response has no video-room URL (Daily.co is Phase 2).

**Stripe flow (required)**

1. Client finishes book form → hold created.  
2. Pay CTA → `POST .../checkout` → redirect to Stripe Checkout (test).  
3. Success URL → web confirmation page (poll/fetch booking).  
4. **Webhook** is source of truth for confirm.  
5. Do **not** expose a public “confirm hold with fake paymentIntentId” shortcut.  
6. Idempotent webhook handling.  
7. Local webhook: Stripe CLI → Railway or localhost tunnel; document in README.  
8. Late Checkout completion after the sweeper released the hold is rejected (do not reopen a slot that was taken).

**Server rules**

1. Hold only via `UPDATE … WHERE status = 'open'`.  
2. Max 3 pending (held, unexpired) bookings per guest email.  
3. Confirm only from a verified Checkout completion for that hold.  
4. Amount = professional fee (cents); currency USD in Stripe test unless founder sets otherwise.  
5. Payout display on the pro UI can stay a derived label (`fee`); do **not** add a `provider_payouts` table.

**Web**

1. Replace simulated payment page with redirect-to-Checkout.  
2. Confirmation + join + sessions/bookings read API. Format times from `startsAt`.  
3. Remove localStorage hold/confirm paths when flag on.

**Exit criteria**

- [ ] Test card pays → webhook confirms → join finds booking by code + email after clearing browser storage  
- [ ] `manageTokenHash` and `joinTokenHash` stored on confirm; raw tokens not stored  
- [ ] Abandoned Checkout: sweeper reopens the slot  
- [ ] Two browsers cannot create two `upcoming` bookings for the same slot (DB index, not only app checks)  
- [ ] Provider sees guest + booked chip; times shown in EAT  

---

### Phase F — Cutover, Railway/Neon hardening, cleanup

**Outcome:** Pilot domain DB gone; prod-shaped deploy. Phase 2 tables still absent.

**Steps**

1. Remove domain `localStorage` / `mock-auth`.  
2. Align shared DTOs (`packages/shared` or `docs/api`) around `startsAt`/`endsAt`.  
3. Update `docs/guest-booking-phases.md`: Phase 3 auth/Postgres + Phase 1 Stripe leftover done; Phase 2 still open.  
4. Smoke script: health, register/login, approve, list, hold, checkout (test), webhook fixture, join, second-book conflict.  
5. Railway: healthcheck, migrate on release (Prisma + raw SQL), secrets from Neon/Stripe.  
6. Rate limit hold/checkout/join lightly.  
7. Confirm cookie settings on real HTTPS web + API hosts.  
8. Confirm schema has no `otp_codes`, `message_log`, `reviews`, or `provider_payouts`.

**Exit criteria**

- [ ] Full happy path on Railway + Neon + Stripe test  
- [ ] No domain writes to localStorage  
- [ ] Pending pros require `ADMIN_TOKEN` approve  
- [ ] Slot rows are UTC instants only  

---

## 6. Suggested order of PRs

| PR | Phase | Title sketch |
| --- | --- | --- |
| 1 | A | Prisma schema (UTC slots), partial unique index, Neon-ready seed, health/db |
| 2 | B | Public professionals/availability GET + web reads |
| 3 | C | Cookie sessions, auth, ADMIN_TOKEN approve, kill auto-approve |
| 4 | D | Pro availability/profile writes (`startsAt`/`endsAt`) |
| 5 | E | Transactional holds, sweeper, Stripe Checkout + webhook, join |
| 6 | F | Cutover, remove localStorage domain DB, deploy docs |

---

## 7. Mapping to existing docs

| Guest-booking tracker | This plan |
| --- | --- |
| Phase 1 pilot UI | Behavior reference (labels are display-only once on Postgres) |
| Phase 1 leftover: real Stripe | **Phase E (required)** |
| Phase 2 WhatsApp OTP/templates, Daily.co, `/b/<token>` UI | **Separate track — out of this program.** Keep `manageTokenHash` / `joinTokenHash` only |
| Phase 3 auth + Postgres | **Phases A–F** |

---

## 8. Risks and constraints

| Risk | Mitigation |
| --- | --- |
| Double-book | Transactional `UPDATE slots … WHERE status='open'` **and** partial unique index on `bookings(slot_id) WHERE status='upcoming'` |
| Expired holds stuck | Sweeper + lazy release; late webhook must not confirm a released hold |
| Timezone bugs | Store only UTC; provider grid = EAT; booker grid = local. Seed interprets sample labels as EAT |
| Prisma can’t model partial indexes | Raw SQL migration checked into `prisma/migrations` |
| `SameSite=None` without Secure | Prod always Secure+HTTPS; `COOKIE_SECURE=false` dev-only |
| Webhook before success redirect | Confirmation page tolerant of brief “processing” state |
| Webhook forging | Verify `STRIPE_WEBHOOK_SECRET`; raw body parser |
| Admin token leak | Railway secret; rotate; no token in web bundle |
| Neon pooling | Prefer Railway long-running Node + Neon URL per Prisma docs |
| Scope creep into Phase 2 | No `otp_codes` / `message_log`; no Daily.co client |

---

## 9. Ready to implement

All founder questions and the three schema/scope corrections are locked. **Start with Phase A** on a new branch from `master`.

Before first PR, ensure access to:

- Neon project + `DATABASE_URL`  
- Railway project for API  
- Stripe test keys + webhook endpoint secret (CLI for local)  
- Generated `ADMIN_TOKEN` and `SESSION_SECRET`  

---

## 10. Quick reference — files that will change most

| Area | Paths |
| --- | --- |
| API | `apps/api/src/**`, `apps/api/prisma/**` (include raw SQL migration) |
| Pilot removal | `apps/web/src/lib/db.ts`, `mock-auth.ts`, `session.tsx`, `pro-approval.ts` |
| Book/pay/join | `apps/web/src/app/client/**`, `join/**`, payment page → Checkout redirect |
| Availability | `apps/web/src/app/professional/availability/**` (EAT labels from `startsAt`) |
| Shared / docs | `packages/shared`, this file, `docs/guest-booking-phases.md`, README |

---

*Updated: Prisma · cookie sessions · Stripe Checkout+webhook (test) · ADMIN_TOKEN approval · Railway + Neon · slots as UTC `startsAt`/`endsAt` · Phase 2 WhatsApp/Daily.co excluded · partial unique index + hold sweeper · no reviews/payouts/otp/message_log tables.*
