const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Public — alumni signs up, account pending admin approval
// ─────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, batchYear, department, phone, currentCompany, currentRole, linkedIn } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "alumni",
      batchYear,
      department,
      phone,
      currentCompany,
      currentRole,
      linkedIn,
      isApproved: false,
    });

    res.status(201).json({
      message: "Registration successful. Wait for admin approval before logging in.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerStudent = async (req, res) => {
  try {
    const { name, email, password, course, enrollmentYear, studentId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      course,
      enrollmentYear,
      studentId,
      isApproved: false,
    });

    res.status(201).json({
      message: "Student registration successful. Wait for admin approval before logging in.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerAlumni = async (req, res) => {
  try {
    const { name, email, password, batchYear, department, phone, currentCompany, currentRole, linkedIn } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "alumni",
      batchYear,
      department,
      phone,
      currentCompany,
      currentRole,
      linkedIn,
      isApproved: false,
    });

    res.status(201).json({
      message: "Alumni registration successful. Wait for admin approval before logging in.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Public — alumni logs in with email & password
// ─────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password since it's select:false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if admin approved this account
    if (!user.isApproved) {
      return res
        .status(403)
        .json({ message: "Account not yet approved by admin" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// Private — returns currently logged-in user's info
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by authMiddleware
  res.json(req.user);
};

module.exports = { registerUser, registerStudent, registerAlumni, loginUser, getMe };