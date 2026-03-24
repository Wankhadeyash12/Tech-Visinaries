const Registration = require('../models/Registration');
const Event = require('../models/Event');

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { eventSlug, teamName, teamMembers } = req.body;

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
      participant: req.user.id,
    });

    if (existingRegistration) {
      return res.status(409).json({ message: 'Already registered for this event' });
    }

    // Create registration
    const registration = new Registration({
      event: event._id,
      participant: req.user.id,
      teamName,
      teamMembers,
      registrationFee: event.registrationFee,
    });

    await registration.save();

    // Update total registrations count
    event.totalRegistrations += 1;
    await event.save();

    res.status(201).json({
      message: 'Registered successfully',
      registration,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering for event' });
  }
};

// Get participant registrations
const getParticipantRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      participant: req.user.id,
    })
      .populate('event', 'title slug eventDateTime')
      .populate('participant', 'name email');

    res.json({
      message: 'Registrations retrieved successfully',
      registrations,
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Error retrieving registrations' });
  }
};

// Approve registration (Organizer only)
const approveRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
      .populate('event', 'organizer');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user is the organizer of the event
    if (registration.event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to approve this registration' });
    }

    registration.approvalStatus = 'Approved';
    await registration.save();

    res.json({
      message: 'Registration approved successfully',
      registration,
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ message: 'Error approving registration' });
  }
};

// Reject registration (Organizer only)
const rejectRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
      .populate('event', 'organizer');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user is the organizer of the event
    if (registration.event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this registration' });
    }

    registration.approvalStatus = 'Rejected';
    await registration.save();

    res.json({
      message: 'Registration rejected successfully',
      registration,
    });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ message: 'Error rejecting registration' });
  }
};

module.exports = {
  registerForEvent,
  getParticipantRegistrations,
  approveRegistration,
  rejectRegistration,
};
