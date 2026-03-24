const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  registerForEvent,
  getParticipantRegistrations,
  approveRegistration,
  rejectRegistration,
} = require('../controllers/registrationController');

const router = express.Router();

// Participant registration routes
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['participant']),
  registerForEvent
);

router.get(
  '/my-registrations',
  authMiddleware,
  roleMiddleware(['participant']),
  getParticipantRegistrations
);

// Organizer registration management routes
router.put(
  '/:registrationId/approve',
  authMiddleware,
  roleMiddleware(['organizer']),
  approveRegistration
);

router.put(
  '/:registrationId/reject',
  authMiddleware,
  roleMiddleware(['organizer']),
  rejectRegistration
);

module.exports = router;
