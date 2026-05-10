const express = require("express");
const router = express.Router();

const {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  submitResponse,
  getSurveyResults,
  closeSurvey,
  deleteSurvey,
  getMyResponses,
} = require("../controllers/surveyController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.use(protect); // all routes need login

// Alumni
router.get("/", getAllSurveys);                                          // GET    /api/surveys
router.get("/my-responses", getMyResponses);                             // GET    /api/surveys/my-responses
router.get("/:id", getSurveyById);                                       // GET    /api/surveys/:id
router.post("/:id/respond", submitResponse);                             // POST   /api/surveys/:id/respond

// Admin
router.post("/", adminOnly, createSurvey);                               // POST   /api/surveys
router.get("/:id/results", adminOnly, getSurveyResults);                 // GET    /api/surveys/:id/results
router.put("/:id/close", adminOnly, closeSurvey);                        // PUT    /api/surveys/:id/close
router.delete("/:id", adminOnly, deleteSurvey);                          // DELETE /api/surveys/:id

module.exports = router;