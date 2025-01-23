require("dotenv").config();
const express = require("express");
const cors = require("cors");
const projectsRouter = require("./routes/projects");
const statsMiddleware = require("./middleware/statsTracker");
const { scheduleWeeklyStatsEmail } = require("./utils/scheduler");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow cross-origin requests for local and production environments
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Middleware to track stats
app.use(statsMiddleware);

// Use the projects router for the /api path
app.use("/api", projectsRouter);

// Stats endpoint
app.use("/web_stats", require("./routes/web_stats"));

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is healthy" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the backend! API is live at /api");
});

// Schedule weekly email for stats
scheduleWeeklyStatsEmail();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});