# State: payment processing — `16-client-payment-processing`

Frame: [../html/states/16-client-payment-processing.html](../html/states/16-client-payment-processing.html) — variant of `16-client-payment`.

What changed vs the base payment screen: the Pay button is disabled and shows a spinner with the label "Processing…"; all card inputs (cardholder name, card number, expiry, CVC) are disabled and keep their entered values.

When it appears: immediately after the client taps "Pay $25.00", while the payment is being handled.

Notes for build: the client can't edit card fields or double-tap Pay in this state — that's deliberate, to prevent duplicate charges. The step indicator stays on step 3 (Payment). If processing takes longer than a few seconds, keep this frame up rather than flashing other content; the timeout/error path lands on `16-client-payment-failed`.
