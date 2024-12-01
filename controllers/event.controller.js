// controllers/eventController.js
const Event = require('../models/Event.model');



// Get event by ID, only if approved
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      isApproved: true 
    }).populate('postal_circle', 'name');
    
    if (!event) return res.status(404).json({ message: 'Event not found or not approved' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// controllers/event.controller.js
exports.createEvent = async (req, res) => {
  const postal_circle = req.postalCircleId;
  try {
    const event = new Event({ ...req.body, postal_circle, isApproved: false });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch only approved events  , get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: true }).populate('postal_circle', 'name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// controllers/event.controller.js
exports.updateEvent = async (req, res) => {
  try {
    // Retrieve the existing event
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });

    // Only update fields that are explicitly provided in req.body
    const updateData = { ...req.body };

    // If isApproved is not in req.body, keep the original value
    if (req.body.isApproved === undefined) {
      updateData.isApproved = existingEvent.isApproved;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedEvent);
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

// Get upcoming approved events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({ 
      startDate: { $gt: today },
      isApproved: true // Only fetch approved events
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
