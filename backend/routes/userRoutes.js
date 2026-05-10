const express = require("express");
const router = express.Router();

const {
  getAllAlumni,
  getAlumniById,
  updateProfile,
  changePassword,
  getPendingUsers,
  approveUser,
  deleteUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// ── Alumni Routes (any logged-in user) ───────────────────────
router.get("/", protect, getAllAlumni);                       // GET  /api/users?name=&department=
router.get("/:id", protect, getAlumniById);                  // GET  /api/users/:id
router.put("/profile", protect, updateProfile);              // PUT  /api/users/profile
router.put("/change-password", protect, changePassword);     // PUT  /api/users/change-password

// ── Admin Only Routes ─────────────────────────────────────────
router.get("/admin/pending", protect, adminOnly, getPendingUsers);     // GET  /api/users/admin/pending
router.put("/:id/approve", protect, adminOnly, approveUser);           // PUT  /api/users/:id/approve
router.delete("/:id", protect, adminOnly, deleteUser);                 // DELETE /api/users/:id

module.exports = router;