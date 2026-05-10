const express = require("express");
const router = express.Router();

const {
  createDonation,
  getAllDonations,
  getPublicDonations,
  getMyDonations,
  getDonationSummary,
} = require("../controllers/donationController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public
router.get("/public", getPublicDonations);                          // GET /api/donations/public
router.get("/summary", getDonationSummary);                         // GET /api/donations/summary

// Alumni
router.post("/", protect, createDonation);                          // POST /api/donations
router.get("/my-donations", protect, getMyDonations);               // GET /api/donations/my-donations

// Admin
router.get("/", protect, adminOnly, getAllDonations);               // GET /api/donations?cause=&paymentStatus=

module.exports = router;