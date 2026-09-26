# My sessions — `client-my-sessions`

Purpose: Give the client one place to see every session they've booked — upcoming, past, and cancelled.

Who can see it: Signed-in clients only. Guests never reach this screen (it's behind sign-in).

Layout regions: Client topbar (My sessions active) · page heading · tab bar (Upcoming / Past / Cancelled) · session card list · bottom nav (mobile) · site footer.

Visible UI elements:
- Heading: "My sessions" + sub "Everything you've booked, all in one place."
- `.tabs` with counts: Upcoming (2), Past (2), Cancelled (1); Upcoming is the active tab
- Session cards (`.sess`) — each with pro initial-circle avatar, pro name + service, date/time, price:
  - Upcoming: Hana Tesfaye · Individual Mental Health — Saturday, Oct 3, 4:00 PM – 5:00 PM EAT, $25.00, "Join session" (primary button, video link ready)
  - Upcoming: Tigist Haile · Family Counseling — Tuesday, Oct 6, 6:00 PM – 7:00 PM EAT, $25.00, note "⏰ Video link coming soon", "Details" (secondary button)
  - Past: Dawit Mekonnen · Career and Life Stress — Saturday, Sep 12, 2026, Completed, $25.00, green "Completed" tag
  - Past: Almaz Girma · Individual Mental Health — Friday, Aug 28, 2026, Completed, $25.00, green "Completed" tag
  - Cancelled: Samuel Bekele · Couples Counseling — Saturday, Sep 5, 2026, "Cancelled by you" in red text, no action button
- Language switcher (EN / አማ / ትግርኛ / Afaan Oromoo)

Primary actions (plain product language):
- "Join session" — opens the video call for a session whose link is ready (opens ~10 minutes before start)
- "Details" — opens the session detail screen (`19-client-session-detail`) for the session

Secondary actions:
- Switching tabs (Upcoming / Past / Cancelled) — swaps the list to that group

Navigation (screen ids):
- Join session (Hana) → video call (outside spec scope; returns here after)
- Details (Tigist) → `19-client-session-detail`
- Empty-state button "Browse professionals" → `11-public-professionals-list`

Fields: None on this screen.

Validation messages: None — this screen has no inputs.

Variants:
- Default frame — Upcoming tab active with the two upcoming cards (this spec file renders all three tab panels' content stacked so every card is inspectable)
- `states/18-client-my-sessions-empty.html` — tab bar plus an `.empty` panel: "No sessions yet / When you book a session it will appear here." with a "Browse professionals" button

Responsive notes: Session cards stack vertically at all widths; on mobile the action buttons wrap below the session text. ≤860px the top nav hides behind the `.bottomnav` (Sessions tab marked active). Tab bar scrolls horizontally if labels overflow on narrow screens. All buttons ≥44px.

Localization notes: Tab labels (Upcoming/Past/Cancelled) and status words (Completed, Cancelled by you) must be translated per locale. Date formats localize; EAT timezone label stays but is explained in help text for diaspora clients. The "Video link coming soon" note should read naturally in each language — literal translation may sound technical.
