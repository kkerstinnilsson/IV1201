/**
 * @file RecruitementDAO.js
 * @description Data Access Object (DAO) responsible 
 * for recruitment related database interactions 
 */

const {
  DatabaseError,
} = require("../business/errors/AppError");

const { Person, Application, Availability, Competence, CompetenceProfile }
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
   * @throws {DatabaseError} If a database error occurs
   */
  async getAllApplicants(t = null) {
    try {
      const rows = await Application.findAll({
        attributes: ["status"],
        include: [{
          model: Person,
          attributes: ["person_id", "name", "surname"],
          where: { role_id: 2 },
          required: true,
        }],
        transaction: t || undefined,
      });

      return rows.map((r) => ({
        id: r.Person.person_id,
        firstName: r.Person.name,
        lastName: r.Person.surname,
        status: r.status,
      }));
    } catch (error) {
      throw new DatabaseError("Failed to fetch applicants", error);
    }
  }

  /**
   * Creates a new application record for a person
   * Must be called within a transaction for atomicity
   * @async
   * @param {number} personId - ID of the applicant
   * @param {Object} t - The required transaction object
   * @returns {Promise<Object>} The created application instance
   * @throws {DatabaseError} If a database error occurs
   */
  async createApplication(personId, t) {
    if (!t) {
      throw new Error("A transaction is required to create an application row!");
    }
    try {
      return await Application.create(
        { person_id: personId },
        { transaction: t }
      );
    } catch (error) {
      throw new DatabaseError("Failed to create application", error);
    }
  }

  /**
   * Creates an availability record for a person
   * Must be called within a transaction for atomicity
   * @async
   * @param {number} personId - ID of the applicant
   * @param {Object} availability - Object containing startDate and endDate
   * @param {Object} t - The required transaction object
   * @returns {Promise<Object>} The created availability record
   * @throws {DatabaseError} If a database error occurs
   */
  async createAvailability(personId, { startDate, endDate }, t) {
    if (!t) {
      throw new Error("A transaction is required to create availability records!");
    }
    try {
      return await Availability.create(
        {
          person_id: personId,
          from_date: startDate,
          to_date: endDate,
        },
        { transaction: t }
      );
    } catch (error) {
      throw new DatabaseError("Failed to create availability", error);
    }
  }

  /**
   * Creates a competence profile record for a person
   * @async
   * @param {number} personId - ID of the applicant
   * @param {number} competenceId - The ID of the competence
   * @param {number} years - Years of experience
   * @param {Object} t - The required transaction object
   * @returns {Promise<Object>} The created competence profile instance
   * @throws {DatabaseError} If a database error occurs
   */
  async createCompetenceProfile(personId, competenceId, years, t) {
    if (!t) {
      throw new Error("A transaction is required to create a competence profile!");
    }
    try {
      return await CompetenceProfile.create(
        {
          person_id: personId,
          competence_id: competenceId,
          years_of_experience: years,
        },
        { transaction: t }
      );
    } catch (error) {
      throw new DatabaseError("Failed to create competence profile", error);
    }
  }

  /**
   * Translates a competence name to its corresponding ID
   * @async
   * @param {string} name - The name of the competence
   * @param {Object} [t=null] - Optional transaction reference
   * @returns {Promise<number|null>} The competence_id if found, otherwise null
   * @throws {DatabaseError} If a database error occurs
   */
  async getCompetenceIdByName(name, t = null) {
    try {
      const competence = await Competence.findOne({
        where: { name },
        attributes: ["competence_id"],
        transaction: t || undefined,
      });
      return competence ? competence.competence_id : null;
    } catch (error) {
      throw new DatabaseError("Failed to fetch competence by name", error);
    }
  }

  /**
   * Checks whether an application exists for a person
   * @async
   * @param {number} personId - ID of the person to check
   * @param {Object} [t=null] - Optional transaction reference
   * @returns {Promise<boolean>} True if any application related data exists
   * @throws {DatabaseError} If a database error occurs
   */
  async hasApplication(personId, t = null) {
    try {
      const appl = await Application.findOne({
        where: { person_id: personId },
        attributes: ["application_id"],
        transaction: t || undefined,
      });
      if (appl) return true;

      const availability = await Availability.findOne({
        where: { person_id: personId },
        attributes: ["availability_id"],
        transaction: t || undefined,
      });
      if (availability) return true;

      const competence = await CompetenceProfile.findOne({
        where: { person_id: personId },
        attributes: ["competence_profile_id"],
        transaction: t || undefined,
      });
      return competence !== null;
    } catch (error) {
      throw new DatabaseError("Failed to check application existence", error);
    }
  }

  /**
   * Deletes all application-related data for a person
   * @async
   * @param {number} personId - ID of the person
   * @param {Object} t - The required transaction object
   * @returns {Promise<number>} Number of application rows deleted
   * @throws {DatabaseError} If a database error occurs
   */
  async deleteApplication(personId, t) {
    if (!t) {
      throw new Error("A transaction is required to delete an application!");
    }
    try {
      await CompetenceProfile.destroy({ where: { person_id: personId }, transaction: t });
      await Availability.destroy({ where: { person_id: personId }, transaction: t });
      return await Application.destroy({ where: { person_id: personId }, transaction: t });
    } catch (error) {
      throw new DatabaseError("Failed to delete application", error);
    }
  }
}

module.exports = RecruitementDAO;