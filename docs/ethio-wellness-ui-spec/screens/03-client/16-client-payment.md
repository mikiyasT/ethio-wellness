# Client payment — `client-payment`

Purpose: Let a client pay for the session they just reviewed and complete the booking.

Who can see it: Signed-in clients mid-booking (step 3 of Slot → Review → Payment). Not shown to guests (they hit the auth gate earlier) or professionals.

Layout regions: Client topbar (logo, nav with Professionals active, language switcher, avatar) · centered narrow content column · step indicator (1 Slot done, 2 Review done, 3 Payment on) · Order summary card · Payment details card · bottom nav (mobile) · site footer.

Visible UI elements:
- `.steps`: "1 · Slot" (done), "2 · Review" (done), "3 · Payment" (on)
- Heading: "Complete your booking" + sub "Your slot is held while you pay. You're almost done."
- Order summary card: pro avatar HT, "Hana Tesfaye", "Clinical Psychologist · Addis Ababa", rows for Service (Individual Mental Health), Date (Saturday, October 3, 2026), Time (4:00 PM – 5:00 PM EAT (1 hour)), Total due ($25.00)
- Payment card: Cardholder name, Card number, Expiry (MM / YY), CVC fields; Pay button reading "Pay $25.00"
- Small note under the button: "Demo checkout — no real payment is processed."
- Language switcher (EN / አማ / ትግርኛ / Afaan Oromoo)

Primary actions (plain product language):
- "Pay $25.00" (primary button) — submits the payment and finishes the booking

Secondary actions: none on this screen (the Back/change-slot path lives on the Review screen, `15-client-book-session`).

Navigation (screen ids):
- Pay $25.00 (success) → `17-client-booking-confirmation`
- Pay $25.00 (processing) → frame `states/16-client-payment-processing`
- Pay $25.00 (declined) → frame `states/16-client-payment-failed`
- Browser back → `15-client-book-session`

Fields: Cardholder name — required. Card number — required (16 digits, spaced). Expiry — required (MM/YY, must not be in the past). CVC — required (3–4 digits).

Validation messages:
- Empty cardholder name: "Please enter the name on the card."
- Card number too short/invalid: "This card number doesn't look right — please check it."
- Expiry in the past or malformed: "Please enter a valid future date (MM / YY)."
- CVC too short: "Please enter the 3–4 digit security code."
- Payment declined: error banner — "Your card was declined. No charge was made. Please try another card." with a "Try again" button (see failed state).

Variants:
- Default frame — ready to pay
- `states/16-client-payment-processing.html` — Pay button shows a spinner and reads "Processing…" with all card fields disabled
- `states/16-client-payment-failed.html` — red `.alert.err` with the decline message and a "Try again" button

Responsive notes: `.two-col` (Expiry/CVC side by side on desktop) stacks to single column on mobile. `page-narrow` centers content; ≤860px the top nav hides behind the `.bottomnav`. All inputs are ≥50px tall for easy tapping.

Localization notes: Fee always shows "$25.00" with the total spelled out in the pay button per locale. Date/time formats localize (Ethiopian calendar display for Amharic locale is a known open question — confirm before build). The "Demo checkout" note must be translated so test users never confuse it with real payment.
