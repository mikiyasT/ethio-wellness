# Session detail — `client-session-detail`

Purpose: Show a client everything about one booked session and let them join it, or cancel it if plans change.

Who can see it: Signed-in clients, opened from My sessions (`18-client-my-sessions`). Not shown to guests or professionals.

Layout regions: Client topbar (My sessions active) · centered narrow column · back link · session summary card · video link card · notes card · manage-booking card · bottom nav (mobile) · site footer.

Visible UI elements:
- "← Back to my sessions" text link
- Heading: "Session details"
- Pro header: avatar HT, "Hana Tesfaye", "Clinical Psychologist · Addis Ababa", "★ 4.9 (212)"
- Summary rows: Service (Individual Mental Health), Date (Saturday, October 3, 2026), Time (4:00 PM – 5:00 PM EAT), Duration (1 hour), Fee ($25.00), Format (Video call)
- Video link card: "🎥 Your link is ready — it opens 10 minutes before your session." + "Join session" (primary button). Variant: "Link available 10 min before" text when the link isn't live yet
- Notes card: client's note text ("Work stress has been keeping me up at night…") + hint "Shared privately with Hana Tesfaye."
- Manage card: "Reschedule" (secondary button, disabled) with note "Rescheduling isn't in v1 — shown disabled"
- "Cancel booking" text link in red; inline confirm banner (warning): "Are you sure you want to cancel this session?" with "Yes, cancel" (danger) and "Keep session" (secondary)
- Language switcher (EN / አማ / ትግርኛ / Afaan Oromoo)

Primary actions (plain product language):
- "Join session" — opens the video call (available 10 minutes before start)
- "Cancel booking" — reveals the inline confirmation asking "Are you sure?"
- "Yes, cancel" (inside the confirm banner) — cancels the booking and returns the client to My sessions
- "Keep session" (inside the confirm banner) — dismisses the confirmation without cancelling

Secondary actions:
- Back link — returns to My sessions without changes
- "Reschedule" — disabled in v1 (kept visible to show the option exists)

Navigation (screen ids):
- Back to my sessions → `18-client-my-sessions`
- Join session → video call (outside spec scope)
- Yes, cancel → `18-client-my-sessions` (Cancelled tab)

Fields: None on this screen.

Validation messages: None — this screen has no inputs.

Variants:
- Default frame — video link ready, "Join session" shown
- Pre-session variant (described, not a separate frame): video row reads "Link available 10 min before" instead of the Join button
- Cancel-confirm inline state — the warning banner with "Yes, cancel" / "Keep session" shown on this frame (the pre-confirmation look is the same frame without the banner; build teams should animate the reveal)

Responsive notes: `page-narrow` centers the cards; on mobile the Join button in the video card wraps full-width below the text. ≤860px the top nav hides behind the `.bottomnav` (Sessions tab active). Disabled Reschedule keeps its ≥48px height so layout doesn't jump between states.

Localization notes: The cancellation confirmation wording must be gentle in every locale — never blame-y ("Are you sure?" is fine; avoid "penalty" language). The "Rescheduling isn't in v1" note is temporary scaffolding copy; it must be replaced (not just translated) when v2 ships rescheduling. Fee and date/time formats localize.
