# ⚠️ Stripe Configuration Required - READ THIS FIRST

## The Problem You're Seeing

You're getting: **"Error processing registration: Failed to create payment session"**

This happens because **Stripe API keys are not configured in your .env file**.

---

## Solution: Get Your Stripe Test Keys (5 minutes)

### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com
2. Sign up with your email (skip organization setup for now)
3. You'll be redirected to the dashboard

### Step 2: Get Your Test API Keys
1. Click on **"Developers"** in the left sidebar
2. Click on **"API keys"**
3. You should see two keys on the right:
   - **Publishable key** - starts with `pk_test_`
   - **Secret key** - starts with `sk_test_`

### Step 3: Copy Keys to .env File

Open `c:\Users\wankh\OneDrive\Desktop\FlexHub\.env` and update these lines:

```env
STRIPE_PUBLIC_KEY=pk_test_[PASTE YOUR KEY HERE]
STRIPE_SECRET_KEY=sk_test_[PASTE YOUR KEY HERE]
STRIPE_WEBHOOK_SECRET=whsec_test_[PASTE YOUR KEY HERE]
```

**Example:**
```env
STRIPE_PUBLIC_KEY=pk_test_51NzxDJL1234567890abcdefghijk
STRIPE_SECRET_KEY=sk_test_51NzxDJL1234567890abcdefghijk
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijk
```

### Step 4: Restart the Server

1. Stop the current server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. That's it! 🎉

---

## Get Webhook Secret (For Testing Webhooks)

1. In Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. For testing locally, use: `http://localhost:3000/api/payments/webhook`
4. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
5. Copy the **Signing secret** → paste into `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Test Credentials (Ready to Use!)

Once configured, test payments with these cards:

| Card | Status | Use For |
|------|--------|---------|
| 4242 4242 4242 4242 | ✓ Success | Testing successful payments |
| 4000 0025 0000 3155 | ✗ Decline | Testing failed payments |
| 5555 5555 5555 4444 | ✓ Success | Alternative success card |

**For all test cards:**
- Expiry Date: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- Zip Code: Any value

---

## Your .env File Should Look Like

```
MONGODB_URI=mongodb://localhost:27017/flexhub
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=3000
UPLOADS_DIR=server/uploads

# ✅ These must be filled with your actual keys:
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE

BASE_URL=http://localhost:3000
```

---

## Quick Testing Workflow

1. **Create Event** 
   - Login as organizer
   - Create event with registration fee: ₹100
   - Publish event

2. **Register Participant**
   - Login as participant
   - Select the event
   - Click "Register"
   - Fill form, submit

3. **Enter Test Card**
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 567
   - Click "Pay"

4. **Success!**
   - You'll see success page ✓
   - Check dashboard for registration ✓
   - Payment status: "Completed" ✓

---

## Still Getting Error?

### Error: "STRIPE_SECRET_KEY is not defined"
- **Fix**: You didn't restart the server after updating .env
- Run: `npm run dev`

### Error: "Invalid API Key provided"
- **Fix**: Your key is wrong or expired
- Go to Stripe Dashboard and copy the key again

### Error: "Permission denied" or "Unauthorized"
- **Fix**: You're using a Live key instead of Test key
- Make sure your keys start with `pk_test_` and `sk_test_`

### Error: "Could not determine JSON object when parsing stringified object"
- **Fix**: Your key has spaces or quotes
- Copy the key without any extra characters

### Need Help?
1. Check you copied the ENTIRE key including `pk_test_` prefix
2. Make sure there are no extra spaces in .env file
3. Check your internet connection for Stripe API calls
4. Restart the server: `npm run dev`

---

## Production Keys (Later)

When you're ready for production:
1. Go to Stripe Dashboard → Live Keys
2. Copy `pk_live_` and `sk_live_` keys
3. Update `.env` with production keys
4. Change `BASE_URL` to your production domain

**Important:** Never commit real keys to Git!

---

## File Changed
- Updated `c:\Users\wankh\OneDrive\Desktop\FlexHub\.env` with template values
- You need to replace with YOUR actual Stripe test keys

---

**This is a 5-minute setup. Get your keys now and you'll be testing payments immediately! 🚀**
