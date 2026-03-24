// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️ STRIPE_SECRET_KEY is not defined in .env file');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const stripeService = {
  // Create checkout session for registration
  createCheckoutSession: async (registrationData) => {
    try {
      // Validate Stripe key is available
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe API key is not configured. Please set STRIPE_SECRET_KEY in .env file');
      }

      const {
        eventTitle,
        eventId,
        participantName,
        participantEmail,
        teamName,
        registrationFee,
        teamMembers,
        baseURL,
      } = registrationData;

      const lineItems = [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${eventTitle} - Team Registration`,
              description: `Team: ${teamName} (${teamMembers.length} members)`,
              metadata: {
                eventId,
                teamName,
              },
            },
            unit_amount: Math.round(registrationFee * 100), // Convert to paise
          },
          quantity: 1,
        },
      ];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: participantEmail,
        metadata: {
          eventId,
          participantName,
          teamName,
          teamMembersCount: teamMembers.length,
          teamMembers: JSON.stringify(teamMembers),
        },
        success_url: `${baseURL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseURL}/payment-cancel`,
      });

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
      };
    } catch (error) {
      console.error('Stripe checkout session error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Retrieve checkout session details
  retrieveCheckoutSession: async (sessionId) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        success: true,
        session,
      };
    } catch (error) {
      console.error('Stripe retrieve session error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Verify webhook signature
  verifyWebhookSignature: (body, signature) => {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return {
        valid: true,
        event,
      };
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  },

  // Get payment intent details
  getPaymentIntent: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Get payment intent error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

module.exports = stripeService;
