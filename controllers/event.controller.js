// controllers/eventController.js
const Event = require('../models/Event.model');

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate({
      path: 'postal_circle', // Field to populate in Event schema
      select: 'name' // Only retrieve the 'name' field from PostalCircle
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Create a new event
exports.createEvent = async (req, res) => {
  const postal_circle = req.postalCircleId
  try {
    const event = new Event({...req.body, postal_circle});
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: 'postal_circle', // Field to populate in Event schema
      select: 'name' // Only retrieve the 'name' field from PostalCircle
    });
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({ startDate: { $gt: today } });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
