# Ayzon Guest Booking — Phase Tracker

**Source:** Merged build plan (Cursor plan + founder design).  
**Standing rules:** no account required to book · WhatsApp ≠ video venue · Meta Pixel generic only · no clinical session notes · minimal PII.

---

## Phase 1 — Guest booking ships (mostly done — pilot)

| Item | Status |
|------|--------|
| Remove auth gate from book CTA | **Done** |
| Allow guests on `/client/book`, `/payment`, `/booking-confirmation` (app-shell) | **Done** |
| Guest form (first name, last optional, email, phone optional, private note) | **Done** |
| 10-minute slot hold on slot select (`held` + expiry release) | **Done** |
| Stripe Checkout test mode | **Partial** — simulated secure pay at pro fee; real Stripe Checkout Session when keys wired |
| Fee = professional fee (not hardcoded $25) | **Done** (hold/confirm use `professional.fee`) |
| Confirmation: session card, AYZ code, .ics, email line, soft account CTA | **Done** |
| Provider bookings: Guest badge + name | **Done** |
| Booked slot card: `Booked · {firstName}` + payout | **Done** (prior + guest first name) |
| Signed-in path (skip guest fields, hold with clientId) | **Done** |
| Rate limit: max 3 pending per email | **Done** |
| Meta Pixel: PageView, InitiateCheckout, Purchase only | **Done** (no-op until `fbq` loaded) |
| Timezone: UTC `slotAt`, booker-local display, EAT for provider | **Done** |
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

- [ ] Wire real Stripe Checkout (test keys → Checkout Session redirect)
- [ ] Optional: IP rate limit (browser pilot is email-only)
- [ ] Load Meta Pixel script via env (`NEXT_PUBLIC_META_PIXEL_ID`) when ready

---

## Phase 2 — WhatsApp identity + guest self-serve (**not started**)

Deferred until founder Meta Business / API number / templates ready.

- [ ] WhatsApp primary identity; email optional/fallback
- [ ] OTP via WhatsApp (3 attempts, 60s resend, SMS fallback)
- [ ] Transactional WA messages (confirm, reminders, join, receipt, reschedule/cancel)
- [ ] Manage booking `/b/<token>`
- [ ] `/my-bookings` via WhatsApp OTP (no password)
- [ ] Join lobby → Daily.co (token at join; never expose raw room URL)
- [ ] Explicit one-tap claim on register/login
- [ ] Reschedule/cancel policy (>24h free; inside 24h provider discretion)

---

## Phase 3 — Hardening (**not started**)

- [ ] Real auth + Postgres (replace localStorage)
- [ ] CAPTCHA / fraud / VOIP blocking if needed
- [ ] No-show marking + policy
- [ ] Funnel analytics (guest vs account)
- [ ] Daily.co HIPAA BAA + privacy/legal review

---

## Open founder questions

1. Phone required for Ethiopia-first? (Phase 1: optional)
2. Reschedule/cancel inside 24h — confirm default
3. Soft hold duration tune (default 10 min)

---

*Last updated: Phase 1 pilot implementation landed in app code.*
