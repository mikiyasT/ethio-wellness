# Booking confirmation — `client-booking-confirmation`

Purpose: Reassure the client that payment succeeded and their session is confirmed, and route them to their next step.

Who can see it: Signed-in clients immediately after a successful payment. Not reachable by guests or professionals.

Layout regions: Client topbar (My sessions marked active) · centered narrow column · success emblem · summary card · action stack · bottom nav (mobile) · site footer.

Visible UI elements:
- Gold circle with a large ✓ (success emblem)
- Heading: "You're booked!" + sub "Your session is confirmed. Take a breath — you've taken a good step."
- Summary card: pro avatar HT, "Hana Tesfaye", "Clinical Psychologist · Addis Ababa", rows for Service (Individual Mental Health), Date (Saturday, October 3, 2026), Time (4:00 PM – 5:00 PM EAT), Paid ($25.00), plus an info banner "🎥 Video link will appear in My sessions"
- Three buttons stacked: "View my sessions" (primary), "Back home" (secondary), "Keep browsing" (text)
- Language switcher (EN / አማ / ትግርኛ / Afaan Oromoo)

Primary actions (plain product language):
- "View my sessions" — opens the client's session list with the new booking at the top

Secondary actions:
- "Back home" — returns to the client home dashboard
- "Keep browsing" (text link) — goes to the public services browse to continue exploring

Navigation (screen ids):
- View my sessions → `18-client-my-sessions`
- Back home → `14-client-home`
- Keep browsing → `10-public-browse-services`

Fields: None on this screen.

Validation messages: None — this screen has no inputs.

Variants: Base frame only. (If a booking fails after payment, the product falls back to `28-generic-error`; no separate frame is defined.)

Responsive notes: Content centers in a narrow column that works at phone width without changes. Buttons are full-width stacked and ≥48px tall. ≤860px the top nav hides behind the `.bottomnav` (Sessions tab marked active).

Localization notes: The confirmation headline and encouragement line need native-speaker review per locale. Date/time formats localize with the user's locale. The "video link appears in My sessions" note must name the localized tab label so it matches what the client sees in the bottom nav.
