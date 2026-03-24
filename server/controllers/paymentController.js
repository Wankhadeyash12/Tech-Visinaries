const Registration = require('../models/Registration');
const Event = require('../models/Event');
const stripeService = require('../services/stripeService');

// Create checkout session
const createCheckoutSession = async (req, res) => {
  try {
    const { eventSlug, teamName, teamMembers } = req.body;
    const participantId = req.user.id;
    const participantEmail = req.user.email;
    const participantName = req.user.name;

    // Validation
    if (!eventSlug || !teamName || !teamMembers || teamMembers.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find event by slug
    const event = await Event.findOne({ slug: eventSlug, isPublished: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Validate team size
    if (
      teamMembers.length < event.teamMinSize ||
      teamMembers.length > event.teamMaxSize
    ) {
      return res.status(400).json({
        message: `Team size must be between ${event.teamMinSize} and ${event.teamMaxSize}`,
      });
    }

    // Check if participant already registered for this event
    const existingRegistration = await Registration.findOne({
      event: event._id,
      participant: participantId,
    });

    if (existingRegistration) {
      return res
        .status(409)
        .json({ message: 'Already registered for this event' });
    }

    // Create initial registration with Pending payment status
    const registration = new Registration({
      event: event._id,
      participant: participantId,
      teamName,
      teamMembers,
      registrationFee: event.registrationFee,
      paymentStatus: 'Pending',
      approvalStatus: 'Pending',
    });

    await registration.save();

    // Create Stripe checkout session
    const baseURL =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const stripeSessionData = {
      eventTitle: event.title,
      eventId: event._id.toString(),
      participantName,
      participantEmail,
      teamName,
      registrationFee: event.registrationFee,
      teamMembers,
      baseURL,
    };

    const stripeResult = await stripeService.createCheckoutSession(
      stripeSessionData
    );

    if (!stripeResult.success) {
      // Delete the registration if Stripe session fails
      await Registration.findByIdAndDelete(registration._id);
      console.error('Stripe checkout error:', stripeResult.error);
      
      // Check if it's a key configuration issue
      if (stripeResult.error && stripeResult.error.includes('API key')) {
        return res
          .status(500)
          .json({ 
            message: 'Payment configuration error: Stripe API keys are not properly configured. Please contact administrator.',
            error: 'STRIPE_CONFIG_ERROR'
          });
      }
      
      return res
        .status(500)
        .json({ 
          message: 'Failed to create payment session: ' + (stripeResult.error || 'Unknown error'),
          error: stripeResult.error
        });
    }

    // Save Stripe session ID to registration
    registration.stripeSessionId = stripeResult.sessionId;
    await registration.save();

    res.json({
      message: 'Checkout session created',
      sessionId: stripeResult.sessionId,
      checkoutUrl: stripeResult.checkoutUrl,
      registrationId: registration._id,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    
    // Check for Stripe key configuration issues
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ 
        message: 'Stripe API key is not configured. Please set STRIPE_SECRET_KEY in .env file.',
        error: 'STRIPE_KEY_NOT_CONFIGURED'
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating checkout session: ' + error.message,
      error: error.message
    });
  }
};

// Handle webhook events from Stripe
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    let body = req.rawBody;

    if (!signature || !body) {
      return res.status(400).json({ message: 'Missing signature or body' });
    }

    // Convert Buffer to string if needed
    if (Buffer.isBuffer(body)) {
      body = body.toString('utf8');
    }

    const verificationResult = stripeService.verifyWebhookSignature(
      body,
      signature
    );

    if (!verificationResult.valid) {
      console.log('Webhook signature verification failed');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = verificationResult.event;

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Find registration by Stripe session ID
      const registration = await Registration.findOne({
        stripeSessionId: session.id,
      });

      if (!registration) {
        console.error('Registration not found for session:', session.id);
        return res.status(404).json({ message: 'Registration not found' });
      }

      // Update registration with payment details
      registration.paymentStatus = 'Completed';
      registration.stripePaymentIntentId = session.payment_intent;
      await registration.save();

      // Update event total registrations if payment is completed
      const event = await Event.findById(registration.event);
      if (event && !event.totalRegistrations) {
        event.totalRegistrations = 0;
      }
      event.totalRegistrations += 1;
      await event.save();

      console.log('Payment completed for registration:', registration._id);
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;

      // Find registration by payment intent
      const registration = await Registration.findOne({
        stripePaymentIntentId: paymentIntent.id,
      });

      if (registration) {
        registration.paymentStatus = 'Failed';
        await registration.save();
        console.log('Payment failed for registration:', registration._id);
      }
    }

    // Handle charge.refunded
    if (event.type === 'charge.refunded') {
      console.log('Charge refunded:', event.data.object);
      // Handle refund logic if needed
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};

// Complete payment manually (for local testing without Stripe CLI)
const completePaymentManually = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const participantId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    // Find registration by Stripe session ID
    const registration = await Registration.findOne({
      stripeSessionId: sessionId,
      participant: participantId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if payment is already completed
    if (registration.paymentStatus === 'Completed') {
      return res.json({
        message: 'Payment already completed',
        registration,
      });
    }

    // Get session from Stripe to verify payment_status
    const sessionResult = await stripeService.retrieveCheckoutSession(sessionId);
    if (!sessionResult.success) {
      return res.status(500).json({ message: 'Failed to verify session' });
    }

    const session = sessionResult.session;

    // If payment was successful, update registration
    if (session.payment_status === 'paid') {
      registration.paymentStatus = 'Completed';
      registration.stripePaymentIntentId = session.payment_intent;
      await registration.save();

      // Update event total registrations
      const event = await Event.findById(registration.event);
      if (event) {
        if (!event.totalRegistrations) {
          event.totalRegistrations = 0;
        }
        event.totalRegistrations += 1;
        await event.save();
      }

      console.log('Payment completed manually for registration:', registration._id);

      return res.json({
        message: 'Payment completed successfully',
        registration,
      });
    }

    return res.status(400).json({ message: 'Payment not completed yet' });
  } catch (error) {
    console.error('Complete payment manually error:', error);
    res.status(500).json({ message: 'Error completing payment' });
  }
};

// Get payment session details
const getPaymentSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const result = await stripeService.retrieveCheckoutSession(sessionId);

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    const session = result.session;

    // Find registration by Stripe session ID
    const registration = await Registration.findOne({
      stripeSessionId: sessionId,
    })
      .populate('event', 'title slug')
      .populate('participant', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({
      message: 'Payment session details retrieved',
      session: {
        id: session.id,
        status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
      },
      registration: {
        id: registration._id,
        teamName: registration.teamName,
        event: registration.event,
        paymentStatus: registration.paymentStatus,
        approvalStatus: registration.approvalStatus,
      },
    });
  } catch (error) {
    console.error('Get payment session details error:', error);
    res.status(500).json({ message: 'Error retrieving payment session details' });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPaymentSessionDetails,
  completePaymentManually,
};
