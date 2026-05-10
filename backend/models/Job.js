const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Who posted this job
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Remote", "Contract"],
      default: "Full-time",
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
    },

    requirements: {
      type: String, // free text — e.g. "2 years React experience"
    },

    salary: {
      type: String, // keep it a string e.g. "8-12 LPA" or "Not disclosed"
      default: "Not disclosed",
    },

    applyLink: {
      type: String, // external URL or email to apply
      trim: true,
    },

    lastDate: {
      type: Date, // application deadline
    },

    // List of alumni who applied (via the platform)
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true, // admin or poster can close the listing
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);