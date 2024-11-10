// routes/eventRoutes.js
const express = require('express');
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');
const router = express.Router();

router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
