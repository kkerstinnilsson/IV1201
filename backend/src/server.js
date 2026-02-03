const express = require("express");
const cors = require("cors");
/** @requires module:./src/business/RecruitementController */
const RecruitementController = require("./business/RecruitementController");

const app = express();
const recruitementController = new RecruitementController();

app.use(cors({origin: "http://localhost:5173",}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello backend");
});

/**
 * Route to fetch the applicants
 * Triggers business logic layer
 */
app.get("/applicants", async (req, res) => {
  try {
    const applicants = await recruitementController.getAllApplicants();
    res.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Internal Server Error: Couldn't fetch applicants" });
  }
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
