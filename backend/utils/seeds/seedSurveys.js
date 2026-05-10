const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Survey = require("../../models/Survey");
const User = require("../../models/User");

dotenv.config();

const seedSurveys = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const admin = await User.findOne({ role: "admin" });
    const alumni = await User.find({ role: "alumni", isApproved: true });

    if (!admin || alumni.length === 0) {
      console.log("Run seedUsers.js first.");
      process.exit(1);
    }

    await Survey.deleteMany();
    console.log("Existing surveys cleared");

    const surveys = [
      {
        createdBy: admin._id,
        title: "Alumni Platform Feedback Survey",
        description:
          "Help us improve the Alumni Association Platform by sharing your experience.",
        isActive: true,
        lastDateToRespond: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        questions: [
          {
            questionText: "How would you rate the overall platform experience?",
            questionType: "rating",
            isRequired: true,
          },
          {
            questionText: "Which feature do you use the most?",
            questionType: "multiple-choice",
            options: ["Directory", "Job Portal", "Events", "Networking Feed", "Donations"],
            isRequired: true,
          },
          {
            questionText: "Which feature do you think needs the most improvement?",
            questionType: "multiple-choice",
            options: ["Directory", "Job Portal", "Events", "Networking Feed", "Surveys"],
            isRequired: false,
          },
          {
            questionText: "Any suggestions or feedback for us?",
            questionType: "text",
            isRequired: false,
          },
        ],
        responses: [
          {
            respondent: alumni[0]._id,
            answers: [
              { questionIndex: 0, answer: "4" },
              { questionIndex: 1, answer: "Job Portal" },
              { questionIndex: 2, answer: "Networking Feed" },
              { questionIndex: 3, answer: "Add a messaging feature so alumni can chat directly." },
            ],
          },
          {
            respondent: alumni[1]._id,
            answers: [
              { questionIndex: 0, answer: "5" },
              { questionIndex: 1, answer: "Directory" },
              { questionIndex: 2, answer: "Events" },
              { questionIndex: 3, answer: "Great platform overall! Maybe add a mobile app." },
            ],
          },
          {
            respondent: alumni[2]._id,
            answers: [
              { questionIndex: 0, answer: "3" },
              { questionIndex: 1, answer: "Events" },
              { questionIndex: 2, answer: "Job Portal" },
              { questionIndex: 3, answer: "Job portal needs better filters." },
            ],
          },
        ],
      },
      {
        createdBy: admin._id,
        title: "Career Placement Survey 2024",
        description:
          "Annual survey to track career placement and industry distribution of GEC alumni.",
        isActive: true,
        lastDateToRespond: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        questions: [
          {
            questionText: "What is your current employment status?",
            questionType: "multiple-choice",
            options: ["Employed", "Self-employed / Entrepreneur", "Pursuing Higher Studies", "Looking for Opportunities"],
            isRequired: true,
          },
          {
            questionText: "Which industry are you currently working in?",
            questionType: "multiple-choice",
            options: ["IT / Software", "Core Engineering", "Finance / Fintech", "Government / PSU", "Research / Academia", "Other"],
            isRequired: true,
          },
          {
            questionText: "How satisfied are you with your career progress since graduation?",
            questionType: "rating",
            isRequired: true,
          },
          {
            questionText: "Would you recommend GEC to others?",
            questionType: "multiple-choice",
            options: ["Definitely Yes", "Yes", "Maybe", "No"],
            isRequired: true,
          },
          {
            questionText: "What one thing would you change about your GEC experience?",
            questionType: "text",
            isRequired: false,
          },
        ],
        responses: [
          {
            respondent: alumni[3]._id,
            answers: [
              { questionIndex: 0, answer: "Employed" },
              { questionIndex: 1, answer: "Finance / Fintech" },
              { questionIndex: 2, answer: "5" },
              { questionIndex: 3, answer: "Definitely Yes" },
              { questionIndex: 4, answer: "More industry exposure and internship opportunities in third year." },
            ],
          },
          {
            respondent: alumni[4]._id,
            answers: [
              { questionIndex: 0, answer: "Employed" },
              { questionIndex: 1, answer: "IT / Software" },
              { questionIndex: 2, answer: "4" },
              { questionIndex: 3, answer: "Definitely Yes" },
              { questionIndex: 4, answer: "Better placement cell coordination." },
            ],
          },
        ],
      },
    ];

    await Survey.insertMany(surveys);
    console.log(`${surveys.length} surveys seeded successfully`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedSurveys();