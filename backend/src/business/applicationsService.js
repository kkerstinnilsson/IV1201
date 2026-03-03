/**
 * @file applicationsService.js
 * @description Business logic layer for handling applications
 */

const { sequelize } = require('../../models/');
const RecruitementDAO = require('../integration/RecruitementDAO');
const dao = new RecruitementDAO();

const {
  AppError,
  ValidationError,
  NotFoundError,
} = require("./errors/AppError");

/**
 * Fetches all applicants
 * @async
 * @returns {Promise<Array>} List of applicants
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
 * Submits a complete application with expertise and availability
 * @async
 * @param {number} userId - The ID of the applicant
 * @param {Array} expertiseList - List of { area, years }
 * @param {Array} availabilityList - List of { startDate, endDate }
 */
async function submitApplication(userId, expertiseList, availabilityList) {
  console.log("applicationsService: submitApplication called");
  try {
    return await sequelize.transaction(async (t) => {
      const alreadyExists = await dao.hasApplication(userId, t);
      if (alreadyExists) {
        throw new ValidationError("Application already exists for this user");
      }
      await dao.createApplication(userId, t);
      for (const exp of expertiseList) {
        const competenceId = await dao.getCompetenceIdByName(exp.area, t);
        if (!competenceId) {
          throw new ValidationError(`Competence '${exp.area}' not found in database.`);
        }
        await dao.createCompetenceProfile(userId, competenceId, exp.years, t);
      }
      for (const period of availabilityList) {
        await dao.createAvailability(userId, period, t);
      }
      return { success: true };
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to submit application", 500, { cause: error });
  }
}

/**
 * Retrieves the application submission status for a given user.
 * @param {number} userId The ID of the user
 * @returns {Promise<{hasApplication: boolean}>}
 */
async function getApplicationStatus(userId) {
  console.log("applicationsService: getApplicationStatus called");
  try {
    const hasApplication = await dao.hasApplication(userId);
    return { hasApplication };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to retrieve application status", 500, { cause: error });
  }
}

/**
 * Deletes an existing application for a user
 * @param {number} userId The ID of the applicant
 * @returns {Promise<void>}
 */
async function deleteApplication(userId) {
  console.log("applicationsService: deleteApplication called");
  try {
    return await sequelize.transaction(async (t) => {
      const exists = await dao.hasApplication(userId, t);
      if (!exists) {
        throw new NotFoundError("Application not found");
      }
      await dao.deleteApplication(userId, t);
      return { success: true };
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete application", 500, { cause: error });
  }
}

module.exports = {
  getAllApplications,
  submitApplication,
  deleteApplication,
  getApplicationStatus,
};