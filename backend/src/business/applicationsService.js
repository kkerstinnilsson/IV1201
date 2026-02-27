/**
 * @file applicationsService.js
 * @description Business logic layer for applications
 */

const RecruitementDAO = require('../integration/RecruitementDAO');

const dao = new RecruitementDAO();

/**
 * Fetch all applications via DAO
 * @async
 * @returns {Promise<Array<{id: number, firstName: string, lastName: string, status: string}>>}
 * @throws {Error} If DAO fails
 */
async function getAllApplications() {
  console.log('applicationsService: getAllApplications called');
  return dao.getAllApplicants();
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
  console.log('applicationsService: submitApplication called');

  const alreadyExists = await dao.hasApplication(userId);

  if (alreadyExists) {
    throw new Error('APPLICATION_ALREADY_EXISTS');
  }

  return dao.createApplication({
    userId,
    expertiseList,
    availability,
  });
}

/**
 * Checks whether a user already has a submitted application.
 * @param {number} personId The ID of the user
 * @returns {Promise<boolean>} True if an application exists, otherwise false
 * @throws {Error} If DAO lookup fails
 */
async function hasApplication(personId) {
  return dao.hasApplication(personId);
}

/**
 * Retrieves the application submission status for a given user.
 * @param {number} userId The ID of the user
 * @returns {Promise<{hasApplication: boolean}>} Object indicating whether an application exists
 * @throws {Error} If DAO lookup fails
 */
async function getApplicationStatus(userId) {
  console.log('applicationsService: getApplicationStatus called');

  const userHasApplication = await dao.hasApplication(userId);

  return {
    hasApplication: userHasApplication,
  };
}

/**
 * Deletes an existing application
 *
 * @param {number} userId The ID of the applicant
 * @returns {Promise<void>}
 * @throws {Error} If no application exists or DAO deletion fails
 */
async function deleteApplication(userId) {
  console.log('applicationsService: deleteApplication called');

  const exists = await dao.hasApplication(userId);

  if (!exists) {
    throw new Error('APPLICATION_NOT_FOUND');
  }

  return dao.deleteApplication(userId);
}

module.exports = {
  getAllApplications,
  submitApplication,
  hasApplication,
  getApplicationStatus,
  deleteApplication,
};
