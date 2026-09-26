# Professional onboarding

**Screen id:** `professional-onboarding` (`20-professional-onboarding.html`)

**Purpose:** First step of professional signup — the professional introduces their practice with a photo, name, title, bio, specialties, and session languages.

**Who can see it:** A signed-in user who chose the "professional" role and hasn't finished onboarding yet. Not reachable for guests, clients, or finished professionals.

## Layout regions

1. **Top bar** — professional nav variant (Home, Bookings, Availability, Profile), language switcher, avatar circle "HT".
2. **Onboarding step indicator** — `.steps`: 1 · About (on), 2 · Specialties, 3 · Availability.
3. **Heading** — "Tell us about your practice" + subline: "This is the first step in joining Ethio Wellness. Clients will see this on your public profile, so write it like you're introducing yourself to someone new."
4. **Form card** — photo placeholder, display name, professional title, short bio, specialties chip set, languages checkboxes, "Add another language".
5. **Footer actions** — "← Back" text action + "Continue" primary action.
6. **Bottom nav (mobile only)** — Home, Bookings, Slots, Profile (on), Account.

## Visible UI elements

- Step indicator: 3 steps, step 1 "About" highlighted.
- Photo placeholder: large avatar circle (dashed border) with camera emoji; label "Profile photo"; help text "A clear, friendly photo helps clients feel comfortable reaching out."; button "Add photo".
- "Display name" text input, prefilled with the name from signup ("Hana Tesfaye").
- "Professional title" text input with placeholder "e.g. Clinical Psychologist, Licensed Counselor, Social Worker".
- "Short bio" textarea (prefilled example) + hint "Two or three sentences is plenty. Warm and plain beats formal."
- "Specialties (choose all that fit)" — the 8 category chips, multi-select; two pre-selected in the mock (Individual Mental Health, Grief and Loss).
- "Session languages (choose all you counsel in)" — checkboxes: Amharic አማርኛ, Tigrinya ትግርኛ, Afaan Oromoo, English. Text button "＋ Add another language".
- Buttons: "← Back" (text), "Continue" (primary, large).

## Actions

- **Continue** (primary): saves what was entered and moves to step 2, "Specialties" — `23-professional-specialties`.
- **Back** (secondary): returns to the previous signup step (role selection — `05-role-selection`).
- **Add photo** (secondary): opens the device photo picker; the chosen photo replaces the camera placeholder.
- **Add another language** (secondary): adds one more language row/checkbox to the list.

## Navigation

- Forward: `professional-onboarding` → Continue → `professional-specialties` (`23`)
- Back: `professional-onboarding` → Back → `role-selection` (`05`)
- Onboarding steps 2 and 3 are `professional-specialties` (`23`) and `professional-availability` (`24`)

## Required vs optional

| Field | Required | Optional |
|---|---|---|
| Profile photo | | ✓ |
| Display name | ✓ | |
| Professional title | ✓ | |
| Short bio | ✓ | |
| Specialties | ✓ (at least 1) | |
| Session languages | ✓ (at least 1) | |

## Validation messages

- Continue with empty display name: "Please enter your display name."
- Continue with empty title: "Please enter your professional title."
- Continue with empty bio: "Please write a short bio so clients know who you are."
- Continue with no specialty selected: "Please choose at least one specialty."
- Continue with no language checked: "Please choose at least one session language."

## Variants (states)

- None for this screen. After onboarding completes, profile editing continues on `professional-profile` (`22`).

## Responsive notes

- Shared CSS handles mobile: form card stacks full width; the photo row stacks vertically; chips wrap; top nav collapses to `.bottomnav` (Profile on). No separate mobile HTML.
- All interactive elements ≥44px tap targets (chips, checkboxes, buttons).

## Localization notes

- Language switcher (EN / አማ / ትግርኛ / Afaan Oromoo) is in the header.
- Language names shown bilingually: "Amharic አማርኛ", "Tigrinya ትግርኛ", "Afaan Oromoo", "English".
- Copy is warm and plain ("Warm and plain beats formal") — keep that tone in Amharic/Tigrinya/Afaan Oromoo translations; get a native speaker to review before launch.
