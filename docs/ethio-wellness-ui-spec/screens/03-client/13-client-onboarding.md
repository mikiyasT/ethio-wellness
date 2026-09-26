# Client onboarding — `client-onboarding`

Purpose: Collect a new client's display name, preferred session languages, and optional goals right after role selection, before they land on the client home screen.

Who can see it: Signed-in clients who just finished role selection and haven't completed onboarding. Not shown to guests or professionals.

Layout regions: Client topbar (logo, nav, language switcher, avatar) · centered narrow content column · step indicator (1 Profile on, 2 Preferences) · single settings card · action row (Skip text link left-aligned with Continue primary right-aligned) · bottom nav (mobile) · site footer.

Visible UI elements:
- `.steps`: "1 · Profile" (on), "2 · Preferences"
- Heading: "Tell us a little about you" + sub "This helps us match you with the right counselor — you can change it anytime."
- Display name text field (pre-filled "Miki Teshome") with hint "This is how your counselor will see you. A first name is fine."
- "Preferred language(s)" checkbox list: Amharic (አማርኛ), Tigrinya (ትግርኛ), Afaan Oromoo, English (እንግሊዝኛ); Amharic and English pre-checked in the mock
- "What brings you here? (optional)" textarea with placeholder example sentence
- Footer links and language switcher (EN / አማ / ትግርኛ / Afaan Oromoo)

Primary actions (plain product language):
- "Continue" (primary button) — saves what was entered and moves to step 2 (`client-onboarding-preferences`)
- "Skip" (text link) — leaves onboarding without saving and goes straight to client home

Navigation (screen ids):
- Continue → `client-onboarding-preferences` (step 2 — the language choices carry over pre-checked there)
- Skip → `14-client-home`
- Language switcher → same screen in that language

Fields: Display name — required. Preferred language(s) — required, at least one. Goals textarea — optional.

Validation messages:
- Display name left empty: "Please enter the name you'd like your counselor to use." (red, under the field)
- No language selected: "Please pick at least one language." (red, under the checkbox group)

Variants: Base frame only — no special states defined for this screen. (Error validation visuals live on this frame.)

Responsive notes: Narrow column (`page-narrow`) is already mobile-friendly. On ≤860px the top nav collapses into the `.bottomnav` (Home, Services, Pros, Sessions, Account); checkboxes stay full-width rows with ≥44px tap targets. On desktop the same layout centers at ~640px width.

Localization notes: Language names always show both Latin and Ethiopic script (Amharic · አማርኛ). The placeholder sentence must be translated per locale — never machine-translated copy. Onboarding headings need native-speaker review for Amharic/Tigrinya/Afaan Oromoo.
