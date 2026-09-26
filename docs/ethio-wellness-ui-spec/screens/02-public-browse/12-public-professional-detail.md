# Professional detail (`public-professional-detail`)

- **Purpose:** Full public profile of one professional with bookable 1-hour slots visible to everyone, including guests.
- **Who can see it:** All.
- **Layout regions:** Guest header · back link · two-column (profile content + sticky booking panel) · footer.
- **Visible UI elements:** Large avatar, name, title, city, rating/reviews/experience; language tags; specialty chips; About bio; facts list (session length 1 hour, video call, fee, languages); client reviews; booking panel — day-grouped slot chips (open / selected / booked-struck), "Book this slot" CTA, guest note ("Guests will be asked to sign in… then return right here").
- **Primary action:** "Book this slot · 4:00 PM" → guest: `auth-gate-to-book`; signed-in client: `client-book-session` with professional + slot carried over.
- **Secondary actions:** Slot chips select a time (updates CTA label); "← Back to professionals" → `public-professionals-list`.
- **Navigation:** Back → `public-professionals-list`. Book → `auth-gate-to-book` (guest) or `client-book-session` (client).
- **Fields:** Required vs optional — a slot must be selected before booking (CTA disabled until selection; default selects soonest open slot in this design).
- **Validation messages:** None on this screen.
- **Variants:** No-availability — `states/12-public-professional-detail-no-availability` (booking panel becomes "No open slots right now" + Browse similar). Booked slots render struck-through and disabled.
- **Responsive notes:** Desktop: sticky right booking panel. Mobile: profile stacks; booking panel becomes a sticky bottom bar with slot chips in a horizontal scroll row + full-width Book button.
- **Localization notes:** Bio and review text need generous line length; the fee row ("$25 / session") and slot labels ("4:00 PM") stay numeric; language names in native script must not be truncated in the facts list.
