# State: payment failed — `16-client-payment-failed`

Frame: [../html/states/16-client-payment-failed.html](../html/states/16-client-payment-failed.html) — variant of `16-client-payment`.

What changed vs the base payment screen: a red error banner at the top reads "Your card was declined. No charge was made. Please try another card." The card fields are re-enabled and editable (card number cleared, name kept), and the primary button reads "Try again" instead of "Pay $25.00". The order summary card is unchanged, so the client can see the slot is still held.

When it appears: when the payment attempt is declined.

Notes for build: the reassurance "No charge was made" is the most important sentence on this frame — keep it in every locale. Never show raw decline codes to the client; if support needs them, log them for staff only. The step indicator stays on step 3 (Payment).
