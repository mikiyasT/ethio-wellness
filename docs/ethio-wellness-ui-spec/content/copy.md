# Copy — All user-visible strings (English)

Warm, plain-spoken. No lorem ipsum anywhere. Screen ids are in backticks.

## Global chrome (every screen)

- Brand: **Ayzon** · Domain: **ayzoncare.com**
- Guest nav: Home · Services · Professionals · Sign in · Create account
- Client nav: Home · Services · Professionals · My sessions · Account
- Professional nav: Home · Bookings · Availability · Profile · Account
- Language switcher: EN · አማ · ትግርኛ · Afaan Oromoo
- Footer columns — About: "Ayzon connects you with licensed Ethiopian counselors and wellness professionals, in the language you think in." / Explore: Services, Professionals / Support: Help center, Contact, Privacy / Legal: Terms
- Footer base: "© 2026 Ayzon · ayzoncare.com · Made with care in Addis Ababa"

## `splash-or-loading`

- Brand mark "AZ" + "Ayzon" · tagline: "Support for your mind, in the language of your heart."

## `welcome-home`

- Kicker: "Counseling in your language"
- H1: "Support for your mind, in the language of your heart."
- Sub: "Ayzon connects you with Ethiopian counselors and wellness professionals — in Amharic, Tigrinya, Afaan Oromoo, and English. Browse freely, book when you're ready."
- CTAs: "Browse professionals" / "Explore services"
- Trust badges: "✓ Licensed Ethiopian professionals" · "✓ Sessions in 4+ languages" · "✓ Private & secure"
- Section: "How it works" — 1 "Find your counselor" / "Browse by specialty, language, and availability." · 2 "Book a 1-hour session" / "Pick a time that works for you." · 3 "Meet by video" / "Join from your phone or computer."
- Section: "Popular services" · "See all categories →"
- Section: "Featured professionals" · link "Browse all professionals →"

## `login`

- Title: "Welcome back" · Sub: "Sign in to manage your sessions and bookings."
- Fields: Email · Password · [Sign in]
- Links: "Forgot your password?" · "New here? Create a free account"

## `register`

- Title: "Create your free account" · Sub: "Book sessions, manage your bookings, and join by video — all in one place."
- Fields: Full name · Email · Password · [Create account]
- Note: "By creating an account you agree to the Terms and Privacy policy."
- Link: "Already have an account? Sign in"

## `role-selection`

- Title: "How will you use Ayzon?"
- Card A: "I'm looking for support" / "Browse counselors and book sessions."
- Card B: "I'm a professional" / "Offer sessions and manage your practice."

## `forgot-password`

- Title: "Reset your password" · Sub: "Enter your email and we'll send you a reset link."
- Field: Email · [Send reset link] · Link: "Back to sign in"

## `reset-password`

- Title: "Choose a new password" · Sub: "Make it something you'll remember."
- Fields: New password · Confirm new password · [Save new password]

## `session-expired`

- Title: "Your session expired" · Body: "Please sign in again to continue." · [Sign in]

## `auth-gate-to-book` (modal)

- Title: "Sign in to book this session"
- Body: "You can keep browsing as a guest — but booking needs a free account. We'll bring you right back to this slot after you sign in."
- Buttons: [Sign in] · [Create free account] · [Continue browsing]

## `public-browse-services`

- Title: "Services" · Sub: "Find the kind of support you're looking for."
- Search: "Search categories…" · Link: "See all categories →"
- Category descriptions (see `sample-data.md` for all 8).
- Card footnote: "X professionals available"

## `public-professionals-list`

- Title: "Professionals" · Sub: "Browse counselors by specialty, language, and availability."
- Filters: Search ("Search by name…") · Specialty · Language · [Clear filters]
- Card: name · title · city · ★ rating (reviews) · languages · "Next: <slot>" · [View profile]
- Empty: "No matches found" / "Try a different name, specialty, or language." · [Clear filters]

## `public-professional-detail`

- [Book] per open slot · Section: "About" · Section: "Specialties" · Section: "Languages" · Section: "Availability this week" — "All sessions are 1 hour."
- Reviews section: "What clients say" (sample only)
- Empty availability: "No open slots right now" / "This counselor hasn't added new times yet. Check back soon or browse similar professionals." · [Browse similar]

## `client-onboarding`

- Title: "A few quick questions" · Sub: "This helps us recommend the right professionals for you."
- Preferred language: English / አማርኛ / ትግርኛ / Afaan Oromoo
- "What are you looking for?" (specialty multi-select, optional)
- [Continue] · "Skip for now"

## `client-onboarding-preferences`

- Title: "What are you looking for?" · Sub: "Choose the languages you're comfortable with and the kinds of support you want. We'll use these to recommend counselors — you can change them anytime in Account."
- "Preferred language(s)" · "Carried over from step 1 — adjust here if you like." · "Pick every language you're comfortable talking in. At least one is required."
- Languages: Amharic · አማርኛ / Tigrinya · ትግርኛ / Afaan Oromoo / English · እንግሊዝኛ
- "Types of support" · "Check at least one kind of support you're interested in." · Search: "Search types of support…"
- Categories: Individual Mental Health · Couples Counseling · Family Counseling · Addiction & Recovery · Grief and Loss · Youth and Students · Faith-informed Counseling · Career and Life Stress
- "New types of support are added as more counselors join — this list keeps growing."
- [Back] · "Skip" · [Continue]
- Validation: "Please pick at least one language." · "Please choose at least one type of support."
- Toast: "Your preferences are saved."

## `client-home`

- Greeting: "Hello, Miki" · Card: "Next session" — professional, date/time, [Join session] / [View details]
- Section: "Recommended for you" · Section: "Continue browsing" · [Browse professionals]

## `client-book-session`

- Title: "Book your session" · Step: "1. Pick a date" · Step: "2. Choose a 1-hour slot"
- Summary card: professional, specialty, date/time, duration "1 hour", price
- [Continue to payment] · Note: "Free cancellation up to 24 hours before."

## `client-payment`

- Title: "Complete your booking" · Line item: "1-hour session with <name>"
- Fields: Card number · Expiry · CVC · Name on card · [Pay $X]
- Note: "Demo checkout — no real payment is processed."

## `client-booking-confirmation`

- Title: "You're booked!" · Sub: "We sent the details to your email."
- Summary: professional, specialty, date/time, "1 hour", video join note
- Buttons: [View my sessions] · [Back home] · [Keep browsing]

## `client-my-sessions`

- Title: "My sessions" · Tabs: Upcoming · Past · Cancelled
- Card: professional, specialty, date/time, status chip, [Join session] (when link ready) / [View details]
- Empty: "No sessions yet" / "When you book a session it will appear here." · [Browse professionals]

## `client-session-detail`

- Labels: Professional · Date & time · Specialty · Duration: 1 hour · Language · Status
- [Join session] (active shortly before start) · [Reschedule] · [Cancel session]
- Note: "You'll be able to join 15 minutes before your session starts."

## `professional-onboarding`

- Title: "Tell us about your practice" · Sub: "Clients will see this on your public profile."
- Fields: Full name · Professional title · City · Credentials · Bio ("A few sentences about how you work.")
- Specialties (multi-select) · Languages (checkboxes: Amharic, Tigrinya, Afaan Oromoo, English)
- [Continue] · Later: "Set your availability" → `professional-availability`

## `professional-home`

- Greeting: "Hello, Hana" · "Complete your profile" checklist
- Card: "Upcoming bookings" (next 3) · Quick actions: [Manage availability] [View bookings] [Edit profile]

## `professional-profile`

- Title: "Your public profile" · Note: "This is what clients see when they visit your page."
- [Edit profile] · [Manage specialties] · [Set availability]
- Preview card mirrors `public-professional-detail`.

## `professional-specialties`

- Title: "Your specialties" · Sub: "Pick the areas you work in. Clients use these to find you."
- Multi-select chips of the 8 categories · [Save changes]

## `professional-availability`

- Title: "Your availability" · Sub: "Pick a date, then tap 1-hour slots to open them for booking."
- Legend: Available / Booked
- Note: "Booked slots can't be removed — contact support to change a confirmed session."

## `professional-bookings`

- Title: "Bookings" · Tabs: Upcoming · Past · Cancelled
- Card: client name, session type, date/time, language, status chip

## `account-settings`

- Title: "Account settings"
- Preferred language: English / አማርኛ / ትግርኛ / Afaan Oromoo
- Email: (read-only in v1) · [Change password] · [Sign out]

## `not-found`

- Title: "Page not found" · Body: "The page you're looking for doesn't exist or was moved." · [Go home]

## `generic-error`

- Title: "Something went wrong" · Body: "Please try again in a moment." · [Try again]

---

# Amharic (draft — needs native-speaker review)

Key public-screen strings. **All Amharic copy is a draft and must be reviewed by a native speaker before launch.**

- Nav: Home መነሻ · Services አገልግሎቶች · Professionals ባለሙያዎች · My sessions የእኔ ቀጠሮዎች
- Sign in ይግቡ · Create account መለያ ይፍጠሩ · Sign out ይውጡ
- Browse professionals: ባለሙያዎችን ይፈልጉ · Browse services: አገልግሎቶችን ይመልከቱ
- Search: ይፈልጉ… · Book: ይያዙ · Book this slot: ይህን ጊዜ ይያዙ
- Hero (short): በቋንቋዎ የሚሰጥ የስነ-ልቦና ድጋፍ። ("wellness support in your language")
- Auth gate title: ይህን ቀጠሮ ለመያዝ ይግቡ
- Auth gate body: እንደ እንግዳ መፈለግዎን መቀጠል ይችላሉ — ግን ቀጠሮ ለመያዝ ነፃ መለያ ያስፈልጋል። ከገቡ በኋላ ወደዚህ ጊዜ እንመልስዎታለን።
- Languages: Amharic አማርኛ · Tigrinya ትግርኛ · Afaan Oromoo (Oromiffa) · English እንግሊዝኛ
- Onboarding preferences title: ምን እየፈለጉ ነው؟
- Onboarding preferences sub: የሚመችዎ ቋንቋ እና የሚፈልጉትን የድጋፍ ዓይነት ይምረጡ። እነዚህ ምርጫዎች ተስማሚ አማካሪዎችን እንድንመክር ይረዱናል፤ በማንኛውም ጊዜ መቀየር ይችላሉ።
- Preferred language(s): የሚመችዎ ቋንቋ(ዎች) · Types of support: የድጋፍ ዓይነቶች
- Back: ተመለስ · Skip: ዝለል · Continue: ቀጥል
- "Please pick at least one language.": እባክዎ ቢያንስ አንድ ቋንቋ ይምረጡ።
- "Your preferences are saved.": ምርጫዎችዎ ተቀምጠዋል።

# Tigrinya & Afaan Oromoo

**Partial — language names shown in switcher (ትግርኛ / Afaan Oromoo); full UI translations pending native review.** Both are supported product languages: professionals can list them, clients can filter by them, and the switcher labels them in their own script/name. Complete UI translation for Tigrinya and Afaan Oromoo is out of scope for this spec and must go through native-speaker review before launch.
