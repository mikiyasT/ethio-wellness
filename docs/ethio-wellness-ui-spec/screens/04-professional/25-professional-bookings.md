# Professional bookings

**Screen id:** `professional-bookings` (`25-professional-bookings.html`)

**Purpose:** Shows the professional the sessions clients have booked with them, split into upcoming and past.

**Who can see it:** Signed-in professionals only, via the Bookings nav item.

## Layout regions

1. **Top bar** — professional nav (Bookings active), language switcher, avatar "HT".
2. **Desktop grid** — `.app` with `.sidenav`: Home, Bookings (on), Availability, Specialties, Profile, Account.
3. **Page head** — "Your bookings" + subline: "Sessions clients have booked with you."
4. **Tabs** — Upcoming (on) / Past.
5. **Booking rows** — client avatar initials, client name, service, date/time, status `.tag`.
6. **Bottom nav (mobile only)** — Home, Bookings (on), Slots, Profile, Account.

## Visible UI elements

- Tabs: "Upcoming" (active), "Past".
- Upcoming rows:
  - Miki Teshome (MT, av-2) · Individual Mental Health · Sat Oct 3 · 4:00 PM – 5:00 PM EAT · Video call · tag "Confirmed"
  - Daniel H. (DH, av-4) · Individual Mental Health · Sat Oct 3 · 6:00 PM – 7:00 PM EAT · Video call · tag "Confirmed"
  - Sara B. (SB, av-3) · Family Counseling · Tue Oct 6 · 1:00 PM – 2:00 PM EAT · Video call · tag "Confirmed"
- Past tab (switch tabs to see): Selam K. (SK, av-8) · Grief and Loss · Fri Oct 2 · tag "Completed".

## Actions

- **Switch tabs** (secondary): Upcoming ↔ Past.
- Tapping a row opens the session detail (`client-session-detail` equivalent for professionals — shown in a later group; in the mock, rows are static).

## Navigation

- From: topnav/sidenav Bookings, `.bottomnav` Bookings, or the "View all bookings" quick action on `professional-home` (`21`).
- Rows lead to session detail (scope: another screen group).
- Empty state: `states/25-professional-bookings-empty`.

## Required vs optional

- No form fields on this screen.

## Validation messages

- None on this screen.

## Variants (states)

- `states/25-professional-bookings-empty.html` — no bookings at all: `.empty` panel "No bookings yet" / "When clients book your open slots they'll appear here." + button "Manage availability" → `professional-availability` (`24`).
- Past tab: same list style with "Completed" tags.

## Responsive notes

- Rows stack full width on mobile; avatar stays left, status tag stays right (wraps under on very small screens if needed); `.bottomnav` shows (Bookings on). No separate mobile HTML.
- Rows are ≥44px tap targets.

## Localization notes

- Date/time formats are locale-aware in the real UI (EAT shown in the mock).
- Status labels ("Confirmed", "Completed") need translations in all four product languages.
- Client names are proper nouns — don't translate them.
