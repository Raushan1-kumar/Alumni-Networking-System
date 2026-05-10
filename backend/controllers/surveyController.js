const Survey = require("../models/Survey");

// ─────────────────────────────────────────────────────────────
// POST /api/surveys
// Admin only — create a new survey with questions
// ─────────────────────────────────────────────────────────────
const createSurvey = async (req, res) => {
  try {
    const { title, description, questions, lastDateToRespond } = req.body;

    // questions should be an array like:
    // [
    //   { questionText: "Rate your experience", questionType: "rating" },
    //   { questionText: "Which batch?", questionType: "multiple-choice", options: ["2020","2021","2022"] },
    //   { questionText: "Any suggestions?", questionType: "text" }
    // ]

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    const survey = await Survey.create({
      createdBy: req.user._id,
      title,
      description,
      questions,
      lastDateToRespond,
    });

    res.status(201).json({ message: "Survey created successfully", survey });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/surveys
// Private — get all active surveys
// ─────────────────────────────────────────────────────────────
const getAllSurveys = async (req, res) => {
  try {
    // Return surveys without responses (keep it light)
    const surveys = await Survey.find({ isActive: true })
      .select("-responses")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/surveys/:id
// Private — get a single survey with its questions
// ─────────────────────────────────────────────────────────────
const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .select("-responses") // don't expose other people's responses
      .populate("createdBy", "name");

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Check if logged-in user already responded
    const fullSurvey = await Survey.findById(req.params.id);
    const alreadyResponded = fullSurvey.responses.some(
      (r) => r.respondent.toString() === req.user._id.toString()
    );

    res.json({ survey, alreadyResponded });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/surveys/:id/respond
// Private — alumni submits response to a survey
// ─────────────────────────────────────────────────────────────
const submitResponse = async (req, res) => {
  try {
    const { answers } = req.body;

    // answers should be an array like:
    // [
    //   { questionIndex: 0, answer: "5" },
    //   { questionIndex: 1, answer: "2021" },
    //   { questionIndex: 2, answer: "Great platform!" }
    // ]

    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    if (!survey.isActive) {
      return res.status(400).json({ message: "This survey is no longer active" });
    }

    // Check deadline
    if (survey.lastDateToRespond && new Date() > survey.lastDateToRespond) {
      return res.status(400).json({ message: "Survey response deadline has passed" });
    }

    // Check if already responded
    const alreadyResponded = survey.responses.some(
      (r) => r.respondent.toString() === req.user._id.toString()
    );

    if (alreadyResponded) {
      return res.status(400).json({ message: "You have already responded to this survey" });
    }

    // Validate required questions are answered
    const requiredIndexes = survey.questions
      .map((q, i) => (q.isRequired ? i : null))
      .filter((i) => i !== null);

    const answeredIndexes = answers.map((a) => a.questionIndex);

    const missingRequired = requiredIndexes.filter(
      (i) => !answeredIndexes.includes(i)
    );

    if (missingRequired.length > 0) {
      return res.status(400).json({
        message: `Please answer all required questions. Missing: question(s) ${missingRequired.map((i) => i + 1).join(", ")}`,
      });
    }

    survey.responses.push({
      respondent: req.user._id,
      answers,
    });

    await survey.save();

    res.status(201).json({ message: "Response submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/surveys/:id/results
// Admin only — see all responses + basic analysis
// ─────────────────────────────────────────────────────────────
const getSurveyResults = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate(
      "responses.respondent",
      "name email batchYear"
    );

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Build a simple analysis per question
    const analysis = survey.questions.map((question, index) => {
      const allAnswers = survey.responses
        .map((r) => r.answers.find((a) => a.questionIndex === index))
        .filter(Boolean)
        .map((a) => a.answer);

      if (question.questionType === "rating") {
        // Average rating
        const avg =
          allAnswers.length > 0
            ? (
                allAnswers.reduce((sum, val) => sum + Number(val), 0) /
                allAnswers.length
              ).toFixed(2)
            : 0;

        return {
          questionIndex: index,
          questionText: question.questionText,
          questionType: question.questionType,
          totalAnswers: allAnswers.length,
          averageRating: avg,
        };
      }

      if (question.questionType === "multiple-choice") {
        // Count how many picked each option
        const optionCounts = {};
        question.options.forEach((opt) => (optionCounts[opt] = 0));
        allAnswers.forEach((ans) => {
          if (optionCounts[ans] !== undefined) optionCounts[ans]++;
        });

        return {
          questionIndex: index,
          questionText: question.questionText,
          questionType: question.questionType,
          totalAnswers: allAnswers.length,
          optionCounts,
        };
      }

      // text type — just return all answers as list
      return {
        questionIndex: index,
        questionText: question.questionText,
        questionType: question.questionType,
        totalAnswers: allAnswers.length,
        answers: allAnswers,
      };
    });

    res.json({
      surveyTitle: survey.title,
      totalResponses: survey.responses.length,
      analysis,
      rawResponses: survey.responses, // full responses with respondent info
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/surveys/:id/close
// Admin only — close a survey so no more responses
// ─────────────────────────────────────────────────────────────
const closeSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    survey.isActive = false;
    await survey.save();

    res.json({ message: "Survey closed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/surveys/:id
// Admin only — delete a survey
// ─────────────────────────────────────────────────────────────
const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    await survey.deleteOne();
    res.json({ message: "Survey deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/surveys/my-responses
// Private — Get surveys the user has submitted
// ─────────────────────────────────────────────────────────────
const getMyResponses = async (req, res) => {
  try {
    const surveys = await Survey.find({
      "responses.respondent": req.user._id,
    }).select("title description responses");

    // Filter out other users' responses
    const filteredSurveys = surveys.map(survey => {
      const myResponse = survey.responses.find(r => r.respondent.toString() === req.user._id.toString());
      return {
        _id: survey._id,
        title: survey.title,
        description: survey.description,
        myResponse
      };
    });

    res.json(filteredSurveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  submitResponse,
  getSurveyResults,
  closeSurvey,
  deleteSurvey,
  getMyResponses,
};