# State: bookings — empty

**Frame:** `states/25-professional-bookings-empty.html` — variant of `25-professional-bookings`.

**What changes:** The booking rows are replaced by an `.empty` panel:
- "No bookings yet"
- "When clients book your open slots they'll appear here."
- Button: "Manage availability"

**Everything else stays the same:** header, sidenav (Bookings on), Upcoming/Past tabs, bottomnav.

**When shown:** A new professional who has no bookings yet (on either tab).

**Navigation:** "Manage availability" → `professional-availability` (`24`) so they can open slots and start getting bookings.

**Responsive:** Same as screen 25.

**Localization:** Empty copy needs translation in all four languages; button label stays an action verb.
