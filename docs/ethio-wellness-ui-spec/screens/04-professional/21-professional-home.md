# Professional home (`professional-home`)

- **Purpose:** Professional's dashboard: today's workload at a glance, next session, quick actions.
- **Who can see it:** Professional role only (after `professional-onboarding`).
- **Layout regions:** Professional header · sidebar nav (desktop) · main: greeting, 4 stat cards, next-session banner, today's schedule list, quick actions · mobile bottom nav.
- **Visible UI elements:** "Good afternoon, Hana 👋" + date line; stats (Sessions today 3, Upcoming bookings 12, Average rating 4.9★, Earned this week $300); next-session card (gold left border, client avatar, name, service, time, [Join session]); schedule rows with status tags (Done/Upcoming, current highlighted); quick actions (Manage availability, Edit profile, View all bookings).
- **Primary action:** "Join session" → opens the video session for the next booking.
- **Secondary actions:** "Manage availability" → `professional-availability`; "Edit profile" → `professional-profile`; "View all bookings" → `professional-bookings`; sidebar/bottom nav → `professional-home`, `professional-bookings`, `professional-availability`, `professional-specialties`, `professional-profile`, `account-settings`.
- **Navigation:** Sidebar: Home (`professional-home`), Bookings (`professional-bookings`), Availability (`professional-availability`), Specialties (`professional-specialties`), Profile (`professional-profile`), Account (`account-settings`).
- **Fields:** Required vs optional — none.
- **Validation messages:** None.
- **Variants:** No sessions today → schedule list shows the empty pattern ("Nothing scheduled today — your open slots are visible to clients") + [Manage availability] (documented, frame optional in v1).
- **Responsive notes:** Desktop: sidebar + 4-col stats. Mobile: bottom nav (Home/Bookings/Slots/Profile/Account); stats 2-col; schedule rows stack with Join full-width.
- **Localization notes:** Client names shown as "First name + last initial" for privacy — this rule holds across languages; stat labels must allow longer Amharic words ("ቀጠሮዎች" etc.) without clipping.
