# State: login — invalid credentials

- **HTML frame:** `ew-spec-src/html/states/03-login-invalid-credentials.html`
- **Base screen:** `03-login` (`screens/01-marketing-and-auth/03-login.md`)
- **When shown:** the email/password combination didn't match an account.
- **What's different from base:** an error banner (`.alert.err`, role="alert") above the form reading "Incorrect email or password. Try again or reset your password."; both fields carry the error highlight (`.field-error`).
- **Recovery paths:** correct the details and tap **Sign in** again, or follow "Forgot password?" → `06-forgot-password`.
- **Tone note:** wording never says which half was wrong (email vs password), to protect account privacy.
- **Responsive:** banner stacks above the form on all sizes; nothing hides on mobile.
