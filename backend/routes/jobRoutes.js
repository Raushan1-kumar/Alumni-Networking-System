const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getApplicants,
  getMyPostedJobs,
  closeJob,
} = require("../controllers/jobController");

const { protect } = require("../middleware/authMiddleware");

// All job routes require login
router.use(protect);

router.post("/", createJob);                        // POST   /api/jobs
router.get("/", getAllJobs);                         // GET    /api/jobs?jobType=&location=&search=
router.get("/my-posts", getMyPostedJobs);           // GET    /api/jobs/my-posts
router.get("/:id", getJobById);                     // GET    /api/jobs/:id
router.put("/:id", updateJob);                      // PUT    /api/jobs/:id
router.delete("/:id", deleteJob);                   // DELETE /api/jobs/:id
router.post("/:id/apply", applyToJob);              // POST   /api/jobs/:id/apply
router.get("/:id/applicants", getApplicants);       // GET    /api/jobs/:id/applicants
router.put("/:id/close", closeJob);                 // PUT    /api/jobs/:id/close

module.exports = router;