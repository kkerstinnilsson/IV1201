/**
 * @file applicationsService.js
 * @description Business logic layer for applications
 */

const RecruitementDAO = require("../integration/RecruitementDAO");
const dao = new RecruitementDAO();

/**
 * Fetch all applications via DAO
 * @async
 * @returns {Promise<Array<{id: number, firstName: string, lastName: string, status: string}>>}
 * @throws {Error} If DAO fails
 */
async function getAllApplications() {
  console.log("applicationsService: getAllApplications called");
  return await dao.getAllApplicants();
}

module.exports = {
  getAllApplications,
};
