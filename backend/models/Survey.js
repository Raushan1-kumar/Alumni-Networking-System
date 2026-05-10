const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
  },

  questionType: {
    type: String,
    enum: ["text", "multiple-choice", "rating"], // 3 types supported
    default: "text",
  },

  // Only used when questionType is "multiple-choice"
  options: [
    {
      type: String,
      trim: true,
    },
  ],

  isRequired: {
    type: Boolean,
    default: true,
  },
});

const responseSchema = new mongoose.Schema({
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Each answer maps to a question by index
  answers: [
    {
      questionIndex: Number,
      answer: String, // all answers stored as string (rating = "4", choice = "Option A")
    },
  ],

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const surveySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Survey title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    questions: [questionSchema],

    // Responses submitted by alumni
    responses: [responseSchema],

    lastDateToRespond: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Survey", surveySchema);