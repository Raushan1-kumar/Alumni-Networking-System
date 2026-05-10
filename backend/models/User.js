const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password in queries by default
    },

    role: {
      type: String,
      enum: ["alumni", "admin", "student"],
      default: "alumni",
    },

    // Admin approves account before alumni or student can login
    isApproved: {
      type: Boolean,
      default: false,
    },

    enrollmentYear: {
      type: Number,
    },

    course: {
      type: String,
      trim: true,
    },

    studentId: {
      type: String,
      trim: true,
    },

    // ── Profile Info ──────────────────────────────────────────
    profilePhoto: {
      type: String,
      default: "",
    },

    batchYear: {
      type: Number,
    },

    department: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    // ── Professional Info ─────────────────────────────────────
    currentCompany: {
      type: String,
      trim: true,
    },

    currentRole: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    linkedIn: {
      type: String,
      trim: true,
    },

    // ── Interests for networking ──────────────────────────────
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);