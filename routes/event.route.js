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

// middleware
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
const isMediator = require('../middlewares/isMediator');
const authenticateuser = require('../middlewares/authenticateuser');


router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/upcoming', getUpcomingEvents); 
router.post('/',createEvent); // mediator and postalcircle
router.put('/:id', updateEvent);// mediator and postalcircle
router.delete('/:id', deleteEvent);// mediator and postalcircle


module.exports = router;
