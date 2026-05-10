const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
    },

    eventType: {
      type: String,
      enum: ["Reunion", "Workshop", "Seminar", "Networking", "Other"],
      default: "Other",
    },

    venue: {
      type: String,
      trim: true,
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },

    lastDateToRegister: {
      type: Date,
    },

    maxAttendees: {
      type: Number,
      default: null, // null = unlimited
    },

    // Alumni who registered for the event
    registeredUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);