const Donation = require("../models/Donation");

// ─────────────────────────────────────────────────────────────
// POST /api/donations
// Private — alumni submits a donation pledge
// ─────────────────────────────────────────────────────────────
const createDonation = async (req, res) => {
  try {
    const { amount, cause, message, isAnonymous, paymentStatus, transactionId } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      amount,
      cause,
      message,
      isAnonymous,
      paymentStatus: paymentStatus || "Completed",
      transactionId: transactionId || `MOCK-${Date.now()}`,
    });

    res.status(201).json({
      message: "Thank you for your donation!",
      donation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/donations
// Admin — get all donations with donor info
// ─────────────────────────────────────────────────────────────
const getAllDonations = async (req, res) => {
  try {
    const { cause, paymentStatus } = req.query;

    const filter = {};
    if (cause) filter.cause = cause;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const donations = await Donation.find(filter)
      .populate("donor", "name email batchYear department")
      .sort({ createdAt: -1 });

    // Calculate total amount raised
    const totalRaised = donations
      .filter((d) => d.paymentStatus === "Completed")
      .reduce((sum, d) => sum + d.amount, 0);

    res.json({ totalRaised, count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/donations/public
// Public — show recent donors (respects anonymous flag)
// ─────────────────────────────────────────────────────────────
const getPublicDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ paymentStatus: "Completed" })
      .populate("donor", "name profilePhoto")
      .sort({ createdAt: -1 })
      .limit(20);

    // Hide donor name if anonymous
    const result = donations.map((d) => ({
      _id: d._id,
      donor: d.isAnonymous ? { name: "Anonymous" } : d.donor,
      amount: d.amount,
      cause: d.cause,
      message: d.message,
      createdAt: d.createdAt,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/donations/my-donations
// Private — alumni sees their own donation history
// ─────────────────────────────────────────────────────────────
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort({
      createdAt: -1,
    });

    const total = donations
      .filter((d) => d.paymentStatus === "Completed")
      .reduce((sum, d) => sum + d.amount, 0);

    res.json({ totalDonated: total, donations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/donations/summary
// Public — total raised per cause (for dashboard display)
// ─────────────────────────────────────────────────────────────
const getDonationSummary = async (req, res) => {
  try {
    const summary = await Donation.aggregate([
      { $match: { paymentStatus: "Completed" } },
      {
        $group: {
          _id: "$cause",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getPublicDonations,
  getMyDonations,
  getDonationSummary,
};