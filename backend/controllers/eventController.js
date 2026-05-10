const Event = require("../models/Event");

// ─────────────────────────────────────────────────────────────
// POST /api/events
// Admin only — create a new event
// ─────────────────────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      venue,
      eventDate,
      lastDateToRegister,
      maxAttendees,
    } = req.body;

    const event = await Event.create({
      createdBy: req.user._id,
      title,
      description,
      eventType,
      venue,
      eventDate,
      lastDateToRegister,
      maxAttendees,
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/events
// Private — list all active events
// Supports filter: eventType, upcoming
// ─────────────────────────────────────────────────────────────
const getAllEvents = async (req, res) => {
  try {
    const { eventType, upcoming } = req.query;

    const filter = { isActive: true };

    if (eventType) filter.eventType = eventType;

    // Show only future events
    if (upcoming === "true") {
      filter.eventDate = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name profilePhoto")
      .sort({ eventDate: 1 }); // nearest event first

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/events/:id
// Private — get single event details
// ─────────────────────────────────────────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email profilePhoto"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/events/:id
// Admin only — update event details
// ─────────────────────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/events/:id
// Admin only — delete an event
// ─────────────────────────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/events/:id/register
// Private — alumni registers for an event
// ─────────────────────────────────────────────────────────────
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: "This event is no longer active" });
    }

    // Check registration deadline
    if (event.lastDateToRegister && new Date() > event.lastDateToRegister) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    // Check max attendees limit
    if (event.maxAttendees && event.registeredUsers.length >= event.maxAttendees) {
      return res.status(400).json({ message: "Event is fully booked" });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredUsers.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    event.registeredUsers.push({ user: req.user._id });
    await event.save();

    res.json({ message: "Registered for event successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/events/:id/register
// Private — alumni cancels their registration
// ─────────────────────────────────────────────────────────────
const cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isRegistered = event.registeredUsers.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!isRegistered) {
      return res.status(400).json({ message: "You are not registered for this event" });
    }

    event.registeredUsers = event.registeredUsers.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await event.save();
    res.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/events/:id/attendees
// Admin only — see who registered for an event
// ─────────────────────────────────────────────────────────────
const getAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "registeredUsers.user",
      "name email profilePhoto batchYear department"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      eventTitle: event.title,
      totalRegistered: event.registeredUsers.length,
      attendees: event.registeredUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/events/my-registrations
// Private — events the logged-in alumni has registered for
// ─────────────────────────────────────────────────────────────
const getMyRegistrations = async (req, res) => {
  try {
    const events = await Event.find({
      "registeredUsers.user": req.user._id,
    }).sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getAttendees,
  getMyRegistrations,
};