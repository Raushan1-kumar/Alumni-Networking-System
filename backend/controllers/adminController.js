const User = require("../models/User");
const Job = require("../models/Job");
const Event = require("../models/Event");
const Post = require("../models/Post");
const SuccessStory = require("../models/SuccessStory");
const Donation = require("../models/Donation");
const Survey = require("../models/Survey");

// ─────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// Admin only — overall platform stats for dashboard
// ─────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    // Run all count queries in parallel for speed
    const [
      totalAlumni,
      pendingApprovals,
      totalJobs,
      activeJobs,
      totalEvents,
      upcomingEvents,
      totalPosts,
      pendingStories,
      totalStories,
      totalSurveys,
      donationStats,
    ] = await Promise.all([
      User.countDocuments({ role: "alumni", isApproved: true }),
      User.countDocuments({ role: { $in: ["alumni", "student"] }, isApproved: false }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Event.countDocuments({ eventDate: { $gte: new Date() }, isActive: true }),
      Post.countDocuments(),
      SuccessStory.countDocuments({ isApproved: false }),
      SuccessStory.countDocuments({ isApproved: true }),
      Survey.countDocuments({ isActive: true }),
      Donation.aggregate([
        { $match: { paymentStatus: "Completed" } },
        {
          $group: {
            _id: null,
            totalRaised: { $sum: "$amount" },
            totalDonors: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      alumni: {
        total: totalAlumni,
        pendingApprovals,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
      },
      posts: {
        total: totalPosts,
      },
      stories: {
        approved: totalStories,
        pendingApprovals: pendingStories,
      },
      surveys: {
        active: totalSurveys,
      },
      donations: {
        totalRaised: donationStats[0]?.totalRaised || 0,
        totalDonors: donationStats[0]?.totalDonors || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/alumni
// Admin only — get all alumni with full details
// Supports filter: isApproved, department, batchYear
// ─────────────────────────────────────────────────────────────
const getAllAlumniAdmin = async (req, res) => {
  try {
    const { isApproved, department, batchYear } = req.query;

    const filter = { role: "alumni" };

    if (isApproved !== undefined) {
      filter.isApproved = isApproved === "true";
    }
    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }
    if (batchYear) {
      filter.batchYear = Number(batchYear);
    }

    const alumni = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ count: alumni.length, alumni });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/alumni/:id/approve
// Admin only — approve a pending alumni account
// ─────────────────────────────────────────────────────────────
const approveAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isApproved) {
      return res.status(400).json({ message: "Account is already approved" });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: `${user.name}'s account approved successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/alumni/:id/revoke
// Admin only — revoke access of an approved alumni
// ─────────────────────────────────────────────────────────────
const revokeAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = false;
    await user.save();

    res.json({ message: `${user.name}'s access has been revoked` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/alumni/:id/make-admin
// Admin only — promote an alumni to admin role
// ─────────────────────────────────────────────────────────────
const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    user.role = "admin";
    await user.save();

    res.json({ message: `${user.name} has been promoted to admin` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/alumni/:id
// Admin only — permanently delete a user account
// ─────────────────────────────────────────────────────────────
const deleteAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await user.deleteOne();
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/recent-activity
// Admin only — latest registrations, jobs, donations
// ─────────────────────────────────────────────────────────────
const getRecentActivity = async (req, res) => {
  try {
    const [recentAlumni, recentJobs, recentDonations, recentStories] =
      await Promise.all([
        User.find({ role: "alumni" })
          .select("name email department batchYear isApproved createdAt")
          .sort({ createdAt: -1 })
          .limit(5),

        Job.find()
          .populate("postedBy", "name")
          .select("title company location createdAt")
          .sort({ createdAt: -1 })
          .limit(5),

        Donation.find({ paymentStatus: "Completed" })
          .populate("donor", "name")
          .select("amount cause isAnonymous createdAt")
          .sort({ createdAt: -1 })
          .limit(5),

        SuccessStory.find()
          .populate("author", "name")
          .select("title category isApproved createdAt")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    res.json({
      recentAlumni,
      recentJobs,
      recentDonations,
      recentStories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/batch-stats
// Admin only — alumni count grouped by batch year (for charts)
// ─────────────────────────────────────────────────────────────
const getBatchStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: "alumni", isApproved: true } },
      {
        $group: {
          _id: "$batchYear",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // sort by year ascending
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/department-stats
// Admin only — alumni count grouped by department (for charts)
// ─────────────────────────────────────────────────────────────
const getDepartmentStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: "alumni", isApproved: true } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }, // most alumni first
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllAlumniAdmin,
  approveAlumni,
  revokeAlumni,
  makeAdmin,
  deleteAlumni,
  getRecentActivity,
  getBatchStats,
  getDepartmentStats,
};