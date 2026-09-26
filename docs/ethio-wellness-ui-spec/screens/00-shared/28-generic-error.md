# Generic error (`generic-error`)

## Purpose
A reassuring fallback shown when something fails unexpectedly, inviting the visitor to retry without losing their place.

## Who can see it
Everyone — guests and signed-in users alike (shown here with the guest header).

## Layout regions
Top bar (guest nav) → centered narrow message → footer.

## Visible UI elements
- Gold circular icon (⚠️) to soften the error visually.
- Heading "Something went wrong".
- Body copy: "Please try again in a moment."
- Primary button: "Try again".
- Text button: "Go home".

## Actions
- Primary: "Try again" — repeats the last thing the visitor attempted (reloads the previous screen).
- Secondary: "Go home" — takes the visitor to the welcome home page.

## Navigation
- `28-generic-error` → retries the originating screen (Try again).
- `28-generic-error` → `02-welcome-home` (Go home).

## Fields
None — this screen has no inputs.

## Validation messages
None.

## Variants
- Used as a full screen (as mocked here) or inline within flows such as account settings, booking, and checkout.

## Responsive notes
- Identical centered layout on desktop and mobile; both buttons stack vertically on small screens with ≥48px touch targets.
- "Go home" renders as a text button (`.btn-text`) to keep visual weight on the retry.

## Localization notes
- Heading and copy translate; keep the copy vague and warm in all locales ("try again in a moment") — never show technical details.
