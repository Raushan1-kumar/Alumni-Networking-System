const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllAlumniAdmin,
  approveAlumni,
  revokeAlumni,
  makeAdmin,
  deleteAlumni,
  getRecentActivity,
  getBatchStats,
  getDepartmentStats,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All admin routes — must be logged in AND be an admin
router.use(protect, adminOnly);

router.get("/dashboard",              getDashboardStats);      // GET /api/admin/dashboard
router.get("/recent-activity",        getRecentActivity);      // GET /api/admin/recent-activity
router.get("/batch-stats",            getBatchStats);           // GET /api/admin/batch-stats
router.get("/department-stats",       getDepartmentStats);      // GET /api/admin/department-stats

router.get("/alumni",                 getAllAlumniAdmin);       // GET /api/admin/alumni?isApproved=false
router.put("/alumni/:id/approve",     approveAlumni);           // PUT /api/admin/alumni/:id/approve
router.put("/alumni/:id/revoke",      revokeAlumni);            // PUT /api/admin/alumni/:id/revoke
router.put("/alumni/:id/make-admin",  makeAdmin);               // PUT /api/admin/alumni/:id/make-admin
router.delete("/alumni/:id",          deleteAlumni);            // DELETE /api/admin/alumni/:id
app.use("/api/admin", require("./routes/adminRoutes"));

module.exports = router;