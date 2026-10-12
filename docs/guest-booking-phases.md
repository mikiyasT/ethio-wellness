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

- [ ] **Booking email carries the session code.** On confirmation, email the guest: session code (`AYZ-XXXXX`), professional name, date and time in the booker’s local zone, a one-tap join link with the code pre-filled (`/join?code=AYZ-XXXXX`), the `/b/<token>` manage link, and an `.ics` attachment.
- [ ] **Reminders and notices.** Reminders at 24 hours, 1 hour, and 5 minutes, with the join link first. Also send the receipt, and notices for reschedule and cancel. Send through Resend or Postmark with SPF, DKIM, and DMARC.
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

### Founder setup (no code)

- [ ] Verify `ayzoncare.com` in the email provider (SPF, DKIM, DMARC). This is the only founder task before Phase 2 can send mail.

---

## Phase 3 — Hardening (**auth and Postgres done**; the rest still open)

- [x] Real auth + Postgres (cookie sessions, Neon). The browser no longer stores the domain database
- [ ] CAPTCHA / fraud / VOIP blocking if needed
- [ ] No-show marking + policy
- [ ] Funnel analytics (guest vs account)
- [ ] Daily.co HIPAA BAA + privacy/legal review

---

## Open founder questions

1. Phone required for Ethiopia-first? (Phase 1: optional)
2. Reschedule/cancel inside 24h — **decided for Phase 2:** free when more than 24 hours out; inside 24 hours the professional decides
3. Soft hold duration tune (default 10 min)

---

*Last updated 2026-10-11. Phases A–F and PR #13 are merged on `master` (`afa2cf3`). Phase 2 is rescoped to email plus a working Daily.co session, and is not started. WhatsApp, SMS, “My bookings” by emailed link, a guest password step, and native apps are deferred. Schema has no `otp_codes`, `message_log`, `reviews`, or `provider_payouts`.*
