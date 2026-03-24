# Stripe Payment Integration - Setup Guide

## Overview
This guide explains how to set up Stripe payment integration for the FlexHub event management platform. The system uses Stripe Checkout to process event registration payments.

## Payment Flow
1. **User Registration**: Participant fills registration form (team name, members)
2. **Checkout Session**: System creates a Stripe checkout session for the event fee
3. **Payment Processing**: User is redirected to Stripe hosted payment page
4. **Payment Result**: After payment, user is redirected to success/cancel page
5. **Database Update**: On successful payment, registration is saved with `paymentStatus = "Completed"`

## Prerequisites
- Stripe account (create at https://dashboard.stripe.com)
- Node.js and npm installed
- MongoDB database running

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign in or create an account
3. Navigate to **Developers** → **API Keys**
4. Copy your **Publishable Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`)
5. These will be used in your `.env` file

## Step 2: Create Webhook Endpoint

### In Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/payments/webhook`
   - For local development: Use ngrok to expose your local server publicly
   - Or skip this during development and test webhook manually
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_`)

### Setting up ngrok (for local development):
```bash
# Install ngrok from https://ngrok.com/download
# Run ngrok to tunnel your local port
ngrok http 3000

# Use the provided URL in your webhook setup
# Example: https://abc123.ngrok.io/api/payments/webhook
```

## Step 3: Configure Environment Variables

Create a `.env` file in your project root (or copy from `.env.example`):

```
MONGODB_URI=mongodb://localhost:27017/flexhub
PORT=3000
JWT_SECRET=your_jwt_secret_key_here

STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

BASE_URL=http://localhost:3000
```

### For Production:
```
STRIPE_PUBLIC_KEY=pk_live_your_live_public_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

BASE_URL=https://yourdomain.com
```

## Step 4: Install Dependencies

```bash
cd FlexHub
npm install
```

The `stripe` package should already be in `package.json`.

## Step 5: Configure Stripe Keys in Frontend

Add your Stripe public key to `client/js/stripe-config.js` (create if needed):

```javascript
// This is only for reference - currently keys are handled server-side
const STRIPE_PUBLIC_KEY = 'pk_test_your_stripe_public_key_here';
```

## Step 6: Test the Integration

### Test Payment Flow:
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create an event with a registration fee:
   - Login as organizer
   - Go to "Create Event"
   - Set "Registration Fee" to a non-zero amount (e.g., ₹100)
   - Publish the event

3. Register as a participant:
   - Browse events
   - Click on the event with a fee
   - Fill registration form
   - Click "Complete Registration"
   - You'll be redirected to Stripe Checkout

4. Use Stripe Test Card:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `567`
   - Zip: `12345`

5. After successful payment:
   - You'll be redirected to `/payment-success?session_id=...`
   - Check your participant dashboard - registration should show as paid

### Test Payment Failure:
   - Card Number: `4000 0025 0000 3155`
   - Other details same as above
   - Payment will fail and you'll be redirected to `/payment-cancel`

## Database Schema Updates

The `Registration` model has been updated with Stripe fields:

```javascript
{
  stripeSessionId: String,        // Unique Stripe checkout session ID
  stripePaymentIntentId: String,  // Stripe payment intent ID
  paymentStatus: 'Pending' | 'Completed' | 'Failed',
  approvalStatus: 'Pending' | 'Approved' | 'Rejected'
}
```

## API Endpoints

### 1. Create Checkout Session
**POST** `/api/payments/create-checkout-session`

Request body:
```json
{
  "eventSlug": "event-slug",
  "teamName": "Team Alpha",
  "teamMembers": [
    { "name": "John Doe", "email": "john@example.com" },
    { "name": "Jane Smith", "email": "jane@example.com" }
  ]
}
```

Response:
```json
{
  "message": "Checkout session created",
  "sessionId": "cs_test_...",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "registrationId": "65abc123..."
}
```

### 2. Get Payment Session Details
**GET** `/api/payments/session-details?sessionId=cs_test_...`

Response:
```json
{
  "message": "Payment session details retrieved",
  "session": {
    "id": "cs_test_...",
    "status": "complete",
    "amount_total": 10000,
    "currency": "inr"
  },
  "registration": {
    "id": "...",
    "teamName": "Team Alpha",
    "paymentStatus": "Completed",
    "approvalStatus": "Pending"
  }
}
```

### 3. Webhook Handler
**POST** `/api/payments/webhook`

Handles Stripe events:
- `checkout.session.completed`: Updates registration to paid
- `payment_intent.payment_failed`: Sets payment status to failed

## Webhook Testing (Local Development)

### Using Stripe CLI:
```bash
# Install Stripe CLI (https://stripe.com/docs/stripe-cli)

# Listen for events
stripe listen --forward-to localhost:3000/api/payments/webhook

# Copy the signing secret provided

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

## Troubleshooting

### Issue: "Invalid signature" on webhook
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure raw body is being passed to webhook handler
- Check that middleware order in `app.js` is correct

### Issue: Payment redirect not working
- Check that `BASE_URL` in `.env` is correct
- Verify Stripe API keys are present in environment
- Check browser console for errors

### Issue: "Missing required fields"
- Ensure all team member details are filled
- Verify event fee is set correctly
- Check that event is published

### Issue: Webhook events not being received
- For local development, use ngrok to tunnel requests
- Verify webhook endpoint is accessible
- Check Stripe Dashboard Webhooks for failed attempts

## Production Deployment Checklist

- [ ] Use live Stripe API keys (not test keys)
- [ ] Set `BASE_URL` to your production domain
- [ ] Set up webhook in Stripe Dashboard pointing to production URL
- [ ] Enable HTTPS for all endpoints
- [ ] Test complete payment flow with small amounts
- [ ] Monitor Stripe Dashboard for failed transactions
- [ ] Set up monitoring/alerts for webhook failures
- [ ] Document refund process for organizers
- [ ] Implement email notifications for payment status

## Refund Process

Currently, refunds must be initiated manually through:
1. Stripe Dashboard → Payments → Select transaction → Refund
2. Update registration's `paymentStatus` in database

Future enhancement: Implement admin refund endpoint

## Cost Considerations

- Stripe charges 2.2% + ₹3 per transaction in India
- Test transactions incur no charges
- Refer to Stripe pricing: https://stripe.com/in/pricing

## Support & Resources

- Stripe Docs: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- FlexHub Support: [Add your support channel]

## Notes

- Payment status updates happen on successful checkout
- Registration is created on checkout session creation (payment pending)
- Webhook signature verification is required for security
- All timestamps are stored in UTC
- Currency is hardcoded to INR (Indian Rupees)
