const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Donation = require("../../models/Donation");
const User = require("../../models/User");

dotenv.config();

const seedDonations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const alumni = await User.find({ role: "alumni", isApproved: true });

    if (alumni.length === 0) {
      console.log("No alumni found. Run seedUsers.js first.");
      process.exit(1);
    }

    await Donation.deleteMany();
    console.log("Existing donations cleared");

    const donations = [
      {
        donor: alumni[0]._id,
        amount: 5000,
        cause: "Scholarship",
        message: "For deserving students who cannot afford fees.",
        paymentStatus: "Completed",
        transactionId: "MOCK-001",
        isAnonymous: false,
      },
      {
        donor: alumni[1]._id,
        amount: 2500,
        cause: "Infrastructure",
        message: "Hope this helps improve the labs.",
        paymentStatus: "Completed",
        transactionId: "MOCK-002",
        isAnonymous: false,
      },
      {
        donor: alumni[2]._id,
        amount: 10000,
        cause: "Scholarship",
        message: "",
        paymentStatus: "Completed",
        transactionId: "MOCK-003",
        isAnonymous: true, // anonymous donor
      },
      {
        donor: alumni[3]._id,
        amount: 3000,
        cause: "Research",
        message: "Supporting the next generation of researchers from GEC.",
        paymentStatus: "Completed",
        transactionId: "MOCK-004",
        isAnonymous: false,
      },
      {
        donor: alumni[4]._id,
        amount: 7500,
        cause: "General Fund",
        message: "Happy to give back to the college that shaped me.",
        paymentStatus: "Completed",
        transactionId: "MOCK-005",
        isAnonymous: false,
      },
      {
        donor: alumni[5]._id,
        amount: 15000,
        cause: "Infrastructure",
        message: "For building a better structural engineering lab.",
        paymentStatus: "Completed",
        transactionId: "MOCK-006",
        isAnonymous: false,
      },
      {
        donor: alumni[6]._id,
        amount: 4000,
        cause: "Scholarship",
        message: "",
        paymentStatus: "Completed",
        transactionId: "MOCK-007",
        isAnonymous: true,
      },
      {
        donor: alumni[7]._id,
        amount: 20000,
        cause: "Research",
        message: "Invest in research, invest in the future.",
        paymentStatus: "Completed",
        transactionId: "MOCK-008",
        isAnonymous: false,
      },
      {
        donor: alumni[8]._id,
        amount: 1000,
        cause: "General Fund",
        message: "Small contribution, big heart.",
        paymentStatus: "Completed",
        transactionId: "MOCK-009",
        isAnonymous: false,
      },
      {
        donor: alumni[0]._id,
        amount: 5000,
        cause: "Infrastructure",
        message: "Second donation — for computer lab upgrades.",
        paymentStatus: "Pending", // pending donation
        transactionId: "MOCK-010",
        isAnonymous: false,
      },
    ];

    await Donation.insertMany(donations);
    console.log(`${donations.length} donations seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDonations();