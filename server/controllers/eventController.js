const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { generateSlug, createUniqueSlug } = require('../services/slugService');

// Create event (Organizer only)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      rules,
      eventMode,
      venue,
      meetingLink,
      eventDateTime,
      registrationDeadline,
      teamMinSize,
      teamMaxSize,
      registrationFee,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !eventMode ||
      !eventDateTime ||
      !registrationDeadline ||
      !teamMinSize ||
      !teamMaxSize
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate slug
    const baseSlug = generateSlug(title);
    const slug = createUniqueSlug(baseSlug);

    // Handle banner image
    let bannerImage = null;
    if (req.file) {
      bannerImage = `/uploads/${req.file.filename}`;
    }

    const event = new Event({
      title,
      description,
      rules: rules || '',
      slug,
      eventMode,
      venue: venue || '',
      meetingLink: meetingLink || '',
      eventDateTime,
      registrationDeadline,
      teamMinSize: parseInt(teamMinSize),
      teamMaxSize: parseInt(teamMaxSize),
      registrationFee: registrationFee || 0,
      bannerImage,
      organizer: req.user.id,
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Get all events by organizer
const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).populate(
      'organizer',
      'name email'
    );

    res.json({
      message: 'Events retrieved successfully',
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error retrieving events' });
  }
};

// Get event by slug (public route)
const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const event = await Event.findOne({ slug, isPublished: true }).populate(
      'organizer',
      'name email'
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event retrieved successfully',
      event,
    });
  } catch (error) {
    console.error('Get event by slug error:', error);
    res.status(500).json({ message: 'Error retrieving event' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      rules,
      eventMode,
      venue,
      meetingLink,
      eventDateTime,
      registrationDeadline,
      teamMinSize,
      teamMaxSize,
      registrationFee,
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (rules) event.rules = rules;
    if (eventMode) event.eventMode = eventMode;
    if (venue) event.venue = venue;
    if (meetingLink) event.meetingLink = meetingLink;
    if (eventDateTime) event.eventDateTime = eventDateTime;
    if (registrationDeadline) event.registrationDeadline = registrationDeadline;
    if (teamMinSize) event.teamMinSize = parseInt(teamMinSize);
    if (teamMaxSize) event.teamMaxSize = parseInt(teamMaxSize);
    if (registrationFee !== undefined) event.registrationFee = registrationFee;

    if (req.file) {
      event.bannerImage = `/uploads/${req.file.filename}`;
    }

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};

// Publish event
const publishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to publish this event' });
    }

    event.isPublished = true;
    await event.save();

    res.json({
      message: 'Event published successfully',
      event,
    });
  } catch (error) {
    console.error('Publish event error:', error);
    res.status(500).json({ message: 'Error publishing event' });
  }
};

// Get all published events (Public - for browsing)
const getAllPublishedEvents = async (req, res) => {
  try {
    const { search, mode, sortBy } = req.query;

    let filter = { isPublished: true };

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add mode filter if provided
    if (mode && ['online', 'offline', 'hybrid'].includes(mode)) {
      filter.eventMode = mode;
    }

    let query = Event.find(filter).populate('organizer', 'name email');

    // Apply sorting
    if (sortBy === 'upcoming') {
      query = query.sort({ eventDateTime: 1 });
    } else if (sortBy === 'trending') {
      query = query.sort({ totalRegistrations: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const events = await query.exec();

    res.json({
      message: 'Published events retrieved successfully',
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Get published events error:', error);
    res.status(500).json({ message: 'Error retrieving events' });
  }
};

// Get event registrations (Organizer only)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Not authorized to view registrations for this event' 
      });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('participant', 'name email')
      .populate('event', 'title');

    res.json({
      message: 'Registrations retrieved successfully',
      registrations,
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Error retrieving registrations' });
  }
};

module.exports = {
  createEvent,
  getOrganizerEvents,
  getEventBySlug,
  getAllPublishedEvents,
  updateEvent,
  deleteEvent,
  publishEvent,
  getEventRegistrations,
};
