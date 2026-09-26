# Sitemap — Ethio Wellness Information Architecture

## The three nav systems

### 1. Guest header (desktop) — shown on all public screens
- **Home** → `welcome-home`
- **Services** → `public-browse-services`
- **Professionals** → `public-professionals-list`
- **Sign in** → `login`
- **Create account** → `register`
- **Language switcher** (EN / አማ / ትግርኛ / Afaan Oromoo) — on every screen, switches UI locale (see `content/localization-notes.md`)
- Guest mobile: same links in a hamburger/drawer; **no bottom nav**.

### 2. Client nav (signed in) — desktop header
- **Home** → `client-home`
- **Services** → `public-browse-services`
- **Professionals** → `public-professionals-list`
- **My sessions** → `client-my-sessions`
- **Account** (avatar "MT") → `account-settings`
- Client mobile bottom nav (4 items + account): Home → `client-home` · Professionals → `public-professionals-list` · Sessions → `client-my-sessions` · Account → `account-settings`

### 3. Professional nav (signed in) — desktop header
- **Home** → `professional-home`
- **Bookings** → `professional-bookings`
- **Availability** → `professional-availability`
- **Profile** → `professional-profile`
- **Account** (avatar "HT") → `account-settings`
- Professional mobile bottom nav (5 items): Home → `professional-home` · Bookings → `professional-bookings` · Availability → `professional-availability` · Profile → `professional-profile` · Account → `account-settings`

Active link is marked with `.active`. `specialties` and `onboarding` screens are reached from professional pages (onboarding after role selection; specialties from profile). `client-onboarding` is reached after client registration, followed by `client-onboarding-preferences` (step 2). `session-detail`, `book-session`, `payment`, `booking-confirmation` are flow screens, not nav items.

## Full screen index, grouped by folder

### `screens/01-marketing-and-auth/` — Guest
| # | Screen id | Route/role | Purpose |
|---|-----------|------------|---------|
| 01 | `splash-or-loading` | Guest | Brand splash / loading |
| 02 | `welcome-home` | Guest | Marketing home: hero, categories, featured professionals, how it works |
| 03 | `login` | Guest | Sign in |
| 04 | `register` | Guest | Create free account |
| 05 | `role-selection` | Guest | "I am a…" client vs. professional choice after registration |
| 06 | `forgot-password` | Guest | Request password reset |
| 07 | `reset-password` | Guest | Set a new password |
| 08 | `session-expired` | Guest | "Your session expired — please sign in again" |
| 09 | `auth-gate-to-book` | Guest | Modal over a slot: sign in / create account / keep browsing |

### `screens/02-public-browse/` — Public (no login needed)
| # | Screen id | Purpose |
|---|-----------|---------|
| 10 | `public-browse-services` | Category grid with search + "See all categories" |
| 11 | `public-professionals-list` | Directory with specialty/language/search filters |
| 12 | `public-professional-detail` | Profile: bio, specialties, languages, rating, weekly slots; Book CTA → auth gate |

### `screens/03-client/` — Client (signed in)
| # | Screen id | Purpose |
|---|-----------|---------|
| 13 | `client-onboarding` | Post-registration step 1: display name, preferred languages, intro |
| 13b | `client-onboarding-preferences` | Post-registration step 2: preferred languages (carried over) + types of support |
| 14 | `client-home` | Personalized home: next session, recommended professionals |
| 15 | `client-book-session` | Pick a date + 1-hour slot, confirm details |
| 16 | `client-payment` | Mock checkout: "Complete your booking" (demo — no real payment) |
| 17 | `client-booking-confirmation` | "You're booked!" summary + next steps |
| 18 | `client-my-sessions` | Upcoming / past / cancelled tabs |
| 19 | `client-session-detail` | Session info, [Join session] when video link is ready, reschedule/cancel |

### `screens/04-professional/` — Professional (signed in)
| # | Screen id | Purpose |
|---|-----------|---------|
| 20 | `professional-onboarding` | "Tell us about your practice": bio, credentials, specialties, languages |
| 21 | `professional-home` | Dashboard: upcoming bookings, profile completeness, quick actions |
| 22 | `professional-profile` | Public-facing profile as the professional sees/edits it |
| 23 | `professional-specialties` | Manage specialties multi-select (links to profile) |
| 24 | `professional-availability` | "Your availability": date picker + tap 1-hour slots open/closed; legend Available/Booked |
| 25 | `professional-bookings` | Upcoming/past/cancelled booking list |

### `screens/00-shared/` — Shared
| # | Screen id | Purpose |
|---|-----------|---------|
| 26 | `account-settings` | Preferred language, email (read-only in v1), change password, sign out |
| 27 | `not-found` | 404: "Page not found" |
| 28 | `generic-error` | "Something went wrong — try again" |
