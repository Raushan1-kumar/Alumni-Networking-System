const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getAttendees,
  getMyRegistrations,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.use(protect); // all routes need login

router.get("/", getAllEvents);                                       // GET    /api/events?eventType=&upcoming=true
router.get("/my-registrations", getMyRegistrations);                // GET    /api/events/my-registrations
router.get("/:id", getEventById);                                   // GET    /api/events/:id
router.post("/:id/register", registerForEvent);                     // POST   /api/events/:id/register
router.delete("/:id/register", cancelRegistration);                 // DELETE /api/events/:id/register

// Admin only for update/delete
router.post("/", adminOnly, createEvent);                           // POST   /api/events (admin only)
router.put("/:id", adminOnly, updateEvent);                         // PUT    /api/events/:id
router.delete("/:id", adminOnly, deleteEvent);                      // DELETE /api/events/:id
router.get("/:id/attendees", adminOnly, getAttendees);              // GET    /api/events/:id/attendees

module.exports = router;