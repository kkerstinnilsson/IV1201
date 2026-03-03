/**
 * @file applicationsRoutes.js
 * @description Express routes for applications endpoints.
 */

const express = require('express');
const applicationsController = require('../controllers/applicationsController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requireRole('recruiter'),
  applicationsController.listApplications,
);

router.get(
  '/me/status',
  requireAuth,
  requireRole('applicant'),
  applicationsController.getApplicationStatus,
);

router.post(
  '/',
  requireAuth,
  requireRole('applicant'),
  applicationsController.submitApplication,
);

router.delete(
  '/me',
  requireAuth,
  requireRole('applicant'),
  applicationsController.deleteApplication,
);

module.exports = router;
