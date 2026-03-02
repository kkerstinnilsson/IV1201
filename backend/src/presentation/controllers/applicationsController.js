/**
 * @file applicationsController.js
 * @description Express controller for applications endpoints
 */

const applicationsService = require("../../business/applicationsService");

/**
 * GET /applications
 * Fetch all applications
 */
async function listApplications (req, res) {
  try {
    console.log("applicationsController: GET /applications hit");
    const applications = await applicationsService.getAllApplications();
    res.status(200).json(applications);
  } catch (error) {
    console.error("applicationsController error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
}


/**
 * POST /applications
 * Submit a new application
 * Expected body: { expertiseList: [...], availability: { startDate, endDate } }
 */
async function submitApplication(req, res) {
  try {
    console.log("applicationsController: POST /applications hit");

    const { expertiseList, availability } = req.body;
    const userId = req.session.user.id;

    if (!expertiseList || expertiseList.length === 0) {
      return res.status(400).json({ error: "Expertise list is required" });
    }

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ error: "Availability is required" });
    }

    const application = await applicationsService.submitApplication(
      userId,
      expertiseList,
      availability,
    );

    res.status(201).json(application);
  } catch (error) {
    console.error("submitApplication error:", error);

    if (error.code === "ALREADY_APPLIED") {
      return res.status(409).json({
        error: "You have already submitted an application",
      });
    }

    res.status(500).json({ error: "Failed to submit application" });
  }
}


/**
 * GET /applications/me/status
 * Fetch the current user's application submission status
 */
async function getApplicationStatus(req, res) {
  try {
    console.log("applicationsController: GET /applications/me/status hit");

    const userId = req.session.user.id;

    const status = await applicationsService.getApplicationStatus(userId);

    res.status(200).json(status);
  } catch (error) {
    console.error("getApplicationStatus error:", error);
    res.status(500).json({ error: "Failed to fetch application status" });
  }
}


/**
 * DELETE /applications/me
 * Delete the currently logged-in user's application
 */
async function deleteApplication(req, res) {
  try {
    console.log("applicationsController: DELETE /applications/me hit");

    const userId = req.session.user.id;

    await applicationsService.deleteApplication(userId);

    res.status(204).end();
  } catch (error) {
    console.error("deleteApplication error:", error);

    if (error.code === "APPLICATION_NOT_FOUND") {
      return res.status(404).json({
        error: "No application found to delete",
      });
    }

    res.status(500).json({ error: "Failed to delete application" });
  }
}


module.exports = {
  listApplications,
  submitApplication,
  getApplicationStatus,
  deleteApplication,
};