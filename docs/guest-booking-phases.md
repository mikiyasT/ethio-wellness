# Ayzon Guest Booking — Phase Tracker

**Source:** Merged build plan (Cursor plan + founder design).  
**Standing rules:** no account required to book · guest identity for the pilot is email · video is Daily.co and the raw room link stays hidden · Meta Pixel generic only · no clinical session notes · minimal PII. WhatsApp and SMS are deferred.

---

## Phase 1 — Guest booking ships (**done** for the pilot API)

| Item | Status |
|------|--------|
| Remove auth gate from book CTA | **Done** |
| Allow guests on `/client/book`, `/payment`, `/booking-confirmation` (app-shell) | **Done** |
| Guest form (first name, last optional, email, phone optional, private note) | **Done** |
| 10-minute slot hold on slot select (`held` + expiry release) | **Done** |
| Stripe Checkout test mode | **Done** — Checkout Session plus `checkout.session.completed` webhook. No confirm-without-payment route |
| Fee = platform session price (`feeCents`, pilot default $25) | **Done** |
| Confirmation: session card, AYZ code, .ics, email line, soft account CTA | **Done** |
| Provider bookings: Guest badge + name | **Done** |
| Booked slot card: `Booked · {firstName}` + payout | **Done** (prior + guest first name) |
| Signed-in path (skip guest fields, hold with clientId) | **Done** |
| Rate limit: max 3 pending per email | **Done** |
| Meta Pixel: PageView, InitiateCheckout, Purchase only | **Done** (no-op until `fbq` loaded) |
| Timezone: UTC `startsAt` / `endsAt`, booker-local display, EAT for provider | **Done** |
| Session code `AYZ-XXXX` (Crockford) | **Done** |
| Tokens generated on booking (manage/join hashes) for Phase 2 | **Done** |
| Soft fork before book: guest (primary) vs create account | **Done** |
| `/join` recovery: session code + email → lobby | **Done** |

### Phase 1 acceptance

- [ ] Logged-out books end-to-end without login *(manual QA)*
- [ ] Slot held then confirmed; leaves open list *(manual QA)*
- [ ] Provider sees guest + badge *(manual QA)*
- [ ] Login never required mid-funnel *(manual QA)*
- [ ] Signed-in flow unaffected *(manual QA)*
- [ ] Times sensible across US/Ethiopia *(manual QA)*

### Phase 1 leftover

- [x] Wire real Stripe Checkout (test keys → Checkout Session redirect)
- [x] Light IP rate limit on hold, checkout, and join (email cap of 3 holds remains)
- [ ] Load Meta Pixel script via env (`NEXT_PUBLIC_META_PIXEL_ID`) when ready

---

## Phase 2 — Pilot essentials: guest booking via email + working video (**not started**)

Scope is minimal. Two things must work end to end before the pilot test: a guest books and gets everything by email, and a video session actually connects. Rescoped 2026-10-11. The earlier WhatsApp / SMS version of this phase is dropped.

- [ ] **Booking email carries the session code.** On confirmation, email the guest: session code (`AYZ-XXXXX`), professional name, date and time in the booker’s local zone, a one-tap join link with the code pre-filled (`/join?code=AYZ-XXXXX`), the `/b/<token>` manage link, and an `.ics` attachment. From is `አይዞን <bookings@ayzoncare.com>` (Amharic display name, not folded to “Ayzon”), Reply-To is `support@ayzoncare.com`, and both the HTML and plain-text parts end with a prominent `አይዞን!` sign-off and a small muted `ayzoncare.com`. Amharic uses the phone or computer’s own fonts, with no webfont.
- [ ] **Reminders and notices.** Reminders at 24 hours, 1 hour, and 5 minutes, with the join link first. Also send the receipt, and notices for reschedule and cancel. Send through Resend or Postmark with SPF, DKIM, and DMARC.
- [ ] **Provider emails.** Same sender, Reply-To, and footer. On a new booking: guest details captured at booking, date and time in the provider’s local time (EAT), a join link to `/professional`, and a manage link to `/professional/bookings`. The same 24h / 1h / 5-min reminders, with the join link first. Reschedule and cancel notices.
- [ ] **Join stays session code + email.** Verify the pair on `/join`. The emailed link pre-fills the code. Rate-limit attempts per code. A code works only in the join window: 15 minutes before the start through the session end.
- [ ] **Working video session.** Daily.co prebuilt embed: pre-call lobby (camera and mic check), waiting room, expiring participant tokens minted at join time. The raw room link is never exposed. Acceptance: a real full-length Addis Ababa ↔ US call with acceptable two-way audio and video.
- [ ] **Manage-booking page** at `/b/<token>`. Reschedule and cancel with no login, using the manage token already stored on the booking.
- [ ] **Claim guest bookings.** When a guest creates an account with the same verified email, one tap links their past guest bookings to the account.
- [ ] **Cancel and reschedule rules.** Free when more than 24 hours out. Inside 24 hours, the professional decides.

### Explicitly not Phase 2

- SMS one-time codes
- WhatsApp in any form
- “My bookings” via an emailed link
- A new password step for guests
- Native apps
- Attendance timestamps and marking a finished hour `completed` (after the pilot; see below)
- Professional photo upload on the signup form (after the pilot; see below). Until then, new professionals show initials. Seeded counselors keep the photos already in `apps/web/public/professionals/`

### Founder setup (no code)

- [ ] Verify `ayzoncare.com` in the email provider (SPF, DKIM, DMARC). This is the only founder task before Phase 2 can send mail.

---

## Phase 3 — Hardening (**auth and Postgres done**; the rest still open)

- [x] Real auth + Postgres (cookie sessions, Neon). The browser no longer stores the domain database
- [ ] CAPTCHA / fraud / VOIP blocking if needed
- [ ] No-show marking + policy — specified under **After the pilot**, not part of the prototype
- [ ] Funnel analytics (guest vs account)
- [ ] Daily.co HIPAA BAA + privacy/legal review

---

## After the pilot — attendance and completed sessions

Do not build this for the prototype. The first deployed test ships without it. Finished bookings stay `upcoming` until this lands, and the provider Past tab stays empty because it already lists only `status = completed`.

Decided 2026-10-12, to implement after the pilot has real sessions:

- [ ] **Record who was actually in the room.** Tapping Join only mints a Daily token and is not attendance. Subscribe to Daily participant events and store the first entry and the last exit on the booking, separately for each side: `clientJoinedAt`, `clientLeftAt`, `professionalJoinedAt`, `professionalLeftAt`. A reconnect keeps the original entry time and updates the exit time. If Daily distinguishes knocking from being admitted, store both: a guest in the waiting room can be on time while the professional has not opened the door yet.
- [ ] **Lateness and no-shows are derived, not a new status.** Late is the entry time minus `slot.startsAt`. A missing entry after the hour ends means that person never joined. One late session does not flag anyone. A later report counts how often a client or professional joins late, or not at all. The cutoff (for example more than 10 minutes) is a policy choice. A `completed` booking with one or both entry times empty is the no-show. These timestamps are operational, not clinical notes.
- [ ] **Mark the hour completed.** Shortly after `endsAt` (a minute or two of grace so the final leave events can land), a job sets an `upcoming` booking to `completed`. `cancelled` stays `cancelled`. The slot stays `booked` so that hour cannot be sold again. The session then leaves the professional home list and appears under Past. The client session list uses the same status.

## After the pilot — professional photo upload

Do not build this for the prototype. The onboarding form already shows initials and a **Change photo** control that does not open a file picker or save a file. New applicants appear with initials. The counselors already in the directory keep the photos placed by hand in `apps/web/public/professionals/`. `Professional.photoUrl` already exists.

Decided 2026-10-12, to implement after the pilot, when people who are not in the seed list start applying:

- [ ] **Upload on the professional form.** A file input on onboarding and on profile edit. Accept a square-friendly head-and-shoulders photo (JPEG or WebP, about 512×512, size-capped). Store the file outside the git repo. Save the address on `photoUrl`.
- [ ] **Review before it is public.** The picture can show on the professional’s own profile while they are pending. It appears in the directory, booking, and join lobby only after the professional is approved. Until a photo is saved, the initials placeholder stays.

---

## Open founder questions

1. Phone required for Ethiopia-first? (Phase 1: optional)
2. Reschedule/cancel inside 24h — **decided for Phase 2:** free when more than 24 hours out; inside 24 hours the professional decides
3. Soft hold duration tune (default 10 min)

---

*Last updated 2026-10-12. Phases A–F and PR #13 are merged on `master` (`afa2cf3`). Phase 2 is email plus a working Daily.co session. Provider booking, reminder, and change emails use the same አይዞን sender as guest mail. Attendance timestamps, marking a finished hour `completed`, and professional photo upload wait until after the pilot. WhatsApp, SMS, “My bookings” by emailed link, a guest password step, and native apps are deferred. Schema has no `otp_codes`, `message_log`, `reviews`, or `provider_payouts`.*
