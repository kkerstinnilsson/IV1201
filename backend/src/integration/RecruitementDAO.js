/**
 * @file RecruitementDAO.js
 * @description Data Access Object for recruitment applicants
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
   * Fetch all applicants with role_id = 1
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
}

module.exports = RecruitementDAO;
