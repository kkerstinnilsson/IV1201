/**
 * @file RecruitementDAO.js
 * @description Data Access Object (DAO) responsible for all recruitment-related
 * database interactions. Handles persistence and retrieval of applicant data
 * @requires pg
 * @requires dotenv
 */

const { Pool } = require("pg");
require("dotenv").config();


/**
 * Class representing the Recruitment DAO
 */
class RecruitementDAO {
  /**
   * Creates a new DAO and initializes the Postgres connection pool
   */
  constructor() {
    console.log("RecruitementDAO: initializing database pool");

    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }

  /**
   * Fetch all applicants with role_id = 2 which are the applicants in the database
   * 
   * TODO: We need to implement an application table in the database to store status of 
   * application. Currently bypassed by hardcoded status line.
   * 
   * @async
   * @returns {Promise<Array<{id: number, firstName: string, lastName: string, status: string}>>}
   * @throws {Error} If a database error occurs
   */
  async getAllApplicants() {
    console.log("RecruitementDAO: getAllApplicants called");
    try {
      const result = await this.pool.query(
        "SELECT person_id, name, surname FROM public.person WHERE role_id = 2"
      );

      // Map database rows to frontend DTO
      return result.rows.map((row) => ({
        id: row.person_id,
        firstName: row.name,
        lastName: row.surname,
        status: "unhandled",
      }));
    } catch (error) {
      console.error("RecruitementDAO error:", error);
      throw error;
    }
  }

    
  
  /**
   * Persists a complete application within a database transaction.
   *
   * Inserts one availability record and one or more competence_profile records.
   * If any insert fails, all changes are rolled back.
   *
   * @async
   * @param {Object} params
   * @param {number} params.userId ID of the applicant
   * @param {Array<{area: string, years: number}>} params.expertiseList List of competences
   * @param {{startDate: string, endDate: string}} params.availability Availability period
   * @returns {Promise<{status: string, personId: number}>}
   *          Confirmation object after successful commit
   * @throws {Error} If transaction fails or competence is unknown
   */
  async createApplication({ userId, expertiseList, availability }) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        INSERT INTO availability (person_id, from_date, to_date)
        VALUES ($1, $2, $3)
        `,
        [userId, availability.startDate, availability.endDate]
      );

      for (const item of expertiseList) {
        const { area, years } = item;

        const competenceResult = await client.query(
          `
          SELECT competence_id
          FROM competence
          WHERE name = $1
          `,
          [area]
        );

        if (competenceResult.rows.length === 0) {
          throw new Error(`Unknown competence: ${area}`);
        }

        const competenceId = competenceResult.rows[0].competence_id;

        await client.query(
          `
          INSERT INTO competence_profile (person_id, competence_id, years_of_experience)
          VALUES ($1, $2, $3)
          `,
          [userId, competenceId, years]
        );
      }

      await client.query("COMMIT");

      return {
        status: "submitted",
        personId: userId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("RecruitementDAO.createApplication failed:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Checks whether a user has any existing application records.
   *
   * An application is considered to exist if at least one availability record or one competence_profile record exists.
   * 
   * @param {number} personId ID of the applicant
   * @returns {Promise<boolean>} True if application data exists, otherwise false
   * @throws {Error} If a database query fails
   */
  async hasApplication(personId) {
  const availabilityExists = await this.pool.query(
    `SELECT 1 FROM availability WHERE person_id = $1 LIMIT 1`,
    [personId]
  );

  const competenceExists = await this.pool.query(
    `SELECT 1 FROM competence_profile WHERE person_id = $1 LIMIT 1`,
    [personId]
  );

  return availabilityExists.rowCount > 0 || competenceExists.rowCount > 0;
}

  /**
 * Delete an applicants full application- availability and conpetence
 *
 * @async
 * @param {number} userId - The ID of the applicant
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If a database error occurs
 */
async deleteApplication(userId) {
  const client = await this.pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM competence_profile
      WHERE person_id = $1
      `,
      [userId]
    );

    await client.query(
      `
      DELETE FROM availability
      WHERE person_id = $1
      `,
      [userId]
    );

    await client.query("COMMIT");

    return {
      status: "deleted",
      personId: userId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("RecruitementDAO.deleteApplication failed:", error);
    throw error;
  } finally {
    client.release();
  }
}



}




module.exports = RecruitementDAO;
