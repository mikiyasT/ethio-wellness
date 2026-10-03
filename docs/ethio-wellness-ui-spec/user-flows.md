# User Flows — Ayzon

All steps reference screen ids in backticks. Flows describe product behavior only — no implementation.

## Flow 1 — First-time guest browses → registers → books → pays → confirms

1. Guest lands on `welcome-home` — reads hero, trust badges, "How it works".
2. Taps **Explore services** → `public-browse-services`; scans categories, taps "Individual Mental Health".
3. Arrives at `public-professionals-list` pre-filtered by that specialty; narrows by language.
4. Opens a card → `public-professional-detail`; reads bio, checks open 1-hour slots.
5. Taps **Book** on a slot → `auth-gate-to-book` modal: "Sign in to book this session. You can keep browsing as a guest — but booking needs a free account. We'll bring you right back to this slot after you sign in."
6. Chooses **Create free account** → `register`; completes form → `role-selection` picks "I'm looking for support".
7. Optional quick pass through `client-onboarding` step 1 (display name, preferred language, what brings them here) → `client-onboarding-preferences` step 2 (confirm languages, check the types of support they want) → **Continue** saves and shows "Your preferences are saved."
8. Lands back on `client-book-session` with the chosen slot held → confirms details → **Continue to payment**.
9. `client-payment` — "Complete your booking"; enters card details (mock; "Demo checkout — no real payment is processed") → **Pay $X**.
10. `client-booking-confirmation` — "You're booked!" with summary → **View my sessions** or **Keep browsing**.

## Flow 2 — Guest browses and leaves without an account (must feel complete)

1. Guest lands on `welcome-home`; explores hero, categories, featured professionals.
2. Taps **Explore services** → `public-browse-services`; searches categories, reads descriptions.
3. Taps **Browse professionals** → `public-professionals-list`; filters by specialty + language; reads ratings.
4. Opens `public-professional-detail`; reads bio, specialties, languages, reviews, and open slots.
5. Taps **Book** → `auth-gate-to-book` → chooses **Continue browsing** — no pressure, no dead end.
6. Guest keeps browsing or leaves. Nothing was forced: every screen offered real content with no login, and the modal always offers a graceful exit.

## Flow 3 — Returning client signs in and books

1. Client taps **Sign in** (header) → `login`; signs in (or `session-expired` → signs in again).
2. Lands on `client-home` — sees next session and recommended professionals.
3. Searches or taps **Professionals** → `public-professionals-list`; opens a profile → `public-professional-detail`.
4. Taps **Book** on an open slot → straight to `client-book-session` (already authenticated — no gate).
5. Confirms details → `client-payment` → **Pay $X** → `client-booking-confirmation` → **View my sessions**.

## Flow 4 — Client joins an upcoming session

1. Client signs in → `client-home` shows "Next session: Sat Oct 3, 4:00 PM EAT".
2. Taps the session → `client-session-detail`: professional, date/time, topic, session notes placeholder.
3. When the video link is ready (e.g. 15 min before), the **Join session** button activates → video session opens (out of spec scope).
4. After the session: `client-my-sessions` moves it to Past (Completed).

## Flow 5 — New professional registers, onboards, sets specialties/languages, adds availability

1. Guest taps **Create account** → `register` → `role-selection` picks "I'm a professional".
2. `professional-onboarding` — "Tell us about your practice": name, title, city, credentials, bio, photo (initials avatar for now).
3. On the same screen (or `professional-specialties`): multi-selects specialties; checks language boxes (Amharic, Tigrinya, Afaan Oromoo, English).
4. Submits → `professional-home` dashboard with a "Complete your profile" checklist.
5. Taps **Set availability** → `professional-availability`: "Pick a date, then tap 1-hour slots to open them for booking." Legend: Available / Booked. Note: "Booked slots can't be removed — contact support to change a confirmed session."
6. Reviews `professional-profile` to see how clients will view them; adjusts via `professional-specialties` as needed.

## Flow 6 — Professional reviews upcoming bookings

1. Professional signs in → `professional-home`: today's/next bookings summary.
2. Taps **Bookings** → `professional-bookings` — upcoming tab lists client name, session type, date/time, status.
3. Opens a booking for details (client's topic, language); past/cancelled visible under tabs.
4. Adjusts week via `professional-availability` if needed.

## Flow 7 — User switches UI language via the header switcher

1. Any screen (guest, client, or professional — the switcher chrome is present on **all** screens): user taps the language switcher in the header.
2. Chooses EN / አማ / ትግርኛ / Afaan Oromoo.
3. UI copy swaps to the selected locale: nav (Home/መነሻ/…, Services, Professionals…), hero, browse screens, cards, auth gate, booking screens.
4. Sample frames exist in Amharic for the main public screens (noted in companions; see `content/localization-notes.md`).
5. Ethiopic text never truncates: buttons, chips, and nav allow ~30% extra width; language names are never shortened.
