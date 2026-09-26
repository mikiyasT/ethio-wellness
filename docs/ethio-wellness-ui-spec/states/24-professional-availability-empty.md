# State: availability — empty date

**Frame:** `states/24-professional-availability-empty.html` — variant of `24-professional-availability`.

**What changes:** The slot grid is replaced by an `.empty` panel:
- "No slots on this date yet"
- "Tap times to open them for booking."

**Everything else stays the same:** header, day chips row (selected day shown, e.g. Sun Oct 4), warning note about booked slots, bottomnav (Slots on).

**When shown:** The professional picks a day that has no slots at all.

**Navigation:** Same as screen 24 — day chips switch days; this state returns to the slot grid once a slot exists.

**Responsive:** Same as screen 24.

**Localization:** Empty copy needs translation in all four languages; keep the calm tone ("No slots on this date yet" — not an error, just an invitation).
