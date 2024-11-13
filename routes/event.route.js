// routes/eventRoutes.js
const express = require('express');
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/',authenticatePostalCircle,createEvent);

router.put('/:id',authenticatePostalCircle,updateEvent);
router.delete('/:id', authenticatePostalCircle,deleteEvent);

module.exports = router;
