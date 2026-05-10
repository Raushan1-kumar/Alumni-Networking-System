const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse incoming JSON body

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// As you build more modules, add them here:
app.use("/api/jobs",      require("./routes/jobRoutes"));
app.use("/api/events",    require("./routes/eventRoutes"));
app.use("/api/posts",     require("./routes/postRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/surveys",   require("./routes/surveyRoutes"));
app.use("/api/stories",   require("./routes/storyRoutes"));

// Health check
app.get("/", (req, res) => res.send("Alumni API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));