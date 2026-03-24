const { getAnalyticsData } = require('../services/analyticsService');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Get analytics for a specific event (Organizer only)
const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Not authorized to view analytics for this event' 
      });
    }

    const analytics = await getAnalyticsData(eventId);

    res.json({
      message: 'Analytics retrieved successfully',
      analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error retrieving analytics' });
  }
};

// Get organizer dashboard analytics (all events)
const getOrganizerDashboardAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });

    const eventAnalytics = [];

    for (let event of events) {
      const analytics = await getAnalyticsData(event._id);
      eventAnalytics.push({
        eventId: event._id,
        title: event.title,
        ...analytics,
      });
    }

    // Calculate overall stats
    const totalEvents = events.length;
    const totalRegistrations = eventAnalytics.reduce(
      (sum, e) => sum + e.totalRegistrations,
      0
    );
    const totalRevenue = eventAnalytics.reduce(
      (sum, e) => sum + e.totalRevenue,
      0
    );
    const pendingRevenue = eventAnalytics.reduce(
      (sum, e) => sum + e.pendingRevenue,
      0
    );

    res.json({
      message: 'Dashboard analytics retrieved successfully',
      summary: {
        totalEvents,
        totalRegistrations,
        totalRevenue,
        pendingRevenue,
      },
      events: eventAnalytics,
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Error retrieving dashboard analytics' });
  }
};

module.exports = {
  getEventAnalytics,
  getOrganizerDashboardAnalytics,
};
