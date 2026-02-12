/**
 * @file UserDAO.js
 * @description Data Access Object for users/authentication
 */
const { Pool } = require("pg");

class UserDAO {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
    });
  }

  /**
   * Find a user by username.
   *
   * @param {string} username
   * @returns {Promise<{id:number, username:string, password:string, role:'recruiter'|'applicant'}|null>}
   */
  async findByUsername(username) {
    const result = await this.pool.query(
      `
      SELECT 
        person_id,
        username,
        password,
        role_id
      FROM public.person
      WHERE username = $1
      `,
      [username]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.person_id,
      username: row.username,
      password: row.password,
      role: row.role_id === 1 ? "recruiter" : "applicant",
    };
  }
}

module.exports = UserDAO;