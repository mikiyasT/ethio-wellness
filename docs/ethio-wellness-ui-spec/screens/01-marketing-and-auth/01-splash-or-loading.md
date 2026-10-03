# Splash / Loading — `splash-or-loading`

## Purpose
Warm branded first paint shown while the app loads, setting the tone before anything else appears.

## Who can see it
All visitors (first load, before any header, footer, or navigation is available).

## Layout regions
Single full-viewport layer (`.load-veil`): no header, no footer, no navigation.
1. Brand mark (large "AZ" circle, 72px)
2. Title block: "Ayzon" heading + Amharic tagline (`.eth`)
3. Animated loading bar (`.load-bar`)
4. Small caption line

## Visible UI elements
- Brand mark "AZ" (large, animated-pulse-free, centered)
- H1 "Ayzon"
- Tagline "በቋንቋዎ የሚሰጥ የስነ-ልቦና ድጋፍ።" (Ethiopic font)
- Animated loading bar (brand-green bar sweeping across a track)
- Caption "Warming up your space…"

## Actions
- **None.** This screen is non-interactive; the loading bar animates automatically and the app moves on when ready. (Primary: wait; secondary: none — deliberate.)

## Navigation targets
- → next: the appropriate first screen for the visitor's state (welcome home for guests, client home / professional home for signed-in users). The splash itself has no links.

## Fields
- None. Required vs optional: n/a.

## Validation messages
- None.

## Variants
- **Loading (default):** shown while assets/data are still loading (this frame).
- **Error:** if loading fails, hand off to the generic error screen (→ `generic-error`, screen 28) — not rendered here.
- **Empty / success:** n/a.

## Responsive notes
- Full-viewport flex column, centered; identical layout on mobile — the veil covers the viewport at any size, nothing stacks or hides (no header/nav to collapse).

## Localization notes
- Tagline is Amharic: "በቋንቋዎ የሚሰጥ የስነ-ልቦና ድጋፍ።" — allow generous line height and line-wrap room for the Ethiopic glyphs; keep the `.eth` class so the Ethiopic font is used.
- No language switcher on this screen (it appears on every screen after this one).
- Amharic string is draft and needs native-speaker review (see copy notes).
