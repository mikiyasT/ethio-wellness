# Reset password — `reset-password`

## Purpose
Lets users arriving from a valid reset link choose a brand-new password.

## Who can see it
Guests arriving via the emailed reset link (link must be fresh and unused). An expired or already-used link shows an error instead of this form.

## Layout regions
1. Guest topbar: brand, nav (Home / Services / Professionals), language switcher, [Sign in] [Create account]
2. Centered card (`.page-narrow`): check icon, "Choose a new password" heading + sub, two password fields, Save button
3. Footer (`.site-footer`)

## Visible UI elements
- Check icon (✅, 64px circle)
- H1 "Choose a new password"
- Sub "Pick something strong you'll remember."
- Field: New password (placeholder "Your new password") + hint "At least 8 characters"
- Field: Confirm new password (placeholder "Repeat your new password")
- Primary button: **Save new password** (full width, large)

## Actions
- **Primary — Save new password:** saves the new password, invalidates the reset link, and returns to sign in.
- **Secondary:** none on this screen (no secondary action; the flow's next step is signing in).

## Navigation targets
- → 03-login (after a successful save; the mock links the button directly)

## Fields
- **New password — required.** Min 8 characters.
- **Confirm new password — required.** Must exactly match New password.

## Validation messages
- New password too short: inline "Use at least 8 characters"
- Mismatch: inline "Passwords don't match"
- Expired/used link (before the form ever shows): error card "This reset link has expired. Please request a new one." with a button back to → 06-forgot-password (not a separate frame).

## Variants
- **Default:** blank fields (this frame).
- **Error — validation:** inline field errors (same style as `states/04-register-validation-errors.html`; no separate frame).
- **Error — bad link:** expired-link error card described above.
- **Loading:** Save new password shows a spinner while saving.
- **Success:** no interstitial — goes straight to login, where the user signs in with the new password.

## Responsive notes
- `.page-narrow` card; full-bleed on mobile with 16px side margins.
- Topbar mobile behavior same as other auth screens.
- Tap targets ≥44px.

## Localization notes
- Keep "At least 8 characters" consistent with the register screen's identical hint (same reusable string).
- "Choose a new password" / "Pick something strong you'll remember." should keep a warm, non-alarming tone in all four languages.
- Native-speaker review required for the expired-link wording.
