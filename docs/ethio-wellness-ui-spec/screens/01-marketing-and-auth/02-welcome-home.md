# Welcome home (`welcome-home`)

- **Purpose:** Public landing page that explains Ayzon in a warm, local way and invites guests to start browsing immediately.
- **Who can see it:** All (guest, client, professional). Logged-in clients may land here or go to `client-home` — both are documented.
- **Layout regions:** Guest header (sticky) · hero band · main (how-it-works, featured categories, language strip, featured professionals, CTA band) · footer.
- **Visible UI elements:** Brand + nav (Home, Services, Professionals) + language switcher (EN/አማ/ትግርኛ/Afaan Oromoo) + Sign in + Create account; hero kicker, headline, Amharic sub-headline, lead paragraph, two CTAs, three trust badges; three how-it-works cards; four category cards + "See all categories"; language strip with four language chips + "+ more coming"; three professional cards (photo-initials avatar, name, title, city, rating, language tags, specialties, next-open slot, View profile); closing CTA band; footer.
- **Primary action:** "Browse professionals" → goes to `public-professionals-list` (guest-friendly, no login).
- **Secondary actions:** "Explore services" → `public-browse-services`; "Create free account" → `register`; "Keep browsing" dismisses the CTA band intent and stays; "See all categories →" → `public-browse-services`; "Browse all →" → `public-professionals-list`.
- **Navigation:** Header nav → `welcome-home`, `public-browse-services`, `public-professionals-list`. Sign in → `login`. Create account → `register`. Footer links → `public-browse-services`, `public-professionals-list` (Help/Contact/Privacy/Terms are out of v1 scope — noted as placeholders).
- **Fields:** Required vs optional — none (no form on this screen).
- **Validation messages:** None.
- **Variants:** None — this screen has no empty/loading/error/success version. First-load branding is covered by `splash-or-loading`.
- **Responsive notes:** Desktop: 4-column category grid, 3-column pro grid, full header nav. Mobile (390): grids collapse to 2-col then 1-col; top nav hides (brand + language switcher + Create account remain); hero type scales 46→32px; CTA band stacks buttons full-width.
- **Localization notes:** Hero carries an Amharic sub-headline (`.eth`) — allow extra line height; language chips show native names (አማርኛ, ትግርኛ) which render wider than "EN"; the "+ more coming" chip must not wrap awkwardly when more languages are added.
