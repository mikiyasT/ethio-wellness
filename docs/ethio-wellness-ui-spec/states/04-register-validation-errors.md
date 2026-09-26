# State: register — validation errors

- **HTML frame:** `ew-spec-src/html/states/04-register-validation-errors.html`
- **Base screen:** `04-register` (`screens/01-marketing-and-auth/04-register.md`)
- **When shown:** one or more fields failed validation when "Create account" was tapped.
- **What's different from base:** each failing field shows the error highlight (`.field-error`) plus an inline message with a ⚠️ marker:
  - Full name (blank): "Enter your full name"
  - Email ("not-an-email"): "Enter a valid email address"
  - Password ("short"): "Use at least 8 characters"
  - Confirm password (mismatch): "Passwords don't match"
- **Spec note:** the frame shows all four errors together for coverage; in real use only the fields that actually failed get messages. Fix the flagged fields and tap **Create account** again.
- **Responsive:** error messages wrap beneath their fields on all sizes; card and field order unchanged on mobile.
