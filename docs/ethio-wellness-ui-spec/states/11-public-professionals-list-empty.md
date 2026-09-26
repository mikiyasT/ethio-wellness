# State: professionals list — empty (`11-public-professionals-list-empty`)

- **Purpose:** What the guest sees when search + filters match no professionals.
- **Trigger:** Any filter/search combination with zero results (shown here: Tigrinya + Faith-informed + "xyz").
- **Visible UI elements:** Active filter chips remain visible (so the guest sees what filtered the list out); dashed empty panel with magnifier icon, "No matches found", "Try a different name, specialty, or language.", [Clear all filters].
- **Primary action:** "Clear all filters" → resets to the unfiltered `public-professionals-list`.
- **Responsive notes:** Same as the base list screen; the empty panel is full-width on mobile.
- **Localization notes:** "No matches found" and the hint must be translatable; keep the panel text to two short lines in Amharic.
