/**
 * Recruitement Data Access Object
 * @requires module:pg
 */
const { Pool } = require('pg');
/***
 * Class representing the Recruitement Data Access Object
 * @class 
 */
class RecruitementDAO {
    /**
     * Creates an instance of RecruitementDAO and intializes 
     * the database connection pool
     * @constructor
     */
    constructor() {
        /**
         * The database connection pool
         * @type {Pool}
         * @private
         */
        this.pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'recruitement',
            password: ,
            port: 5432,
        });
    }
    /**
     * Fetches all applicants from the database
     * Limited to applicants with role_id = 1, see SQL-query
     * @async
     * @returns {Promise<Array>} A promise that eventually will contain an array of applicant objects
     * @throws {Error} If an error occurs during the database query
     */
    async getAllApplicants() {
        try {
            const result = await this.pool.query(
                'SELECT name, surname, person_id FROM public.person WHERE role_id = 1'); 
            return result.rows.map(row => ({
                name: row.name,
                lastName: row.surname,
                person_id: row.person_id,
                status: 'unhandled'
            }));
        } catch (error) {
            console.error('Error in RecruitementDAO.getAllApplicants:', error);
            throw error;
        }
    }
}

module.exports = RecruitementDAO;