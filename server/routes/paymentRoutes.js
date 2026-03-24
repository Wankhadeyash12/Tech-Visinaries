const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createCheckoutSession,
  handleWebhook,
  getPaymentSessionDetails,
  completePaymentManually,
} = require('../controllers/paymentController');

// Create checkout session (requires authentication as participant)
router.post(
  '/create-checkout-session',
  authMiddleware,
  roleMiddleware(['participant']),
  createCheckoutSession
);

// Get payment session details (requires authentication as participant)
router.get(
  '/session-details',
  authMiddleware,
  roleMiddleware(['participant']),
  getPaymentSessionDetails
);

// Complete payment manually (for local testing)
router.post(
  '/complete-payment',
  authMiddleware,
  roleMiddleware(['participant']),
  completePaymentManually
);

// Stripe webhook (no auth needed, raw body required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
