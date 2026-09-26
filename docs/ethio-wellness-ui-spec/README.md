# Ethio Wellness — UI Specification Package

**Design spec only.** This folder/zip is a **UI specification**: screens, copy, components, tokens, flows, and sample data for a design and front-end team to build from. It contains **no code, no APIs, and no authentication implementation** — any mention of "sign in," "payment," or "session join" describes what the user sees and what the product should do, not how it's built.

**This is a rework, not a Flutter clone.** It takes the spirit and content of the older Flutter prototype (public services catalog, professional directory, booking) and redesigns it as a web-first, responsive experience — **1440×900 desktop** and **390×844 mobile** frames — with no expectation of matching the Flutter implementation's layout or behavior.

## Building from this spec (for Cursor / AI builders)

When this package and the clickable flow prototype disagree, **this spec wins** — always build from here. Authority order: (1) the per-screen `.md` companions plus their PNG frames, (2) `design-system/tokens.md` and `components.md`, (3) `content/copy.md` for every user-visible string. The flow prototype is a navigation aid for reviewing the journeys only; it is not a source of truth for layout, components, or copy. Do not invent screens, fields, or API contracts — if something is unspecified, flag it instead of guessing.

## Key product rules

- **Guests can browse without an account.** The public catalog (services, professionals, profiles, availability) is fully viewable by guests. The auth gate appears only at **book / pay / account** — booking needs a free account, payment needs a client session, account pages need a signed-in user.
- **Categories and languages are extensible by design.** The catalog shows 8 starter categories plus a "See all categories →" affordance and search — the UI must work with more. The language switcher supports EN / አማ / ትግርኛ / Afaan Oromoo; UI translations ship English-first with Amharic as a reviewed draft and the rest pending native review (see `content/localization-notes.md`).
- Copy is **warm and plain-spoken**, in English first. All visible strings are real (no lorem ipsum).

## Folder layout

```
ethio-wellness-ui-spec/
├── README.md                    ← you are here
├── sitemap.md                   ← information architecture + nav → screen mapping
├── user-flows.md                ← 7 key user flows
├── content/
│   ├── copy.md                  ← all English strings by screen + Amharic draft + Tigrinya/Oromoo status
│   ├── sample-data.md           ← professionals, categories, bookings, clients, slots
│   └── localization-notes.md    ← switcher behavior, Ethiopic script spacing, font class
├── design-system/
│   ├── tokens.md                ← colors, typography, spacing, radius
│   └── components.md            ← component inventory, states, rules
├── screens/                     ← 29 screens: per-screen .md companions + desktop/mobile PNG frames
│   ├── 00-shared/
│   ├── 01-marketing-and-auth/
│   ├── 02-public-browse/
│   ├── 03-client/
│   └── 04-professional/
└── states/                      ← variant frames (loading, empty, error states per screen)
```

- Each screen has a companion at `screens/<folder>/<order>-<screen-id>.md` describing purpose, layout, states, and interactions.
- Frame naming: `<order>-<screen-id>-desktop.png` = **1440×900**, `<order>-<screen-id>-mobile.png` = **390×844**.
- `states/` holds variant frames (e.g. `client-my-sessions-empty`, `public-professionals-list-no-results`) — stateful captures beyond the default screen shot.
- One extra variant frame lives beside its screen: `11-public-professionals-list-mobile-filtersheet.png` (mobile filters bottom sheet, open state) — documented in that screen's `.md` companion. It is a variant, not a new screen: the count stays **29 screens**.

## Complete screen index (29 screens)

| # | Screen id | Folder | Area |
|---|-----------|--------|------|
| 01 | `splash-or-loading` | 01-marketing-and-auth | Guest |
| 02 | `welcome-home` | 01-marketing-and-auth | Guest |
| 03 | `login` | 01-marketing-and-auth | Guest |
| 04 | `register` | 01-marketing-and-auth | Guest |
| 05 | `role-selection` | 01-marketing-and-auth | Guest |
| 06 | `forgot-password` | 01-marketing-and-auth | Guest |
| 07 | `reset-password` | 01-marketing-and-auth | Guest |
| 08 | `session-expired` | 01-marketing-and-auth | Guest |
| 09 | `auth-gate-to-book` | 01-marketing-and-auth | Guest (modal) |
| 10 | `public-browse-services` | 02-public-browse | Public |
| 11 | `public-professionals-list` | 02-public-browse | Public |
| 12 | `public-professional-detail` | 02-public-browse | Public |
| 13 | `client-onboarding` | 03-client | Client |
| 13b | `client-onboarding-preferences` | 03-client | Client |
| 14 | `client-home` | 03-client | Client |
| 15 | `client-book-session` | 03-client | Client |
| 16 | `client-payment` | 03-client | Client |
| 17 | `client-booking-confirmation` | 03-client | Client |
| 18 | `client-my-sessions` | 03-client | Client |
| 19 | `client-session-detail` | 03-client | Client |
| 20 | `professional-onboarding` | 04-professional | Professional |
| 21 | `professional-home` | 04-professional | Professional |
| 22 | `professional-profile` | 04-professional | Professional |
| 23 | `professional-specialties` | 04-professional | Professional |
| 24 | `professional-availability` | 04-professional | Professional |
| 25 | `professional-bookings` | 04-professional | Professional |
| 26 | `account-settings` | 00-shared | Shared |
| 27 | `not-found` | 00-shared | Shared |
| 28 | `generic-error` | 00-shared | Shared |

## What's in this package vs. not

**In scope:** every screen above (desktop + mobile frames), all user-visible copy, tokens, components, IA, flows, sample data, localization guidance, and state variants.

**Skipped / out of scope:** none of the 29 screens were skipped — **the set is complete**. Explicitly excluded by design: back-end APIs, authentication implementation, payment processing logic, real video-session infrastructure, database schemas, email/SMS delivery, and admin tooling. The checkout is a UI mock labeled "Demo checkout — no real payment is processed."
