const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Amount must be at least 1"],
    },

    cause: {
      type: String,
      enum: ["Scholarship", "Infrastructure", "Research", "General Fund"],
      default: "General Fund",
    },

    message: {
      type: String,
      maxlength: 300,
      default: "",
    },

    // For college project — just track the pledge, no real payment
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },

    // Mock transaction ID — in real app this comes from Razorpay/Stripe
    transactionId: {
      type: String,
      default: "",
    },

    isAnonymous: {
      type: Boolean,
      default: false, // donor can choose to stay anonymous
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);