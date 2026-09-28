# Cursor development log

Entries after each pushed work session. Buddy reviews against `docs/ethio-wellness-ui-spec/` and writes `docs/buddy-review.md`.

## 2026-09-28 — Buddy review P0–P2 fixes (session start)

### Changed
- **P0 privacy:** Replaced real name `Miki Teshome` with fictional client **Abel Desta** (AD) in sample data, copy greeting, payment/onboarding defaults, header avatar, account email.
- **Session stub:** `useSession()` React context (`apps/web/src/lib/session.tsx`) with localStorage; chrome/role no longer derived only from URL. Guests hitting `/client/*` or `/account` redirect to login with `?next=`.
- **Booking funnel:** Detail Book passes `?pro=&slot=`; book/payment/confirmation resolve context via `resolveBookingContext` (fallback `professionals[0]`). AuthGate + login/register honor `?next=`. Signed-in clients skip AuthGate (Flow 3).
- **Session detail:** Back link, disabled Reschedule + v1 note, Cancel as red text + confirm banner, fixed Format vs video label duplication, cancel → sessions `?tab=cancelled`.
- **Pro onboarding:** 3-step About → Specialties → Availability with step indicator, multi-select + validation, draft in localStorage, Back to role selection.
- **Specialties / Profile / Availability:** Search, Cancel, growth note, Save navigation; profile editor (cities, bio, languages, Save/Discard + preview); slot status `closed`, open↔closed toggle, booked locked, Save + legend + date chips + empty day.
- **Pilot approval (product decision: yes):** `professionalStatus: pending|approved` on session; `/professional/pending` “application under review” after onboarding; sample pros marked approved where set.
- **P2:** Login sets mock session (`// TODO: replace with real auth`); dashboard profile checklist + disabled Join with video note; TI/OM marked Coming soon in language switchers.

### Spec / screens
- Flow 1 & 3 booking + auth gate; `19-client-session-detail`; `20/22/23/24` professional onboarding/profile/specialties/availability; account language/sign-out.

### Unfinished
- Real auth / payment / video join.
- Amharic (and other) strings for new copy keys still EN-only.
- E2E not run in this session; Buddy should verify phone LAN + booking `?next=` round-trip.
- Admin UI to flip `pending` → `approved` (API stubs exist in `professional-approval.ts`).

### Review
- Confirm cancel banner + cancelled tab landing.
- Confirm pro pending gate does not block profile edit during review.
- Confirm Book as guest → login → lands on `/client/book?pro=…&slot=…`.
- Demo login: `hana@example.com` → approved pro; any other email → client Abel (see `mock-auth.ts`).

### Product decision
- **Pilot requires manual provider approval.** Documented via pending status + `/professional/pending` screen + API stubs in `apps/web/src/lib/professional-approval.ts`.

### 2026-09-28 — Professional availability calendar (spec 24)

- Rebuilt `/professional/availability` with month **calendar date picker**, scrollable **day chips**, and a full **1-hour slot grid** (9 AM–8 PM).
- Tap toggles open ↔ closed; booked stays locked; empty-date hint; save validations (`No changes` / close-day confirm).
- Persist to localStorage; reachable from pro dashboard, sidebar, profile, and onboarding step 3.
