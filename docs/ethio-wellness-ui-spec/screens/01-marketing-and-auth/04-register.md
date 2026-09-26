# Register — `register`

## Purpose
Lets new visitors create a free Ethio Wellness account, starting the path to client or professional onboarding.

## Who can see it
Guests (signed-out visitors). Signed-in users reaching it should bounce to their home screen.

## Layout regions
1. Guest topbar: brand, nav (Home / Services / Professionals), language switcher, [Sign in] [Create account]
2. Centered card (`.page-narrow`): brand mark, "Create your free account" heading + sub, 4 fields, role note, sign-in link
3. Footer (`.site-footer`, 4 columns + base row)

## Visible UI elements
- Brand mark "EW" (52px, centered)
- H1 "Create your free account"
- Sub "Take the first step — it only takes a minute."
- Field: Full name (placeholder "e.g. Miki Teshome")
- Field: Email (placeholder "you@example.com")
- Field: Password (placeholder "Choose a password") + hint "At least 8 characters"
- Field: Confirm password (placeholder "Repeat your password")
- Primary button: **Create account** (full width, large)
- Info note: "🌍 After signup you'll choose whether you're here as a **client** or a **professional**."
- Divider, then: "Already have an account? Sign in"

## Actions
- **Primary — Create account:** validates the fields, creates the account, then moves to role selection.
- **Secondary — Sign in** → 03-login
- **Tertiary — topbar [Sign in] / [Create account]:** → 03-login / stay here

## Navigation targets
- → 05-role-selection (after a valid create-account)
- → 03-login (via "Already have an account? Sign in")

## Fields
- **Full name — required.** Free text, min 2 characters.
- **Email — required.** Must be a valid email address; must not already belong to an account.
- **Password — required.** Min 8 characters.
- **Confirm password — required.** Must exactly match Password.
- Optional fields: none on this screen.

## Validation messages
- Full name: "Enter your full name"
- Email: "Enter a valid email address" (blank or malformed); "This email is already registered — try signing in instead." (duplicate)
- Password: "Use at least 8 characters"
- Confirm: "Passwords don't match"
- All shown inline beneath their field on submit, with the field highlighted — covered by `states/04-register-validation-errors.html`.

## Variants
- **Default / empty:** blank fields (this frame).
- **Error — validation:** `states/04-register-validation-errors.html` (one example of each field error shown together for spec coverage; real use shows only the failing fields).
- **Loading:** Create account button shows a spinner and is disabled while the account is being created.
- **Success:** no interstitial — goes straight to role selection.

## Responsive notes
- `.page-narrow` card; full-bleed on mobile with 16px side margins; fields stack full width.
- Topbar mobile behavior same as login (nav hidden, `.btn-keep` on Create account, shortened language switcher).
- Tap targets ≥44px.

## Localization notes
- "Create your free account" and the role note run long in Amharic — keep the info alert and button labels able to wrap to two lines.
- Password hint "At least 8 characters" is a reusable microcopy string across register + reset-password.
- All Amharic/Tigrinya/Oromo auth translations need native-speaker review before build.
