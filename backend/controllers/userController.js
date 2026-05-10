const User = require("../models/User");

// ─────────────────────────────────────────────────────────────
// GET /api/users
// Private — get all approved alumni (directory)
// Supports search by name, department, batch, location
// ─────────────────────────────────────────────────────────────
const getAllAlumni = async (req, res) => {
  try {
    const { name, department, batchYear, location, industry } = req.query;

    // Build a filter object based on query params
    const filter = { isApproved: true, role: "alumni" };

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive search
    }
    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }
    if (batchYear) {
      filter.batchYear = Number(batchYear);
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (industry) {
      filter.industry = { $regex: industry, $options: "i" };
    }

    const alumni = await User.find(filter).select(
      "name email profilePhoto batchYear department location currentCompany currentRole industry bio interests"
    );

    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id
// Private — get a single alumni's profile
// ─────────────────────────────────────────────────────────────
const getAlumniById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/users/profile
// Private — update own profile
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      bio,
      currentCompany,
      currentRole,
      industry,
      linkedIn,
      interests,
      profilePhoto,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only fields that were sent
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (currentCompany) user.currentCompany = currentCompany;
    if (currentRole) user.currentRole = currentRole;
    if (industry) user.industry = industry;
    if (linkedIn) user.linkedIn = linkedIn;
    if (interests) user.interests = interests;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/users/change-password
// Private — change own password
// ─────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: GET /api/users/pending
// Admin — get all alumni waiting for approval
// ─────────────────────────────────────────────────────────────
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      isApproved: false,
      role: { $in: ["alumni", "student"] },
    }).select("name email role batchYear department enrollmentYear course studentId createdAt");

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: PUT /api/users/:id/approve
// Admin — approve a registered alumni account
// ─────────────────────────────────────────────────────────────
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: `${user.name}'s account has been approved` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: DELETE /api/users/:id
// Admin — delete a user account
// ─────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAlumni,
  getAlumniById,
  updateProfile,
  changePassword,
  getPendingUsers,
  approveUser,
  deleteUser,
};