const express = require("express");
const router = express.Router();

const {
  createStory,
  getAllStories,
  getStoryById,
  deleteStory,
  getPendingStories,
  approveStory,
  getMyStories,
} = require("../controllers/storyController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public
router.get("/", getAllStories);                                     // GET    /api/stories?category=Career
router.get("/:id", getStoryById);                                   // GET    /api/stories/:id

// Alumni
router.post("/", protect, createStory);                             // POST   /api/stories
router.get("/user/my-stories", protect, getMyStories);             // GET    /api/stories/user/my-stories
router.delete("/:id", protect, deleteStory);                        // DELETE /api/stories/:id

// Admin
router.get("/admin/pending", protect, adminOnly, getPendingStories); // GET   /api/stories/admin/pending
router.put("/:id/approve", protect, adminOnly, approveStory);        // PUT   /api/stories/:id/approve

module.exports = router;