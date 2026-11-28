# Stripe Checkout — embedded form (Dahlia)

Integration created: Checkout Session with `ui_mode: "form"`, consumed by Stripe.js `initCheckoutFormSdk`.

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [src/routes/api/create-checkout-session.js](src/routes/api/create-checkout-session.js)

| Parameter | Value |
|-----------|-------|
| ui_mode | form |
| billing_address_collection | auto |
| phone_number_collection | enabled: false |
| automatic_tax | enabled: false |
| payment_method_collection | always (mode is subscription) |
| submit_type | auto |
| name_collection | individual + business, both enabled and optional |
| integration_identifier | custom_embedded_web_0001 |
| Stripe API version | 2026-03-25.dahlia |
| Stripe.js | https://js.stripe.com/dahlia/stripe.js |

## Values to Replace

**Files containing values to review:**
- [src/routes/api/create-checkout-session.js](src/routes/api/create-checkout-session.js)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | subscription | Already correct for the recurring US$ 5/seat plan. Switch to `payment` only if you start selling one-time products. |
| line_items[0].price | price_1Ugb9KEHFKmanZlkYMqQW3jK (Act AI, US$ 5/month, live test-mode price) | Keep this Price ID, or replace it with another recurring price from https://dashboard.stripe.com/prices if you change the plan price. |
| line_items[0].quantity | seats chosen by the buyer (1–50) | Bound is enforced in the endpoint; adjust `MAX_SEATS` if you sell more seats per checkout. |

## Setup and next steps

1. **Environment variables** (already provided by the Base44 Stripe integration): `STRIPE_SECRET_KEY` (server only) and `STRIPE_PUBLISHABLE_KEY` (returned to the browser by the endpoint — it is a public key).
2. **Files added**
   - `src/routes/api/create-checkout-session.js` — server route; creates the Checkout Session and returns `{ client_secret, publishable_key }`.
   - `src/components/billing/EmbeddedCheckoutForm.jsx` — loads Stripe.js (Dahlia), mounts the form, wires the `confirm` event.
   - `src/routes/_authed/checkout.jsx` — page at `/checkout?seats=N` that hosts the form and the return page (`/checkout?status=sucesso`).
3. **Flow**: buyer opens `/checkout?seats=N` → page requests the session → server creates the session with the configured price and `return_url` → the form mounts in the page → `confirm` completes the payment inside the app → Stripe redirects to `/checkout?status=sucesso`.
4. **Fulfillment is not wired to the new flow yet.** The app's existing seat purchase (billing page) still uses the Base44 payments checkout, which is what marks `BillingAccount` as active and assigns seats. To move fully to this embedded form, the activation must be driven by a signature-verified Stripe webhook (`checkout.session.completed` / `customer.subscription.*`) that updates `BillingAccount` and `BillingEvent`. Until then, `/checkout` takes the payment but does not by itself activate the subscription in the app.
5. **Testing**: use test mode with card `4242 4242 4242 4242`, any future expiry, any CVC. The Stripe Dashboard webhooks page shows the events the sessions emit.
6. **Next steps**: connect the purchase button on the billing page to `/checkout?seats=N`, add the webhook for activation, and record `subscription_activated` analytics once payment is confirmed.
7. **Resources**: https://support.stripe.com · https://docs.stripe.com/mcp · https://docs.stripe.com/payments/checkout/customization
