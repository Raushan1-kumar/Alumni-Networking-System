const express = require("express");
const router = express.Router();

const { registerUser, registerStudent, registerAlumni, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/register/student", registerStudent);
router.post("/register/alumni", registerAlumni);
router.post("/login", loginUser);
router.get("/me", protect, getMe); // protected — need token

module.exports = router;