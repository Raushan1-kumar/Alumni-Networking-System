const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    story: {
      type: String,
      required: [true, "Story content is required"],
    },

    achievement: {
      type: String, // e.g. "Got placed at Google", "Started my own company"
      trim: true,
    },

    category: {
      type: String,
      enum: ["Career", "Entrepreneurship", "Research", "Social Work", "Other"],
      default: "Other",
    },

    image: {
      type: String,
      default: "",
    },

    // Admin must approve before it shows publicly
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SuccessStory", successStorySchema);