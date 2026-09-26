# Localization Notes

## How the language switcher works

- The switcher sits in the header on **every** screen (guest, client, professional): `EN` · `አማ` (አማርኛ) · `ትግርኛ` · `Afaan Oromoo`.
- Tapping a language swaps all user-visible UI copy to that locale; it does not sign anyone out or change content (bios stay in the language the professional wrote them).
- Copy is **English-first**: the English strings in `content/copy.md` are the source of truth.
- Amharic is provided as a **draft** for the key public-screen strings (nav, hero, browse, cards, auth gate, booking) — flagged as needing native-speaker review before launch.
- Tigrinya and Afaan Oromoo UI translations are **pending** — switcher labels (ትግርኛ / Afaan Oromoo) and language-name chips are shown; full translations require native review.

## Ethiopic script spacing

- Ethiopic glyphs run wider than Latin. **Allow ~30% extra width** on:
  - nav links and header buttons
  - CTA buttons ("Book this slot" → "ይህን ጊዜ ይያዙ")
  - filter chips and slot chips
  - the language switcher itself (ትግርኛ is the widest label)
- **Never truncate language names** — no ellipsis on አማርኛ, ትግርኛ, Afaan Oromoo.
- **Do not assume English-only button widths.** Buttons, chips, and tabs must size to content (`btn-keep` on the header "Create account" prevents squeeze on desktop; mobile may wrap to two lines rather than clip).
- Chips in a filter row may wrap to a second line in Ethiopic locales — that's fine; don't shrink text.

## The `.eth` font class

- Latin UI uses **Inter**. Ethiopic script uses **"Noto Sans Ethiopic"**.
- Any element containing Ethiopic characters gets the `.eth` class, which forces the Noto Sans Ethiopic font stack (e.g. `<button class="eth">አማ</button>`).
- Mixed strings (e.g. "Afaan Oromoo (Oromiffa)") don't need `.eth`; pure Ethiopic strings do.
- Amharic sample frames exist for the main public screens (noted in their companion `.md` files).
