# Professional availability

**Screen id:** `professional-availability` (`24-professional-availability.html`)

**Purpose:** Lets the professional open 1-hour slots on chosen dates so clients can book sessions with them.

**Who can see it:** Signed-in professionals only. Also onboarding step 3 (reached from `professional-specialties` — `23`).

## Layout regions

1. **Top bar** — professional nav (Availability active), language switcher, avatar "HT".
2. **Page head** — "Your availability" + explainer: "Pick a date, then tap 1-hour slots to open them for booking."
3. **Day chips row** — Sat Oct 3 (on), Sun Oct 4, Mon Oct 5, Tue Oct 6, Wed Oct 7.
4. **Slot grid** — `.slot-grid` for the chosen day: 9:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 1:00 PM (available), 2:00 PM (booked, dashed/strikethrough), 4:00 PM and 6:00 PM (selected/open, `.sel`).
5. **Legend** — Available / Booked / Selected, shown as mini slot swatches.
6. **Actions** — "Save availability" primary button.
7. **Warning note** — "⚠️ Booked slots can't be removed — contact support to change a confirmed session."
8. **Bottom nav (mobile only)** — Home, Bookings, Slots (on), Profile, Account.

## Visible UI elements

- Day chips (Sat Oct 3 through Wed Oct 7), one active at a time.
- Slot buttons with time + sublabel ("Available"/"Booked"); booked slots use an amber gradient card (no strikethrough) with client first name and payout; they are not tappable.
- Legend swatches: Available, Booked, Selected.
- "Save availability" button.
- Warning note about booked slots and support.

## Actions

- **Pick a day** (secondary): switches the slot grid to that day; unsaved changes stay until saved or reverted.
- **Tap a slot** (secondary): toggles it open/closed for booking. Booked slots can't be tapped.
- **Save availability** (primary): saves the slot changes for the visible days; clients see the new open slots on `public-professional-detail` (`12`).

## Navigation

- From onboarding: `23-professional-specialties` → Save → this screen (`24`); Save here finishes onboarding → `professional-home` (`21`).
- From sidenav/topnav: Availability → this screen (`24`).
- Empty-date state: `states/24-professional-availability-empty`.

## Required vs optional

- At least **one open slot** per saved day is recommended but not required; a day may have zero slots (shows the empty state).

## Validation messages

- Save with all slots closed on a previously open day: "Saving will close all your slots for this day. Clients won't be able to book it." (confirm before saving).
- Save with no slot changes: "No changes to save."

## Variants (states)

- `states/24-professional-availability-empty.html` — a day with no slots: `.empty` panel "No slots on this date yet" / "Tap times to open them for booking." No save button until a slot is chosen.

## Responsive notes

- Slot grid collapses from 4 to 3 columns on mobile; day chips scroll horizontally if needed; `.bottomnav` shows (Slots on). No separate mobile HTML.
- Slots and day chips are ≥44px tap targets.

## Localization notes

- Time slots shown in local time (EAT in the mock); date formats and weekday names need locale-aware formatting in real UI.
- Legend labels (Available / Booked / Selected) and the support note need translations; "Booked" must stay unmistakable in every language.
