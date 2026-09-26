# Browse services (`public-browse-services`)

- **Purpose:** Category directory where guests discover counseling types; designed to grow beyond the starter set.
- **Who can see it:** All (guest-first; logged-in users too).
- **Layout regions:** Guest header · page head + category search · featured grid · all-services grid · "more coming" panel · footer.
- **Visible UI elements:** Title "What kind of support are you looking for?", search input ("Search categories…"), 4 featured category cards + 4 more category cards (icon, name, one-line description), dashed "More services are on the way" panel with "Request a service".
- **Primary action:** Tapping a category card → `public-professionals-list` pre-filtered to that category.
- **Secondary actions:** Search filters the visible cards inline; "Request a service" opens a simple request form (v1: mailto-style capture — frame not required, documented).
- **Navigation:** Header as on `welcome-home`. Every category card → `public-professionals-list` (filtered).
- **Fields:** Required vs optional — search is optional, filters live.
- **Validation messages:** None. If search matches nothing, show the "no matches" empty pattern (same as `states/11-public-professionals-list-empty`).
- **Variants:** None required beyond the search-no-match reuse.
- **Responsive notes:** Desktop 4-col grid → mobile 2-col; search stays full-width; cards keep icon + name + short description, truncating description to 2 lines on mobile.
- **Localization notes:** Category names in Amharic run long (e.g. "የግለሰብ ስነ-ልቦና") — cards must allow two-line titles without breaking grid alignment; the search placeholder must not assume English-only width.
