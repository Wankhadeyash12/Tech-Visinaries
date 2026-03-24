const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createEvent,
  getOrganizerEvents,
  getEventBySlug,
  getAllPublishedEvents,
  updateEvent,
  deleteEvent,
  publishEvent,
  getEventRegistrations,
} = require('../controllers/eventController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Organizer routes
router.post(
  '/create',
  authMiddleware,
  roleMiddleware(['organizer']),
  upload.single('banner'),
  createEvent
);

router.get(
  '/organizer-events',
  authMiddleware,
  roleMiddleware(['organizer']),
  getOrganizerEvents
);

router.put(
  '/:eventId',
  authMiddleware,
  roleMiddleware(['organizer']),
  upload.single('banner'),
  updateEvent
);

router.delete(
  '/:eventId',
  authMiddleware,
  roleMiddleware(['organizer']),
  deleteEvent
);

router.post(
  '/:eventId/publish',
  authMiddleware,
  roleMiddleware(['organizer']),
  publishEvent
);

router.get(
  '/:eventId/registrations',
  authMiddleware,
  roleMiddleware(['organizer']),
  getEventRegistrations
);

// Public routes
router.get('/public/:slug', getEventBySlug);
router.get('/browse/all', getAllPublishedEvents);

module.exports = router;
