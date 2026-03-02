/**
 * @file applicationsController.js
 * @description Express controller for applications endpoints
 */

const applicationsService = require("../../business/applicationsService");

const {
  ValidationError,
} = require("../../business/errors/AppError");

/**
 * GET /applications
 * Fetch all applications
 */
async function listApplications(req, res) {
  console.log("applicationsController: GET /applications hit");

  const applications = await applicationsService.getAllApplications();

  res.status(200).json(applications);
}


/**
 * POST /applications
 * Submit a new application
 * Expected body: { expertiseList: [...], availability: { startDate, endDate } }
 */
async function submitApplication(req, res) {
  console.log("applicationsController: POST /applications hit");

  const { expertiseList, availability } = req.body;
  const userId = req.session.user.id;

  if (!expertiseList || expertiseList.length === 0) {
    throw new ValidationError("Expertise list is required");
  }

  if (!availability?.startDate || !availability?.endDate) {
    throw new ValidationError("Availability is required");
  }

  const application = await applicationsService.submitApplication({
    userId,
    expertiseList,
    availability,
  });

  res.status(201).json(application);
}


/**
 * GET /applications/me/status
 * Fetch the current user's application submission status
 */
async function getApplicationStatus(req, res) {
  console.log("applicationsController: GET /applications/me/status hit");

  const userId = req.session.user.id;

  const status = await applicationsService.getApplicationStatus(userId);

  res.status(200).json(status);
}


/**
 * DELETE /applications/me
 * Delete the currently logged-in user's application
 */
async function deleteApplication(req, res) {
  console.log("applicationsController: DELETE /applications/me hit");

  const userId = req.session.user.id;

  await applicationsService.deleteApplication(userId);

  res.status(204).end();
}


module.exports = {
  listApplications,
  submitApplication,
  getApplicationStatus,
  deleteApplication,
};
