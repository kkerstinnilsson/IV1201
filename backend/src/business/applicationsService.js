/**
 * @file applicationsService.js
 * @description Business logic layer for applications
 */

const RecruitementDAO = require("../integration/RecruitementDAO");
const dao = new RecruitementDAO();

const {
  AppError,
  ValidationError,
  NotFoundError,
} = require("../business/errors/AppError");

/**
 * Fetch all applications via DAO
 * @async
 * @returns {Promise<Array<{id: number, firstName: string, lastName: string, status: string}>>}
 * @throws {Error} If DAO fails
 */
async function getAllApplications() {
  console.log("applicationsService: getAllApplications called");

  try {
    return await dao.getAllApplicants();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch applications", 500, { cause: error });
  }
}


/**
 * Submits a new application including user expertise and availability
 * @param {Object} applicationData The application details
 * @param {number} applicationData.userId The ID of the applicant
 * @param {Array<Object>} applicationData.expertiseList List of skills and years of experience
 * @param {Object} applicationData.availability Start and end dates for availability
 * @returns {Promise<Object>} The created application record
 * @throws {Error} If the DAO fails to create the application
 */
async function submitApplication({ userId, expertiseList, availability }) {
  console.log("applicationsService: submitApplication called");

  try {
    const alreadyExists = await dao.hasApplication(userId);

    if (alreadyExists) {
      throw new ValidationError("Application already exists for this user");
    }

    return await dao.createApplication({
      userId,
      expertiseList,
      availability,
    });

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to submit application", 500, { cause: error });
  }
}

/**
 * Checks whether a user already has a submitted application.
 * @param {number} personId The ID of the user
 * @returns {Promise<boolean>} True if an application exists, otherwise false
 * @throws {Error} If DAO lookup fails
 */
async function hasApplication(personId) {
  try {
    return await dao.hasApplication(personId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to check application existence", 500, { cause: error });
  }
}


/**
 * Retrieves the application submission status for a given user.
 * @param {number} userId The ID of the user
 * @returns {Promise<{hasApplication: boolean}>} Object indicating whether an application exists
 * @throws {Error} If DAO lookup fails
 */
async function getApplicationStatus(userId) {
  console.log("applicationsService: getApplicationStatus called");

  try {
    const hasApplication = await dao.hasApplication(userId);

    return {
      hasApplication,
    };

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to retrieve application status", 500, { cause: error });
  }
}


/**
 * Deletes an existing application
 * 
 * @param {number} userId The ID of the applicant
 * @returns {Promise<void>}
 * @throws {Error} If no application exists or DAO deletion fails
 */
async function deleteApplication(userId) {
  console.log("applicationsService: deleteApplication called");

  try {
    const exists = await dao.hasApplication(userId);

    if (!exists) {
      throw new NotFoundError("Application not found");
    }

    return await dao.deleteApplication(userId);

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete application", 500, { cause: error });
  }
}


module.exports = {
  getAllApplications,
  submitApplication,
  hasApplication,
  getApplicationStatus,
  deleteApplication,
};
