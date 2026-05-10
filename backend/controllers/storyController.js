const SuccessStory = require("../models/SuccessStory");

// ─────────────────────────────────────────────────────────────
// POST /api/stories
// Private — alumni submits their story (pending approval)
// ─────────────────────────────────────────────────────────────
const createStory = async (req, res) => {
  try {
    if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only alumni can submit success stories' });
    }

    const { title, story, achievement, category, image } = req.body;

    const newStory = await SuccessStory.create({
      author: req.user._id,
      title,
      story,
      achievement,
      category,
      image,
    });

    res.status(201).json({
      message: "Story submitted successfully. Waiting for admin approval.",
      story: newStory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/stories
// Public — get all approved stories
// Supports filter by category
// ─────────────────────────────────────────────────────────────
const getAllStories = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isApproved: true };

    if (category) filter.category = category;

    const stories = await SuccessStory.find(filter)
      .populate("author", "name profilePhoto batchYear department")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/stories/:id
// Public — get a single story
// ─────────────────────────────────────────────────────────────
const getStoryById = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id).populate(
      "author",
      "name profilePhoto batchYear department currentRole"
    );

    if (!story || !story.isApproved) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/stories/:id
// Private — author or admin can delete
// ─────────────────────────────────────────────────────────────
const deleteStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (
      story.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this story" });
    }

    await story.deleteOne();
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: GET /api/stories/admin/pending
// Admin — get all stories waiting for approval
// ─────────────────────────────────────────────────────────────
const getPendingStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ isApproved: false })
      .populate("author", "name email batchYear department")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: PUT /api/stories/:id/approve
// Admin — approve a submitted story
// ─────────────────────────────────────────────────────────────
const approveStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    story.isApproved = true;
    await story.save();

    res.json({ message: "Story approved and published" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/stories/my-stories
// Private — alumni sees their own submitted stories
// ─────────────────────────────────────────────────────────────
const getMyStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ author: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStory,
  getAllStories,
  getStoryById,
  deleteStory,
  getPendingStories,
  approveStory,
  getMyStories,
};