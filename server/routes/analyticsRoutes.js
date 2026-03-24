const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getEventAnalytics,
  getOrganizerDashboardAnalytics,
} = require('../controllers/analyticsController');

const router = express.Router();

// Analytics routes (Organizer only)
router.get(
  '/event/:eventId',
  authMiddleware,
  roleMiddleware(['organizer']),
  getEventAnalytics
);

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware(['organizer']),
  getOrganizerDashboardAnalytics
);

module.exports = router;
