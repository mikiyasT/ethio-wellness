# Professional specialties

**Screen id:** `professional-specialties` (`23-professional-specialties.html`)

**Purpose:** Lets the professional choose which counseling specialties appear on their public profile, so clients can find and book them by specialty.

**Who can see it:** Signed-in professionals only. This page is also step 2 of professional onboarding (reached from `professional-onboarding` step 1 — `20`), and later reachable anytime from the sidenav.

## Layout regions

1. **Top bar** — professional nav (Profile active), language switcher, avatar "HT".
2. **Desktop grid** — `.app` with `.sidenav`: Home, Bookings, Availability, Specialties (on), Profile, Account.
3. **Page head** — "Your specialties" + subline: "Choose the areas you counsel in. Clients browse and book by specialty."
4. **Search** — "Search specialties…" input.
5. **Chip grid** — the 8 starter categories in `.on` (selected) / `.off` (unselected) states.
6. **Growth note** — "New specialties are added as more professionals join — the list keeps growing. If none of these fit, tell us in support."
7. **Actions row** — "Save" primary + "Cancel" text.
8. **Bottom nav (mobile only)** — Home, Bookings, Slots, Profile (on), Account.

## Visible UI elements

- Search input with placeholder "Search specialties…".
- 8 category chips with emoji: 🧠 Individual Mental Health (on), 💛 Couples Counseling (off), 👨‍👩‍👧 Family Counseling (off), 🌱 Addiction & Recovery (off), 🕊️ Grief and Loss (on), 🎓 Youth and Students (off), 🕯️ Faith-informed Counseling (off), 💼 Career and Life Stress (off).
- Buttons: "Save" (primary, large), "Cancel" (text).

## Actions

- **Save** (primary): saves the selected specialties and goes to `professional-home` (`21`).
- **Cancel** (secondary): discards changes and goes back — to `professional-home` (`21`) for existing professionals, or back to onboarding step 1 (`professional-onboarding`, `20`) when part of onboarding.
- Tapping a chip toggles it on/off immediately (visual only until saved).
- Typing in the search box filters the chip list to matching categories.

## Navigation

- From onboarding: `20-professional-onboarding` → Continue → this screen (`23`); Save continues to `24-professional-availability` (onboarding step 3).
- From sidenav: Specialties → this screen (`23`); Save → `professional-home` (`21`).
- Growth note links to Support/contact.

## Required vs optional

- Specialties: **at least 1 required** (optional count beyond that — multi-select).

## Validation messages

- Save with none selected: "Please choose at least one specialty."

## Variants (states)

- None. The growth note itself is the extensibility signal — the list grows as professionals join.

## Responsive notes

- Chips wrap and search input goes full width on mobile; `.bottomnav` replaces the side nav (Profile on). No separate mobile HTML.
- Chips are ≥44px tap targets.

## Localization notes

- Category names need translation in Amharic, Tigrinya, and Afaan Oromoo before launch (pending native review); emoji stay the same across languages.
- Search matches across all languages once translations exist.
