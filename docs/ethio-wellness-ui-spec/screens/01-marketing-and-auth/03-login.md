# Login — `login`

## Purpose
Lets returning users sign back in to their Ayzon account.

## Who can see it
Guests (signed-out visitors). Reaching it while already signed in should bounce to the appropriate home screen.

## Layout regions
1. Guest topbar: brand, nav (Home / Services / Professionals), language switcher, [Sign in] [Create account]
2. Centered card (`.page-narrow`): brand mark, "Welcome back" heading + sub, form, footer links
3. Footer (`.site-footer`, 4 columns + base row)

## Visible UI elements
- Brand mark "AZ" (52px, centered)
- H1 "Welcome back"
- Sub "Sign in to continue your wellness journey."
- Field: Email (`you@example.com` placeholder)
- Field: Password (password entry)
- "Forgot password?" link (right-aligned above the button)
- Primary button: **Sign in** (full width, large)
- Divider, then: "New here? Create account"
- Small line: "🔒 Your details stay private — always."

## Actions
- **Primary — Sign in:** submits email + password; on success, lands on the signed-in home for the account's role (client home or professional home).
- **Secondary — Forgot password?** → 06-forgot-password
- **Secondary — Create account** → 04-register
- **Tertiary — topbar [Sign in] / [Create account]:** stay on this screen / → 04-register

## Navigation targets
- → 06-forgot-password (via "Forgot password?")
- → 04-register (via "New here? Create account" and topbar button)
- → client home (13-client-home…) or professional home (screen 21) after successful sign-in, depending on the account's role

## Fields
- **Email — required.** Format: must be a valid email address.
- **Password — required.** No format rule beyond non-empty.

## Validation messages
- Blank submission: field-level "Enter your email address" / "Enter your password" (shown inline beneath the field).
- Wrong credentials: error banner "Incorrect email or password. Try again or reset your password." with both fields highlighted — covered by `states/03-login-invalid-credentials.html`.
- Too many failed attempts: "Too many tries — please wait a few minutes and try again." (generic-rate frame, product-level; keep tone calm).

## Variants
- **Default / empty:** blank fields, placeholders only (this frame).
- **Error — invalid credentials:** `states/03-login-invalid-credentials.html` (error banner + highlighted fields).
- **Error — blank submit:** inline field errors (described above; not a separate frame).
- **Loading:** Sign in button shows a spinner and is disabled while signing in (CSS `.btn .spinner`; no separate frame).
- **Success:** no interstitial — goes straight to the signed-in home.

## Responsive notes
- `.page-narrow` keeps the card a comfortable width on desktop; on mobile the card fills the screen width (16px margins).
- Topbar: nav links hide ≤640px; the "Create account" button keeps showing (`.btn-keep`); language switcher keeps EN + አማ and hides ትግርኛ / Afaan Oromoo labels (`.hide-m`) — tapping them is still possible via EN/አማ? No: hidden labels just shorten the switcher; all four options remain accessible on ≥640px.
- Tap targets ≥44px (buttons min-height 48px, inputs 50px).

## Localization notes
- "Welcome back" and sub-line grow ~30–40% in Amharic; keep the centered layout with room for two lines.
- The language switcher (EN / አማ / ትግርኛ / Afaan Oromoo) is present on this screen; switching languages re-renders all copy but not the layout.
- Amharic/Tigrinya/Oromo translations of auth copy need native-speaker review before build (copy notes).
