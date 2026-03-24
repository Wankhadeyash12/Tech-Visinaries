# Stripe Payment Integration - Quick Start

## Installation

### 1. Install Stripe Package
```bash
npm install stripe
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with your Stripe keys:
```
STRIPE_PUBLIC_KEY=pk_test_yourkeyhere
STRIPE_SECRET_KEY=sk_test_yourkeyhere
STRIPE_WEBHOOK_SECRET=whsec_yourkeyhere
BASE_URL=http://localhost:3000
```

### 3. Database Update

The `Registration` model has been automatically updated with:
- `stripeSessionId`: Stores Stripe checkout session ID
- `stripePaymentIntentId`: Stores payment intent ID

No migration needed - it's backward compatible.

## How It Works

### Registration Flow with Payment

```
Participant fills registration form (event has fee)
                    ↓
        User clicks "Complete Registration"
                    ↓
        Backend creates Stripe checkout session
        (Registration saved with paymentStatus="Pending")
                    ↓
    User redirected to Stripe Checkout page
                    ↓
      User enters payment details and pays
                    ↓
    Stripe processes payment & returns to success page
                    ↓
Payment webhook received (checkout.session.completed)
                    ↓
   paymentStatus updated to "Completed"
   Participant can now see registration in dashboard
```

## Testing Payment Integration

### Start the server:
```bash
npm run dev
```

### Test Cards (Stripe Test Mode):
- **Success**: `4242 4242 4242 4242`
- **Failure**: `4000 0025 0000 3155`
- **Decline**: `4000 0000 0000 0002`

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 567)

### Test Workflow:
1. Create event as organizer with fee (e.g., ₹100)
2. Publish event
3. Login as participant
4. Register for event → redirects to Stripe
5. Use test card → completes payment
6. Check dashboard → registration shows "Completed" payment status

## Files Created/Modified

### Backend Files:
- **server/services/stripeService.js** - Stripe API integration
- **server/controllers/paymentController.js** - Payment logic
- **server/routes/paymentRoutes.js** - Payment endpoints
- **server/models/Registration.js** - Updated with Stripe fields
- **server/app.js** - Added payment routes & webhook handling

### Frontend Files:
- **client/pages/payment-success.html** - Success page with registration details
- **client/pages/payment-cancel.html** - Payment cancellation page
- **client/js/api.js** - Added paymentAPI object
- **client/pages/event-details.html** - Updated to use checkout session
- **client/pages/participate.html** - Updated to use checkout session

### Configuration:
- **.env.example** - Environment variables template
- **package.json** - Updated with stripe dependency

## API Endpoints

### Create Checkout Session
```
POST /api/payments/create-checkout-session
Headers: Authorization: Bearer {token}
Body: {
  "eventSlug": "event-slug",
  "teamName": "Team Name",
  "teamMembers": [
    { "name": "Member 1", "email": "email1@example.com" },
    { "name": "Member 2", "email": "email2@example.com" }
  ]
}

Response: {
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "registrationId": "..."
}
```

### Get Payment Session Details
```
GET /api/payments/session-details?sessionId={sessionId}
Headers: Authorization: Bearer {token}

Response: {
  "session": {...},
  "registration": {...}
}
```

### Webhook
```
POST /api/payments/webhook
Headers: stripe-signature: {signature}

Listens for:
- checkout.session.completed
- payment_intent.payment_failed
```

## Payment Status Flow

### Initial State (Before Payment)
```
Registration Created with:
- paymentStatus: "Pending"
- approvalStatus: "Pending"
- stripeSessionId: session_id
```

### After Successful Payment
```
paymentStatus: "Completed"
approvalStatus: "Pending" (waiting for organizer approval)
stripePaymentIntentId: pi_...
```

### After Failed Payment
```
paymentStatus: "Failed"
approvalStatus: "Pending"
```

## Organizer Dashboard

Organizers can now see registration payment status in:
- Dashboard → View Registrations
- Each registration shows:
  - Approval Status (Pending/Approved/Rejected)
  - Payment Status (Pending/Completed/Failed)

## Webhook Setup for Production

### Using Stripe CLI (Recommended for Testing):
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Start listening
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### Manual Webhook Setup:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### "STRIPE_SECRET_KEY is not defined"
- Check `.env` file has `STRIPE_SECRET_KEY`
- Restart server after updating `.env`

### "Invalid signature" on webhook
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure raw body is passed to webhook (done in app.js)
- Check webhook endpoint is accessible

### Payment button not redirecting
- Check browser console for errors
- Verify Stripe keys are set in `.env`
- Ensure Base URL is correct

### Event fee shows 0
- Check event was created with fee amount
- Verify event is published
- Reload page to see updated fee

## FAQ

**Q: Can free events still be registered without payment?**
A: Yes! If `registrationFee = 0`, registration is submitted directly without Stripe redirect.

**Q: What happens if payment fails?**
A: Registration stays in database with `paymentStatus: "Failed"`. User can try registering again.

**Q: Can registrations be refunded?**
A: Currently, refunds must be done manually via Stripe Dashboard. Future versions will support in-app refunds.

**Q: Are test payments charged?**
A: No. Test cards generate fake transactions with no charges.

**Q: How long does payment verification take?**
A: Instant. Webhook typically delivered within seconds. If not received within 5 mins, check webhook setup.

## Next Steps

1. Install Stripe package: `npm install stripe`
2. Set up `.env` with Stripe keys
3. Start server: `npm run dev`
4. Test with sample event and test card
5. For production: Get live keys and update `.env`

## Support

For detailed Stripe integration guide, see: [STRIPE_SETUP.md](./STRIPE_SETUP.md)

For Stripe documentation: https://stripe.com/docs
