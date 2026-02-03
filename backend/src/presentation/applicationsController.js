/**
 * @file applicationsController.js
 * @description Express controller for applications endpoints
 */

const express = require("express");
const router = express.Router();
const applicationsService = require("../business/applicationsService");

/**
 * GET /applications
 * Fetch all applications
 */
router.get("/", async (req, res) => {
  try {
    console.log("applicationsController: GET /applications hit");
    const applications = await applicationsService.getAllApplications();
    res.status(200).json(applications);
  } catch (error) {
    console.error("applicationsController error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

module.exports = router;
