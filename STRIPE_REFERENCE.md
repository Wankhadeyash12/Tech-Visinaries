# FlexHub Stripe Integration - Reference Card

## Quick Setup (5 minutes)

```bash
# 1. Install dependency
npm install stripe

# 2. Copy and edit .env
cp .env.example .env
# Add your Stripe test keys to .env

# 3. Start server
npm run dev
```

## Environment Variables (.env)

```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```

## Payment Flow Summary

```
User Registration Form
    ↓
Stripe Checkout Session Created
    ↓
User Redirected to Stripe Payment Page
    ↓
Payment Processed
    ↓
Success: /payment-success | Fail: /payment-cancel
    ↓
Webhook Updates Database
    ↓
Registration Visible in Dashboard
```

## Test Cards

**Success:** 4242 4242 4242 4242
**Fail:** 4000 0025 0000 3155

Expiry: 12/34 | CVC: 567

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/payments/create-checkout-session | ✓ | Create payment session |
| GET | /api/payments/session-details | ✓ | Get payment details |
| POST | /api/payments/webhook | ✗ | Receive Stripe events |

## Payment Status Values

- **Pending**: Waiting for payment
- **Completed**: Payment received
- **Failed**: Payment failed

Combined with Approval Status:
- Pending (payment) + Pending (approval) = Waiting for organizer
- Completed (payment) + Pending (approval) = Ready for review
- Completed (payment) + Approved = Registration accepted

## Key Files

| File | Purpose |
|------|---------|
| stripeService.js | Stripe API wrapper |
| paymentController.js | Payment logic & webhooks |
| paymentRoutes.js | API routes |
| payment-success.html | Success page |
| payment-cancel.html | Cancel page |

## Testing Checklist

- [ ] .env configured with test keys
- [ ] Event created with registration fee
- [ ] Event is published
- [ ] Login as participant
- [ ] Navigate to event → click Register
- [ ] Redirects to Stripe Checkout ✓
- [ ] Use test card 4242 4242 4242 4242
- [ ] Payment processes ✓
- [ ] Redirects to /payment-success ✓
- [ ] Dashboard shows "Completed" status ✓

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| STRIPE_SECRET_KEY undefined | Check .env, restart server |
| Invalid signature | Verify STRIPE_WEBHOOK_SECRET |
| 404 on webhook | Use ngrok to expose local server |
| Payment not charged | Use real cards only in production |

## Webhook Testing (Local)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test event in another terminal
stripe trigger checkout.session.completed
```

## Production Checklist

- [ ] Use live Stripe API keys
- [ ] Set BASE_URL to production domain
- [ ] Create webhook in Stripe Dashboard
- [ ] Enable HTTPS
- [ ] Test with real (low amount) payment
- [ ] Monitor Stripe Dashboard
- [ ] Set appropriate logging

## Key Code Snippets

**Frontend - Redirect to Stripe:**
```javascript
const response = await paymentAPI.createCheckoutSession(registrationData);
window.location.href = response.checkoutUrl;
```

**Backend - Create Session:**
```javascript
const stripeResult = await stripeService.createCheckoutSession({
  eventTitle, eventId, participantName, registrationFee, teamMembers
});
```

**Backend - Handle Webhook:**
```javascript
if (event.type === 'checkout.session.completed') {
  registration.paymentStatus = 'Completed';
  await registration.save();
}
```

## Payment Amount Conversion

```javascript
// Database: 100 (₹100)
// Stripe: 10000 (paise)
stripeAmount = databaseAmount * 100;
```

## Support Documentation

- **STRIPE_QUICK_START.md** - Start here
- **STRIPE_SETUP.md** - Detailed setup guide
- **IMPLEMENTATION_SUMMARY.md** - Full technical details

## Status Fields Explanation

**paymentStatus:**
- Pending: Registration created, waiting for payment
- Completed: Payment received, registration confirmed
- Failed: Payment failed, user can retry

**approvalStatus:**
- Pending: Event organizer hasn't reviewed
- Approved: Organizer approved participation
- Rejected: Organizer rejected participation

## Currency

**Fixed to INR** (Indian Rupees)
- Example: ₹100 = 100 in database = 10000 paise to Stripe

## Refund Process

**Currently Manual:**
1. Go to Stripe Dashboard
2. Find transaction
3. Click Refund
4. Update registration status in database

**Future Enhancement:** In-app refund UI planned

## Rate Limits

- No rate limiting implemented yet
- Recommended for production: 100 req/min per user

## What Happens On Payment Failure

1. Registration created with paymentStatus="Pending"
2. User redirected to /payment-cancel
3. Registration remains in database
4. User can try registering again
5. Webhook updates status to "Failed"

## Organizer Dashboard Impact

Organizers now see:
- Payment Status column (Pending/Completed/Failed)
- Can approve/reject based on payment status
- Cannot approve unpaid registrations (recommended)

## Important Notes

⚠️ **Test vs. Live:**
- Test keys: pk_test_, sk_test_
- Live keys: pk_live_, sk_live_
- Never mix in production

⚠️ **Security:**
- All amounts validated server-side
- Webhook signature always verified
- All payment endpoints require authentication

⚠️ **Database:**
- Backward compatible
- No migration required
- New fields are nullable

## Quick Reference Commands

```bash
# Install
npm install stripe

# Test
npm run dev

# Check logs
# Look for "Payment completed for registration" messages

# Stripe CLI
stripe listen --forward-to localhost:3000/api/payments/webhook
stripe trigger checkout.session.completed
```

## Next Steps

1. Read STRIPE_QUICK_START.md
2. Set up .env with test keys
3. Test full payment flow
4. Read STRIPE_SETUP.md for production deployment
5. Get live Stripe keys when ready for production

---

**Version:** 1.0
**Last Updated:** March 2026
**Status:** Production Ready ✓
