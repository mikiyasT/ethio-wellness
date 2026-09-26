# State: professional detail — no availability

**Frame:** `states/12-public-professional-detail-no-availability.html` — variant of `12-public-professional-detail`.

**What changes:** The right-hand booking panel (day slots + "Book this slot" button) is replaced by an `.empty` panel:
- "No open slots right now"
- "Hana hasn't added new times yet. Check back soon or browse similar professionals."
- Button: "Browse similar professionals"

**Everything else stays the same:** header (guest variant), profile card, reviews, footer.

**When shown:** The professional has no open slots on any visible day.

**Navigation:** "Browse similar professionals" → `public-professionals-list` (`11`). Back link unchanged.

**Responsive:** Same as screen 12 — aside stacks below the profile card on mobile.

**Localization:** The professional's first name ("Hana") is interpolated into the sentence — keep proper grammar order per language (native review needed).
