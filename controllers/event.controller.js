// controllers/eventController.js
const Event = require('../models/Event.model');
const PostalCircle = require('../models/PostalCircle.model');

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
  try {
    const { postalCircle, ...eventData } = req.body; // postcircle came from dropdown

    // Validate postalCircle
    if (!postalCircle) {
      return res.status(400).json({ message: "Postal Circle is required" });
    }

    // Find the postal circle by name
    const postal_circle = await PostalCircle.findOne({ name: postalCircle });

    if (!postal_circle) {
      return res.status(404).json({ message: "Postal Circle not found" });
    }

    // console.log(`Postal Circle`, postal_circle._id);
    
    // Create the event
    const event = new Event({
      ...eventData,
      postal_circle: postal_circle._id,
      // isApproved: false, // Default to false
    });

    // Save the event
    await event.save();

    // Populate the postal_circle field
    await event.populate('postal_circle', 'name');
    
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: error.message });
  }
};

// get all events 
exports.getEvents = async (req, res) => {
  try {
    // Filter for events where status is "accept" or "pending" and isApproved is true
    const events = await Event.find({ 
      status: { $in: ['accept', 'pending'] },
    }).populate('postal_circle', 'name');
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
