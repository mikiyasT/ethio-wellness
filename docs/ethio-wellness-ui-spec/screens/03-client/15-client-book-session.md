# Book session (`client-book-session`)

- **Purpose:** Review step before payment: confirm professional, service, slot, and add optional notes for the counselor.
- **Who can see it:** Client only (guests arrive here only after passing `auth-gate-to-book` + sign-in; the held slot is preserved).
- **Layout regions:** Client header · step indicator (1 Slot done · 2 Review on · 3 Payment) · narrow centered column: summary card, notes card, actions · mobile bottom nav.
- **Visible UI elements:** Professional header (avatar, name, title, language tags); facts (service, date, time 1 hour, video, fee $25.00); optional notes textarea ("Anything you'd like Hana to know…", "Shared privately with your counselor").
- **Primary action:** "Continue to payment" → `client-payment` with the booking draft carried over.
- **Secondary actions:** "← Change slot" → back to `public-professional-detail` keeping the professional.
- **Navigation:** Forward → `client-payment`. Back → `public-professional-detail`. If the held slot was taken meanwhile, show inline notice "That slot was just taken — pick another time" with a link back to the professional.
- **Fields:** Required — slot selection (inherited). Optional — counselor notes.
- **Validation messages:** None (no required input on this screen).
- **Variants:** Slot-taken notice (documented inline variant, no separate frame in v1).
- **Responsive notes:** Narrow column centers on desktop; on mobile the action row stacks with Continue full-width on top.
- **Localization notes:** The notes textarea placeholder should be localizable; fee display keeps numerals; date/time format follows the user's preferred app language (see `account-settings`).
