# State: forgot password — success ("Check your inbox")

- **HTML frame:** `ew-spec-src/html/states/06-forgot-password-success.html`
- **Base screen:** `06-forgot-password` (`screens/01-marketing-and-auth/06-forgot-password.md`)
- **When shown:** the reset link has been sent after tapping "Send reset link".
- **What's different from base:** the form is replaced by a centered success card — envelope icon, H1 "Check your inbox", line "We've sent a reset link to you@example.com.", a green info note ("The link expires in 1 hour. Didn't get the email? Check your spam folder, or request a new link."), and a full-width primary button **Back to sign in**.
- **Next:** → `03-login`.
- **Privacy note:** the message is identical whether or not the address has an account.
- **Responsive:** single centered card on all sizes; no stacking changes on mobile.
