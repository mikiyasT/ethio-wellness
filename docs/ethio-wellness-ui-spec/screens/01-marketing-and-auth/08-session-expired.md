# Session expired — `session-expired`

## Purpose
Tells a signed-in user their session timed out and gets them signed back in with one tap.

## Who can see it
Previously signed-in users (clients or professionals) whose session expired — shown in place of whatever protected page they tried to reach.

## Layout regions
1. Guest topbar (session is gone, so signed-out chrome): brand, nav, language switcher, [Sign in] [Create account]
2. Centered card (`.page-narrow`): clock icon, "Your session expired" heading, one-line explanation, Sign in button
3. Footer (`.site-footer`)

## Visible UI elements
- Clock icon (⏰, 64px circle, warning-tint background)
- H1 "Your session expired"
- Line: "Please sign in again to continue."
- Primary button: **Sign in** (full width, large)

## Actions
- **Primary — Sign in:** takes the user to the login screen to re-authenticate.
- **Secondary:** none — the single job of this screen is getting the user signed back in.

## Navigation targets
- → 03-login (the only exit)

## Fields
- None.

## Validation messages
- None.

## Variants
- **Default:** this frame (message + Sign in button).
- **Empty / loading / error / success:** n/a — this screen is itself the "session" error state; further failures on it route to `generic-error` (screen 28).
- Design note: after re-signing in, the user should land back on the page they were trying to reach, not a generic home (product behavior to preserve in build).

## Responsive notes
- `.page-narrow` card; full-bleed on mobile with 16px side margins; single column, centered text.
- Topbar mobile behavior same as other auth screens (nav hidden, `.btn-keep` on Create account).
- Tap targets ≥44px.

## Localization notes
- Copy is deliberately minimal (two short lines) so it stays legible in all four languages at the same centered layout.
- The tone is neutral-informative, not blaming — keep that in translation ("expired" ≠ "you did something wrong").
- Native-speaker review required for Amharic/Tigrinya/Oromo wording.
