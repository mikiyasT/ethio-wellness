# Ayzon

Monorepo for the **Ayzon** web app ([ayzoncare.com](https://ayzoncare.com)). The UI is scaffolded from `docs/ethio-wellness-ui-spec`.

## Apps

- `apps/web` — Next.js frontend (29 spec screens, design tokens, sample data)
- `apps/api` — Express API (Prisma + Neon Postgres; domain routes still return 501 until later phases)
- `packages/shared` — types, sample data, routes, and copy from the spec

## Run locally

Needs Node 20 or newer. This repo is set up for Node 24.

```bash
npm install
npm run dev:web
npm run dev:api
```

- Web: http://localhost:3000
- API health: http://localhost:4000/health (`db` is `up` when Postgres is reachable)

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

## Spec rules followed

- Guests can browse services and professionals without an account
- Auth gate appears only at book / pay / account
- Copy comes from `docs/ethio-wellness-ui-spec/content/copy.md`
- API request/response contracts are **not** in the UI spec, so backend modules return `501 unspecified_contract` until a product API spec exists
- Frontend screens currently read `packages/shared` sample data

## Docs

Put resources and specs in `docs/`. The extracted UI spec lives at `docs/ethio-wellness-ui-spec/`.
