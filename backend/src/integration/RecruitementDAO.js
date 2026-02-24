/**
 * @file RecruitementDAO.js
 * @description Data Access Object (DAO) responsible 
 * for all recruitment-related database interactions via Sequelize.
 */

// Importing Sequelize instance and models 
 const { sequelize, Person, Application, Availability, Competence, CompetenceProfile, } 
  = require('../models');

/**
 * Class representing the RecruitementDAO
 * Database logic for applicants and applications
 */
class RecruitementDAO {
  constructor() {
    console.log(" RecruitementDAO: Initialized with Sequelize"); 
  }
  /** 
   * Fetch all applicants with role_id = 2 (applicants)
   * Includes the application status from the related Application table
   * via "eager loading".
   * @async
   * @returns {Promise<Array<Object>>} List of applicant DTOs with id, firstName, lastName, and status
   * @throws {Error} If database retrieval fails
   */
  async getApplicants() {
    try {
      const applicants = await Person.findAll({
        where: { role_id: 2 },
        include: [{
          model: Application,
          attributes: ['status']
        }]
      });
      return applicants.map(applicant => ({
        id: applicant.person_id,
        firstName: applicant.name,
        lastName: applicant.surname,
        status: applicant.Application ? applicant.Application.status : "unhandled",
      }));
    } catch (error) {
      console.error("RecruitementDAO error in getApplicants:", error);
      throw error;
    }
  }

  /**
   * Persists a complete application within a database transaction.
   * Ensures atomicity: application, availability
   * and competence profiles are all saved or none
   * @async
   * @param {Object} params
   * @param {number} params.userId ID of the applicant
   * @param {Array<{area: string, years: number}>} params.expertiseList List of competences
   * @param {{startDate: string, endDate: string}} params.availability Availability period
   * @returns {Promise<{status: string, personId: number}>} Confirmation object after successful commit
   * @throws {Error} If transaction fails or competence is unknown
   */
  async createApplication({ userId, expertiseList, availability }) {
    try {
      return await sequelize.transaction(async (t) => { 
        // Create Application record with status "unhandled"
        await Application.create({
          person_id: userId,
          status: "unhandled"
        }, { transaction: t });

        // Create Availability record
        await Availability.create({
          person_id: userId,
          from_date: availability.startDate,
          to_date: availability.endDate
        }, { transaction: t});

        // Create Competence profiles 
        for (const item of expertiseList) {
          const { area, years } = item;
          const competence = await Competence.findOne({ 
            where: { name: area }, 
            transaction: t });
          if (!competence) {
            throw new Error(`Unknown competence: ${area}`);
          }
          await CompetenceProfile.create({
            person_id: userId,
            competence_id: competence.competence_id,
            years_of_experience: years
          }, { transaction: t });
        }
        return{ status: "submitted", personId: userId };
      });
    } catch (error) {
      console.error("RecruitementDAO error in createApplication:", error);
      throw error;
    }
  }
  /**
   * Checks if an application exists for a given person
   * @async
   * @param {number} personId - ID of the person to check
   * @returns {Promise<boolean>} True if application exists, false otherwise
   */
  async hasApplication(personId) {
    try {
      const application = await Application.findOne({
        where: { person_id: personId }
      });
      return !!application; // Returns true if application exists, false otherwise
    } catch (error) {
      console.error("RecruitementDAO error in hasApplication:", error);
      throw error;
    }
  }

  /**
   * Deletes an application. Relies on DB-level cascade for related tables.
   * @async
   * @param {number} personId ID of the applicant
   * @returns {Promise<Object>} Status of the deletion
   */
  async deleteApplication(personId) { // extra functionality? 
    try {
      await Application.destroy({
        where: { person_id: personId }
      });
      return { status: "deleted", personId };
    } catch (error) {
      console.error("RecruitementDAO error in deleteApplication:", error);
      throw error;
    }
  }
}

module.exports = RecruitementDAO;