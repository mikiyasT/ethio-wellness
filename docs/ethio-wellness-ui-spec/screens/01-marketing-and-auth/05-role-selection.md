# Role selection — `role-selection`

## Purpose
New accounts pick how they'll use Ethio Wellness — as a client booking sessions or as a professional offering them — so the right onboarding follows.

## Who can see it
Newly registered users immediately after signup (authenticated but not yet assigned a role). Guests cannot reach it.

## Layout regions
1. Guest topbar (still the signed-out chrome until onboarding completes): brand, nav, language switcher, [Sign in] [Create account]
2. Centered content (`.page-narrow`): centered heading + sub, two large selectable cards side by side, Continue button, explanatory caption
3. Footer (`.site-footer`)

## Visible UI elements
- H1 "How will you use Ethio Wellness?"
- Sub "Pick the one that fits you — you can adjust later in settings."
- **Client card:** 🧍 icon circle, "Client", "Book sessions with counselors"
- **Professional card:** 🩺 icon circle, "Professional", "Offer counseling and manage your practice"
- Selected state: green border + light green fill (Client is pre-selected)
- Primary button: **Continue** (full width, large)
- Caption: "Choosing **Client** takes you to client onboarding · choosing **Professional** takes you to professional onboarding."

## Actions
- **Primary — Continue:** saves the chosen role and starts the matching onboarding flow.
- **Secondary — tap a card:** switches the selection between Client and Professional (single choice).
- **Tertiary — topbar links:** present but inactive in context (user is mid-signup).

## Navigation targets
- → client onboarding (screen 13 `client-onboarding`) when Client is chosen
- → professional onboarding (screen 20 `professional-onboarding`) when Professional is chosen

## Fields
- Role choice — required, single-select radio-style (Client pre-selected so Continue always has a valid target).
- No text fields on this screen.

## Validation messages
- None needed: a default selection is always active, so the Continue button can never fire without a role.

## Variants
- **Default:** Client pre-selected (this frame).
- **Professional selected:** same frame with the Professional card highlighted (state implied, not a separate frame).
- **Loading:** Continue shows a spinner while the role is being saved.
- **Empty / error / success:** n/a — no form data to validate; errors fall through to `generic-error` (screen 28).

## Responsive notes
- Cards sit side by side on desktop; stack to one column on ≤640px, each full width and ≥44px tall tap area (whole card is tappable, not just a radio dot).
- Heading wraps to two lines on narrow screens without breaking the centered rhythm.

## Localization notes
- Card descriptions ("Book sessions with counselors" / "Offer counseling and manage your practice") need to stay short in all four languages — keep them to one wrapped line at 14.5px if possible.
- "Client" / "Professional" labels get native translations at build time; until then show English + allow space.
- The caption naming both destinations must be re-checked per language so the two onboarding paths stay unambiguous.
