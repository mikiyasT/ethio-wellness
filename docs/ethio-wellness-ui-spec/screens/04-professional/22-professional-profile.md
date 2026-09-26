# Professional profile editor

**Screen id:** `professional-profile` (`22-professional-profile.html`)

**Purpose:** Lets the professional edit everything clients see on their public profile page.

**Who can see it:** Signed-in professionals only, via the Profile nav item. Clients and guests never see this page — they see `public-professional-detail` (`12`) instead.

## Layout regions

1. **Top bar** — professional nav (Profile active), language switcher, avatar "HT".
2. **Desktop grid** — `.app` with `.sidenav`: Home, Bookings, Availability, Specialties, Profile (on), Account.
3. **Page head** — "Your public profile" + note: "This is how clients see you."
4. **Profile form card** — photo, name, title, city/region, bio, detailed description, languages.
5. **Actions row** — "Save changes" primary + "Discard" text.
6. **Bottom nav (mobile only)** — Home, Bookings, Slots, Profile (on), Account.

## Visible UI elements

- "Your public profile" heading; reassurance note "This is how clients see you. Keep it warm and up to date."
- Photo placeholder: avatar circle with dashed border + camera emoji; "Change photo" button; help text "A clear, friendly photo helps clients feel comfortable reaching out."
- "Display name" text input (filled: "Hana Tesfaye").
- "Professional title" text input (filled: "Clinical Psychologist").
- "City / region" dropdown: Addis Ababa (selected), Mekelle, Adama, Hawassa, Bahir Dar, Diaspora.
- "Short bio" textarea (filled).
- "More about your practice (optional)" textarea with placeholder prompting for specialties enjoyed, first-session expectations, and pre-booking notes (filled in the mock).
- "Session languages" checkboxes: Amharic አማርኛ (checked), Tigrinya ትግርኛ, Afaan Oromoo, English (checked).
- Buttons: "Save changes" (primary, large), "Discard" (text).

## Actions

- **Save changes** (primary): saves the profile and shows a confirmation; returns to or stays on this page.
- **Discard** (secondary): throws away unsaved edits and restores the last saved values — asks to confirm first if there are unsaved changes.
- **Change photo** (secondary): opens the photo picker; the chosen photo replaces the placeholder.

## Navigation

- From: sidenav/Profile (this screen, `22`), also reachable from professional home quick action "Edit profile" (`21`).
- Save changes → stays on `professional-profile` (`22`) with a saved confirmation.
- "City / region" and specialties editing relate to `professional-specialties` (`23`) and `public-professional-detail` (`12`, what clients see).

## Required vs optional

| Field | Required | Optional |
|---|---|---|
| Display name | ✓ | |
| Professional title | ✓ | |
| City / region | ✓ | |
| Short bio | ✓ | |
| More about your practice | | ✓ |
| Session languages | ✓ (at least 1) | |
| Photo | | ✓ (recommended) |

## Validation messages

- Empty display name on save: "Please enter your display name."
- Empty title on save: "Please enter your professional title."
- Empty short bio on save: "Please write a short bio so clients know who you are."
- No language checked on save: "Please choose at least one session language."

## Variants (states)

- None — this is the only state of the profile editor. The read-only client-facing result is `12-public-professional-detail` (+ its no-availability state).

## Responsive notes

- Desktop uses the `.app` grid with the side nav; mobile collapses to a single column with `.bottomnav` (Profile on). No separate mobile HTML.
- ≥44px tap targets on all inputs, checkboxes, and buttons; the textarea grows with the keyboard.

## Localization notes

- Language switcher in the header; city list includes "Diaspora" for professionals abroad.
- Language names shown bilingually ("Amharic አማርኛ", "Tigrinya ትግርኛ").
- Bio guidance stays warm and plain in every translation; native-speaker review required before launch.
