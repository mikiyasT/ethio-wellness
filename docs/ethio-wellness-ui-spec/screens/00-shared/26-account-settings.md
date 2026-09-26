# Account settings (`account-settings`)

## Purpose
Lets a signed-in user change their app language, see their sign-in email, change their password, or sign out.

## Who can see it
Signed-in clients and professionals (shown here with the client header).

## Layout regions
Top bar (client nav + avatar) → app sidebar (Account active) → narrow settings card → footer. Mobile: top bar + centered card + bottom nav (Account active).

## Visible UI elements
- Page title "Account settings" with subheading "Manage how Ethio Wellness looks and works for you."
- "Preferred app language" dropdown (English / አማርኛ / ትግርኛ / Afaan Oromoo) with hint: "Buttons and menus will use this language. A counselor's profile always shows the languages they work in."
- Read-only "Email address" field showing the account email, with note "Email can't be changed in v1. If you need a new address, contact support and we'll help."
- "Save changes" (primary), "Change password" (secondary), "Sign out" (danger text).

## Actions
- Primary: "Save changes" — stores the chosen app language.
- Secondary: "Change password" — opens the password change flow.
- Tertiary: "Sign out" — ends the session and returns to the home page.

## Navigation
- `26-account-settings` → `07-reset-password` (Change password).
- `26-account-settings` → `02-welcome-home` (after Sign out).
- Sidebar: `14-client-home`, `10-public-browse-services`, `11-public-professionals-list`, `18-client-my-sessions`, `26-account-settings`.

## Fields
- Preferred app language: required, always has a value (defaults to English).
- Email address: display-only (read-only), not editable in v1.

## Validation messages
- Language: no validation needed — a choice is always selected.
- Save failures surface the generic error screen (`28-generic-error`).

## Variants
- Professional view: same layout; header uses the professional nav (Home, Bookings, Availability, Profile) and the professional's avatar.
- Error state: if saving fails, retry uses `28-generic-error`.

## Responsive notes
- Desktop: sidebar + narrow card (≤560px content width).
- ≤900px: sidebar collapses away; the settings card spans the container.
- ≤640px: bottom nav appears with Account active; buttons are full-width with ≥48px touch targets.

## Localization notes
- Language options are shown in their native scripts (አማርኛ, ትግርኛ) using the Ethiopic font class.
- Ethiopic labels can run longer than English — dropdown and card widths allow ~30% extra room.
- The email field stays Latin-script in all locales (email addresses don't translate).
