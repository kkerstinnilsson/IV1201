/**
 * @file applicationsService.js
 * @description Business logic layer for handling applications
 */

const { sequelize } = require('../../models/');
const RecruitementDAO = require('../integration/RecruitementDAO');
const dao = new RecruitementDAO();

/**
 * Fetches all applicants
 * @async
 * @returns {Promise<Array>} List of applicants
 */
async function getAllApplications() {
    return await dao.getAllApplicants();
}

/**
 * Submits a complete application with expertise and availability
 * Wraps all database operations in a single transaction via loops
 * @async
 * @param {number} userId - The ID of the applicant
 * @param {Array} expertiseList - List of { name, years }
 * @param {Array} availabilityList - List of { startDate, endDate }
 */
async function submitApplication(userId, expertiseList, availabilityList) {
    return await sequelize.transaction(async (t) => {
        
        // Check for existing application
        const alreadyExists = await dao.hasApplication(userId, t);
        if (alreadyExists) {
            const err = new Error("User has already submitted an application.");
            err.code = "ALREADY_APPLIED";
            throw err;
        }

        // Create the main application record
        await dao.createApplication(userId, t);

        // Map names to IDs and save expertise
        for (const exp of expertiseList) {
            const competenceId = await dao.getCompetenceIdByName(exp.name, t);
            if (!competenceId) {
                throw new Error(`Competence '${exp.name}' not found in database.`);
            }
            await dao.createCompetenceProfile(userId, competenceId, exp.years, t);
        }

        // Save availability periods
        for (const period of availabilityList) {
            await dao.createAvailability(userId, period, t);
        }
        return { success: true };
    });
}

/**
 * Deletes an existing application for a user
 * @param {number} userId 
 */
async function deleteApplication(userId) {
    return await sequelize.transaction(async (t) => {
        const exists = await dao.hasApplication(userId, t);

        if (!exists) {
            const err = new Error("No application found to delete.");
            err.code = "APPLICATION_NOT_FOUND";
            throw err;
        }

        await dao.deleteApplication(userId, t);
        return { success: true };
    });
}

module.exports = {
    getAllApplications,
    submitApplication,
    deleteApplication
};
