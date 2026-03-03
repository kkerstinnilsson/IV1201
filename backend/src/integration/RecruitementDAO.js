/**
 * @file RecruitementDAO.js
 * @description Data Access Object (DAO) responsible 
 * for recruitment related database interactions 
 */

// Importing models 
 const { Person, Application, Availability, Competence, CompetenceProfile, } 
  = require("../../models");

/**
 * Class representing the RecruitementDAO
 * Database logic for applicants and applications
 */
class RecruitementDAO {
  constructor() {
    console.log(" RecruitementDAO: Initialized with Sequelize"); 
  }
  
  /**
   * Retrieves all applications for the recruiter view
   * Joins with the Person model to get names and filters by applicant role
   * @async
   * @param {Object} [t=null] - Optional transaction object
   * @returns {Promise<Array<{id:number, firstName:string, lastName:string, status:string}>>}
   */
  async getAllApplicants(t = null) {
    // Find all applications including the person data
    const rows = await Application.findAll({
      attributes: ["status"],
      include: [{
        model: Person,
        attributes: ["person_id", "name", "surname"],
        where: { role_id: 2 }, 
        required: true // Only return records if a matching person exists
      }],
      transaction: t || undefined // Use transaction if provided by the service
    });

    // Map the database rows to a clean array of objects for the business layer
    return rows.map((r) => ({
      id: r.Person.person_id,
      firstName: r.Person.name,
      lastName: r.Person.surname,
      status: r.status,
    }));
  }

  /**
   * Creates a new application record for a person
   * Must be called within a transaction for atomicity
   * @async
   * @param {number} personId - ID of the applicant
   * @param {Object} t - The required transaction object 
   * @returns {Promise<Object>} The created application instance
   */
 async createApplication(personId, t) {
    if (!t) {
      throw new Error("A transaction is required to create an application row!");
    }

    return await Application.create(
      { person_id: personId }, 
      { transaction: t }
      // status defaults to 'unhandled'
    );
  }

 /**
   * Creates an availability record for a person
   * This must be called within a transaction for atomicity
   * @async
   * @param {number} personId - ID of the applicant
   * @param {Object} availability - Object containing startDate and endDate
   * @param {Object} t - The required transaction object
   * @returns {Promise<Object>} The created availability record
   */
  async createAvailability(personId, { startDate, endDate }, t) {
    // Ensure we have a transaction to maintain data integrity
    if (!t) {
      throw new Error("A transaction is required to create availability records!");
    }

    // Maps the provided dates to the database columns (DATEONLY)
    return await Availability.create(
      {
        person_id: personId,
        from_date: startDate, 
        to_date: endDate,     
      },
      { transaction: t }
    );
  }

/**
   * Creates a competence profile record for a person
   * Links a specific competence to the applicant with years of experience
   * @async
   * @param {number} personId - ID of the applicant
   * @param {number} competenceId - The ID of the competence
   * @param {number} years - Years of experience
   * @param {Object} t - The required transaction object
   * @returns {Promise<Object>} The created competence profile instance
   */
  async createCompetenceProfile(personId, competenceId, years, t) {
    if (!t) {
      throw new Error("A transaction is required to create a competence profile!");
    }
      return await CompetenceProfile.create(
        {
          person_id: personId,
          competence_id: competenceId,
          years_of_experience: years,
        },
        { transaction: t }
      );
  }

  /**
   * Translates a competence name to its corresponding ID
   * Useful for mapping user friendly names to database keys
   * @async
   * @param {string} name - The name of the competence, like "ticket sales"
   * @param {Object} [t=null] - Optional transaction reference
   * @returns {Promise<number|null>} The competence_id if found, otherwise null
   */
  async getCompetenceIdByName(name, t = null) {
      const competence = await Competence.findOne({
        where: { name: name },
        attributes: ["competence_id"],
        transaction: t || undefined
      });

      // Returns the ID if found, otherwise null
      return competence ? competence.competence_id : null;
  }

  /**
   * Checks whether an application exists for a person
   * Performs defensive checks across related tables 
   * @async
   * @param {number} personId - ID of the person to check
   * @param {Object} [t=null] - Optional transaction reference 
   * @returns {Promise<boolean>} True if any application related data exists
   */
  async hasApplication(personId, t = null) {
      // Check main application table
      const appl = await Application.findOne({
        where: { person_id: personId },
        attributes: ["application_id"],
        transaction: t || undefined
      });
      if (appl) return true;

      // Check availability record
      const availability = await Availability.findOne({
        where: { person_id: personId },
        attributes: ["availability_id"],
        transaction: t || undefined
      });
      if (availability) return true;

      // Check competence profiles
      const competence = await CompetenceProfile.findOne({
        where: { person_id: personId },
        attributes: ["competence_profile_id"],
        transaction: t || undefined
      });

      return competence !== null; // Returns true if record exists, false otherwise
  }

  /**
   * Deletes all application-related data for a person
   * Competence profiles and availability are removed before the application row
   * to handle constraints
   * @async
   * @param {number} personId - ID of the person
   * @param {Object} t - The required transaction object
   * @returns {Promise<number>} Number of application rows deleted (0 or 1)
   */
  async deleteApplication(personId, t) {
    if (!t) {
      throw new Error("A transaction is required to delete an application!");
    }
      // Clean up associated data first
      await CompetenceProfile.destroy({ 
        where: { person_id: personId }, 
        transaction: t 
      });
      await Availability.destroy({ 
        where: { person_id: personId }, 
        transaction: t 
      });

      // Delete the main application record
      return await Application.destroy({
        where: { person_id: personId },
        transaction: t
      });
  }
}

module.exports = RecruitementDAO;