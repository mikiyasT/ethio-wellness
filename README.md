# Ayzon

Monorepo for the **Ayzon** web app ([ayzoncare.com](https://ayzoncare.com)). The UI is scaffolded from `docs/ethio-wellness-ui-spec`.

## Apps

- `apps/web` — Next.js frontend (29 spec screens, design tokens, sample data)
- `apps/api` — Express API (Prisma + Neon Postgres). Public directory reads are live; other domain routes still return 501.
- `packages/shared` — types, sample data, routes, and copy from the spec

## Run locally

Needs Node 20 or newer. This repo is set up for Node 24.

```bash
npm install
npm run dev:web
npm run dev:api
```

- Web: http://localhost:3000 (also on your LAN, because `dev` listens on `0.0.0.0`)
- API health: http://localhost:4000/health (`db` is `up` when Postgres is reachable)

Phone on the same Wi-Fi: open `http://<this-computer-lan-ip>:3000`. The counselor list calls that same address on port 4000, so it does not use the phone’s `localhost`. That is allowed only while `COOKIE_SECURE=false`. On this computer, keep using http://localhost:3000.

### API database (Phase A)

Copy `apps/api/.env.example` to `apps/api/.env`. Set `DATABASE_URL` to the Neon **pooled** URL and `DIRECT_URL` to the Neon **direct** URL (same string without `-pooler` in the host). `COOKIE_SECURE=false` is required for plain `http://localhost`.

Optional local Postgres instead of Neon:

```bash
docker compose up -d
```

Then point both URLs at `postgresql://ayzon:ayzon@localhost:5432/ayzoncare`.

Apply migrations and seed:

```bash
npm run db:setup -w @ethio-wellness/api
npm run dev:api
```

The seed deletes existing rows before inserting. It refuses to run when `NODE_ENV=production` unless `ALLOW_DESTRUCTIVE_SEED=true`. Seeded users share the password `AyzonDemo!2026`. Sample counselors are `approved`. `test.provider@example.com` stays `pending` until the `ADMIN_TOKEN` approve endpoint lands in a later phase. Slot times are stored as UTC instants; sample labels are interpreted as East Africa Time.

Railway: set the same env vars as secrets and use `npx prisma migrate deploy` as the release command. That command also applies the raw SQL partial unique index on `bookings(slot_id) WHERE status = 'upcoming'`.

### Public directory (Phase B)

Copy `apps/web/.env.example` to `apps/web/.env.local` and leave `NEXT_PUBLIC_USE_API=true` and `NEXT_PUBLIC_API_URL=http://localhost:4000`. That file is the local dev switch: the professionals list, profile, and open hours load from Postgres. Pending professionals are omitted (a direct profile URL is a 404). Slot chips are formatted in the browser’s timezone; the API still returns UTC `startsAt` / `endsAt`. Booking and sign-in still use the browser store until later phases.

```bash
curl -s http://localhost:4000/categories
curl -s http://localhost:4000/professionals
curl -s http://localhost:4000/professionals/hana-tesfaye/availability
```

### Sign-in (Phase C)

Register, login, logout, and the current user use an `ayzon_session` cookie (`httpOnly`). The value stored in Postgres is a hash of the cookie. Locally `COOKIE_SECURE=false`, so the cookie is `SameSite=Lax` and works between port 3000 and port 4000 on the same host. Production must set `COOKIE_SECURE=true`, which sends `SameSite=None; Secure` for a separate web and API host.

Seeded accounts use the password `AyzonDemo!2026`. Examples: `test.client@example.com` (client) and `test.provider@example.com` (professional, stays pending). A new professional is pending and does not appear in `GET /professionals` until approved:

```bash
curl -s -c /tmp/ayzon.cookies -H 'Content-Type: application/json' \
  -d '{"email":"test.client@example.com","password":"AyzonDemo!2026"}' \
  http://localhost:4000/auth/login
curl -s -b /tmp/ayzon.cookies http://localhost:4000/auth/me
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:4000/admin/professionals/PROFESSIONAL_ID/approve
```

Forgot-password does not send email yet. Outside production, the API log prints the reset link.

### Provider hours and profile (Phase D)

A signed-in professional loads and saves their own rows only. `GET` and `PUT /availability/me` use East Africa Time hour picks (`date` + `time` such as `10:00 AM`). The API stores UTC `startsAt` / `endsAt`. Booked and held hours are left in place. `GET` and `PATCH /professionals/me` read and update the profile, specialties, and fee. Pending professionals can save before they are approved; those hours show on the public profile only after approval.

## Spec rules followed

- Guests can browse services and professionals without an account
- Auth gate appears only at book / pay / account
- Copy comes from `docs/ethio-wellness-ui-spec/content/copy.md`
- API request/response contracts are **not** in the UI spec, so backend modules return `501 unspecified_contract` until a product API spec exists
- With `NEXT_PUBLIC_USE_API=true`, the public directory reads Postgres. Other screens still use the browser store

## Docs

Put resources and specs in `docs/`. The extracted UI spec lives at `docs/ethio-wellness-ui-spec/`.
