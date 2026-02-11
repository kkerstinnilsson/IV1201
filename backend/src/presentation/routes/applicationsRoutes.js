/**
 * @file applicationsRoutes.js
 * @description Express routes for applications endpoints.
 */

const express = require("express");
const applicationsController = require("../controllers/applicationsController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("recruiter"),
  applicationsController.listApplications
);

module.exports = router;
