# Ethio Wellness

Monorepo for the Ethio Wellness web app. The UI is scaffolded from `docs/ethio-wellness-ui-spec`.

## Apps

- `apps/web` — Next.js frontend (29 spec screens, design tokens, sample data)
- `apps/api` — Express backend skeleton (health check + domain modules)
- `packages/shared` — types, sample data, routes, and copy from the spec

## Run locally

Needs Node 20 or newer. This repo is set up for Node 24.

```bash
npm install
npm run dev:web
npm run dev:api
```

- Web: http://localhost:3000
- API health: http://localhost:4000/health

## Spec rules followed

- Guests can browse services and professionals without an account
- Auth gate appears only at book / pay / account
- Copy comes from `docs/ethio-wellness-ui-spec/content/copy.md`
- API request/response contracts are **not** in the UI spec, so backend modules return `501 unspecified_contract` until a product API spec exists
- Frontend screens currently read `packages/shared` sample data

## Docs

Put resources and specs in `docs/`. The extracted UI spec lives at `docs/ethio-wellness-ui-spec/`.
