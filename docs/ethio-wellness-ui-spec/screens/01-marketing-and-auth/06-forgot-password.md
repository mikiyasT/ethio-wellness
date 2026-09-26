# Forgot password — `forgot-password`

## Purpose
Lets users who can't sign in request a password-reset link by email.

## Who can see it
Guests (signed-out visitors), reached from the login screen's "Forgot password?" link.

## Layout regions
1. Guest topbar: brand, nav (Home / Services / Professionals), language switcher, [Sign in] [Create account]
2. Centered card (`.page-narrow`): key icon, "Reset your password" heading + explanatory text, email field, Send button, back-to-sign-in link
3. Footer (`.site-footer`)

## Visible UI elements
- Key icon (🔑, 64px circle)
- H1 "Reset your password"
- Explanatory text: "No worries — it happens. Enter the email you signed up with and we'll send you a link to choose a new password."
- Field: Email (placeholder "you@example.com")
- Primary button: **Send reset link** (full width, large)
- Divider, then: "Remembered it? Back to sign in"

## Actions
- **Primary — Send reset link:** sends a one-time reset link to the entered email address (the same message appears whether or not the email has an account, to protect privacy).
- **Secondary — Back to sign in** → 03-login

## Navigation targets
- → success state `states/06-forgot-password-success.html` ("Check your inbox") after sending
- → 03-login (via "Back to sign in")

## Fields
- **Email — required.** Must be a valid email address.

## Validation messages
- Blank or malformed: inline "Enter a valid email address" beneath the field.
- For privacy, no message reveals whether the email belongs to an account — the success screen shows the same way either way.

## Variants
- **Default:** blank email field (this frame).
- **Error — invalid email:** inline field error (described above; not a separate frame).
- **Loading:** Send reset link shows a spinner and is disabled while sending.
- **Success:** `states/06-forgot-password-success.html` — "Check your inbox" card showing "We've sent a reset link to you@example.com." plus a link-expiry note and **[Back to sign in]**.

## Responsive notes
- `.page-narrow` card; full-bleed on mobile with 16px side margins.
- Topbar mobile behavior same as login/register.
- Tap targets ≥44px.

## Localization notes
- The explanatory paragraph runs long in Ethiopic scripts — keep the centered column wide enough for 3–4 wrapped lines without the card growing awkwardly.
- "Send reset link" should stay a short verb phrase in all languages; review in native pass.
- Never localize in a way that leaks account existence (wording stays identical for known/unknown emails).
