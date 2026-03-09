/**
 * @file applicationsController.js
 * @description Express controller for applications endpoints
 */

const applicationsService = require('../../business/applicationsService');

const {
  ValidationError,
} = require('../../business/errors/AppError');

const {
  validateNonEmptyArray,
  validateDateRange,
} = require('../utils/validate');

/**
 * GET /applications
 * Fetch all applications
 */
async function listApplications(req, res) {

  const applications = await applicationsService.getAllApplications();
  return res.status(200).json(applications);
}

/**
 * POST /applications
 * Submit a new application
 * Expected body: { expertiseList: [...], availability: { startDate, endDate } }
 */
async function submitApplication(req, res) {

  const { expertiseList, availability } = req.body ?? {};
  const userId = req.session.user.id;

  const missing = [];
  const invalid = [];

  validateNonEmptyArray(expertiseList, 'expertiseList', missing, invalid);

  if (!availability) {
    missing.push('availability');
  } else {
    validateDateRange(
      availability.startDate,
      availability.endDate,
      'startDate',
      'endDate',
      'availability',
      missing,
      invalid,
    );
  }

  if (missing.length || invalid.length) {
    throw new ValidationError('Validation failed', 400, { missing, invalid });
  }

  const application = await applicationsService.submitApplication(
    userId,
    expertiseList,
    [availability],
  );

  return res.status(201).json(application);
}

/**
 * GET /applications/me/status
 * Fetch the current user's application submission status
 */
async function getApplicationStatus(req, res) {
  const userId = req.session.user.id;
  const status = await applicationsService.getApplicationStatus(userId);
  return res.status(200).json(status);
}

/**
 * DELETE /applications/me
 * Delete the currently logged-in user's application
 */
async function deleteApplication(req, res) {
  const userId = req.session.user.id;
  await applicationsService.deleteApplication(userId);
  return res.status(204).end();
}

module.exports = {
  listApplications,
  submitApplication,
  getApplicationStatus,
  deleteApplication,
};
