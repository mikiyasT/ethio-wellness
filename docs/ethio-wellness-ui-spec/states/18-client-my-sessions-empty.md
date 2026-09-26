# State: my sessions empty — `18-client-my-sessions-empty`

Frame: [../html/states/18-client-my-sessions-empty.html](../html/states/18-client-my-sessions-empty.html) — variant of `18-client-my-sessions`.

What changed vs the base My sessions screen: the tab bar (Upcoming / Past / Cancelled) is shown with no counts, and in place of the session cards there's a centered empty panel: a 📅 icon, "No sessions yet", "When you book a session it will appear here.", and a "Browse professionals" button.

When it appears: for signed-in clients who have never booked a session (e.g., right after onboarding with no bookings).

Notes for build: this is the first thing a brand-new client sees on the Sessions tab — the empty panel should feel welcoming, not like an error. "Browse professionals" goes to `11-public-professionals-list`.
