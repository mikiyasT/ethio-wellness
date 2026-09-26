# Auth gate to book (`auth-gate-to-book`)

- **Purpose:** Friendly interruption shown when a guest taps Book — explains booking needs a free account and promises return to the same professional and slot after sign-in.
- **Who can see it:** Guest only (logged-in clients never see it; they go straight to `client-book-session`).
- **Layout regions:** Dimmed/blurred professional-detail page behind · centered modal dialog.
- **Visible UI elements:** Lock icon, title "Sign in to book this session", Amharic line "ይህን ቀጠሮ ለመያዝ ይግቡ", body naming the held slot ("Hana Tesfaye · Sat 4:00 PM"), three stacked buttons.
- **Primary action:** "Sign in" → `login`, then continues to `client-book-session` with the same professional and slot preserved.
- **Secondary actions:** "Create free account" → `register` (then `role-selection` → `client-onboarding` → back to `client-book-session` with slot held); "Continue browsing" → dismisses the modal, returns to `public-professional-detail` with the selected slot still highlighted.
- **Navigation:** Modal only — the page behind is `public-professional-detail`. No other exits.
- **Fields:** Required vs optional — none.
- **Validation messages:** None.
- **Variants:** None beyond this modal. If the held slot gets booked by someone else before the guest returns, the product shows an inline notice on `client-book-session` ("That slot was just taken — pick another time") — documented here, frame not required in v1.
- **Responsive notes:** Desktop: centered 480px modal over blurred page. Mobile: modal becomes a bottom sheet (full-width, rounded top, slide-up); buttons remain ≥48px.
- **Localization notes:** The Amharic title line is longer than the English — modal must grow vertically, never clip; button labels in Amharic need full-width stacked layout (already the design).
