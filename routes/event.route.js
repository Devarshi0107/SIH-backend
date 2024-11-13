const express = require('express');
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents // Import the new function
} = require('../controllers/event.controller');
const router = express.Router();

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// New route for upcoming events

module.exports = router;
