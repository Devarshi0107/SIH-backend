const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents // Import the new function
} = require('../controllers/event.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
const isMediator = require('../middlewares/isMediator');
const authenticateuser = require('../middlewares/authenticateuser');

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.post('/', authenticatePostalCircle, isMediator, createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// New route for upcoming events

module.exports = router;
