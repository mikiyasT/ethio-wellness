# Ayzon

Monorepo for the **Ayzon** web app ([ayzoncare.com](https://ayzoncare.com)). The UI is scaffolded from `docs/ethio-wellness-ui-spec`.

## Apps

- `apps/web` — Next.js frontend (29 spec screens, design tokens). Directory, booking, and accounts read and write the API
- `apps/api` — Express API (Prisma + Neon Postgres, Stripe Checkout in test mode)
- `packages/shared` — types, sample data, routes, and copy. Slot and booking instants use UTC `startsAt` / `endsAt`

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

Railway: point the service at the repository root. `railway.toml` builds the API, runs `npm run db:migrate -w @ethio-wellness/api` before each deploy, and health-checks `GET /health`. That migrate command also applies the raw SQL partial unique index on `bookings(slot_id) WHERE status = 'upcoming'`.

Set these as Railway secrets (do not commit them): `DATABASE_URL` (Neon pooled), `DIRECT_URL` (Neon direct), `SESSION_SECRET`, `ADMIN_TOKEN`, `CORS_ORIGIN` (the HTTPS web origin), `COOKIE_SECURE=true`, `PUBLIC_WEB_URL` (the HTTPS web origin), `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` from the Stripe dashboard endpoint that points at `https://<api-host>/stripe/webhook`. With `COOKIE_SECURE=true` the session cookie is `Secure` and `SameSite=None`, so both the website and the API must be HTTPS. Leave `COOKIE_SECURE=false` on this computer.

### Public directory (Phase B)

Copy `apps/web/.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:4000`. The professionals list, profile, open hours, and booking flow load from Postgres. Pending professionals are omitted (a direct profile URL is a 404). Slot chips for a booker are formatted in the browser’s timezone; the provider calendar stays on East Africa Time. The API stores UTC `startsAt` / `endsAt` only.

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

A signed-in professional loads and saves their own rows only. `GET` and `PUT /availability/me` use East Africa Time hour picks (`date` + `time` such as `10:00 AM`). The API stores UTC `startsAt` / `endsAt`. Booked and held hours are left in place. `GET` and `PATCH /professionals/me` read and update the profile and specialties. `feeCents` stays on the record as the platform session price (pilot default $25). There is no fee control for professionals.

### Paid booking (Phase E)

A guest or signed-in client holds an open hour for 10 minutes (`POST /bookings/holds`), adds an email (`PATCH /bookings/holds/:id`), then `POST /bookings/holds/:id/checkout` returns a Stripe Checkout URL. The amount is that professional’s `feeCents` in USD test mode. Only the webhook (`POST /stripe/webhook`, `checkout.session.completed`) confirms the booking. There is no pay-without-Stripe endpoint.

On confirm the API stores `sessionCode`, `manageTokenHash`, and `joinTokenHash`. The raw tokens are not stored. Join is `GET /bookings/join?code=&email=` and does not return a video-room URL. A hold that expires is cancelled and the hour opens again. A Checkout that finishes after that does not take the hour back. Cancelling an upcoming booking sets a status other than `upcoming`, which releases the one-booking-per-slot rule, and the hour opens again.

Local webhook forwarding:

```bash
stripe listen --events checkout.session.completed --forward-to localhost:4000/stripe/webhook
```

Put the CLI’s signing secret in `STRIPE_WEBHOOK_SECRET`. Use card `4242 4242 4242 4242` in Stripe test mode. Success returns to `/client/booking-confirmation`, which waits until the webhook marks the booking upcoming. Cancelling a paid booking does not refund it; pilot refunds are done in the Stripe dashboard.

Hold, checkout, and join are rate limited per IP (20 holds, 10 checkouts, and 30 join lookups per 10 minutes).

### Cutover (Phase F)

The browser does not keep a domain database. Login uses the API only. Shared types `SlotInstant` and `BookingInstant` are the UTC shape. Phase 2 tables (`otp_codes`, `message_log`, `reviews`, `provider_payouts`) are not in the schema.

With the API running:

```bash
npm run smoke -w @ethio-wellness/api
```

That checks health, register, login, approve, the public list, a hold, Stripe Checkout, a signed webhook, join, and the one-upcoming-booking index. It deletes the rows it creates.

## Spec rules followed

- Guests can browse services and professionals without an account
- Auth gate appears only at book / pay / account
- Copy comes from `docs/ethio-wellness-ui-spec/content/copy.md`
- The public directory, provider hours, accounts, and paid booking flow use Postgres and Stripe test mode

## Docs

Put resources and specs in `docs/`. The extracted UI spec lives at `docs/ethio-wellness-ui-spec/`.
