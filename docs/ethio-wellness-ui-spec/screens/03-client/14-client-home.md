# Client home (`client-home`)

- **Purpose:** Personalized logged-in home: greeting, next session, shortcuts, recommendations.
- **Who can see it:** Client role only (after `client-onboarding`; guests are routed to `welcome-home`).
- **Layout regions:** Client header (avatar) · sidebar nav (desktop) · main: greeting, upcoming-session banner, category shortcuts, recommended professionals · mobile bottom nav.
- **Visible UI elements:** "Selam, Miki 👋"; upcoming session card with green left border (pro avatar, name, service, date/time, [Join session]); 4 category shortcut cards; 2 recommended professional cards (languages, next-open, View profile).
- **Primary action:** "Join session" → opens the video session (meeting link; external step, documented as "Join session appears when a meeting link exists").
- **Secondary actions:** Category shortcuts → `public-browse-services`; "View all" → `public-professionals-list`; sidebar/bottom-nav items → their screens (`client-home`, `public-browse-services`, `public-professionals-list`, `client-my-sessions`, `account-settings`).
- **Navigation:** Sidebar: Home (`client-home`), Services (`public-browse-services`), Professionals (`public-professionals-list`), My sessions (`client-my-sessions`), Account (`account-settings`). Mobile bottom nav mirrors with 5 tabs.
- **Fields:** Required vs optional — none.
- **Validation messages:** None.
- **Variants:** No upcoming session → banner is replaced with a "Book your first session" prompt → `public-professionals-list` (documented, frame optional in v1).
- **Responsive notes:** Desktop: 250px sidebar + content. Mobile: sidebar hidden, bottom nav (Home/Services/Pros/Sessions/Account) fixed; upcoming card stacks with Join button full-width.
- **Localization notes:** Greeting name + Amharic "Selam" mix is intentional; keep greeting line to one line at 390px — allow wrap, never clip the name.
