# Component Inventory

Visualized in `components.png`. All components: minimum **44px touch targets** on mobile; visible **focus states** (3px `--primary` outline, 2px offset) on all interactive elements; disabled states never rely on color alone.

| Component | States | Key rules |
|-----------|--------|-----------|
| **Header (guest)** | default / scrolled | Brand + nav + lang switch + [Sign in] [Create account]; sticky; active link `.active` |
| **Header (client)** | default | Nav adds My sessions; actions: lang switch + avatar "MT" |
| **Header (professional)** | default | Nav: Home, Bookings, Availability, Profile; avatar "HT" |
| **Language switcher** | default / active | EN · አማ · ትግርኛ · Afaan Oromoo; `.eth` on Ethiopic buttons; hide ትግርኛ/Afaan Oromoo labels on small screens (`.hide-m`) but keep in menu |
| **Buttons** | default / hover / disabled / loading | Variants: primary, secondary, gold, text, danger; sizes sm/lg/block; 44px min height; `.btn-keep` prevents header CTA squeeze |
| **Inputs** | default / focus / error / disabled | Text, email, password, textarea, select; 10px radius; error = `--error` border + message |
| **Chips (filter)** | default / selected / hover | Pill radius; multi-select; selected = `--primary-tint` bg + `--primary` border |
| **Tags (language/specialty)** | static | Small pill, `--surface-warm` bg; language names never truncated |
| **Category card** | default / hover | Emoji icon, title, description, "X professionals available"; hover lifts |
| **Professional card** | default / hover | Avatar initials, name, title, city, ★ rating (reviews), language tags, "Next: slot", [View profile] |
| **Slot chip** | open / booked / selected / disabled | 1-hour labels; booked = muted, non-interactive; selected = `--primary` fill |
| **Session card** | upcoming / past / cancelled | Professional, specialty, date/time, status chip, [Join session] / [View details] |
| **Modal** | open / closing | Centered, 16px radius, overlay scrim; focus trapped; Esc/× closes; auth gate variant per copy |
| **Auth gate** | — | Title + body + [Sign in] [Create free account] [Continue browsing]; always offers exit |
| **Alerts** | success / warning / error / info | Icon + message; color + text, never color alone |
| **Tabs** | default / active | Upcoming / Past / Cancelled; active = `--primary` underline + semibold |
| **Bottom nav (mobile)** | default / active | Logged-in only (client: Home, Professionals, Sessions, Account; professional: Home, Bookings, Availability, Profile, Account); guest mobile has none |
| **Sidebar** | — | Desktop account/settings secondary nav (reserved; settings currently single-column) |
| **Empty state** | — | Icon, title, body, CTA (e.g. "No sessions yet" → [Browse professionals]) |
| **Skeleton** | loading | Card/slot shimmer placeholders on list and detail screens |

## Notes

- `components.png` shows every component in its default state plus the interactive states above — keep it current when components change.
- Emoji icons are acceptable in mockups (🔍 📅 👤 ⏰ 🌍 💬 🧠 👨‍👩‍👧); final build should swap to a proper icon set.
- Avatars are initials in `av-1`…`av-10` color classes — **no photo hotlinks**.
