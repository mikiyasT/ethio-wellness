# Not found (`not-found`)

## Purpose
A calm dead-end page that appears when a visitor follows a broken, mistyped, or removed link.

## Who can see it
Everyone — guests and signed-in users alike (shown here with the guest header).

## Layout regions
Top bar (guest nav) → centered narrow message → footer.

## Visible UI elements
- Large "404" display numeral in brand green.
- Heading "Page not found".
- Body copy: "The page you're looking for doesn't exist or was moved."
- Primary button: "Go home".

## Actions
- Primary: "Go home" — takes the visitor to the welcome home page.

## Navigation
- `27-not-found` → `02-welcome-home` (Go home).
- Top bar: `02-welcome-home`, `10-public-browse-services`, `11-public-professionals-list`, `03-login`, `04-register`.

## Fields
None — this screen has no inputs.

## Validation messages
None.

## Variants
- None — the same message serves all missing-page cases; no technical details or codes are shown to visitors.

## Responsive notes
- The centered layout is identical on desktop and mobile; the 404 numeral scales down naturally with the container.
- On mobile the guest header shows the collapsed language switcher (EN / አማ only) and the "Create account" keep-button.

## Localization notes
- Heading and copy translate; keep the numerals "404" and the Latin page id out of translation strings.
- Warm, plain tone in every language — never technical ("route", "resource").
