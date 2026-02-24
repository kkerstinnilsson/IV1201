/**
 * @file UserDAO.js
 * @description Data Access Object for users/authentication
 */
const { sequelize, Credentials, Person, Role } = require("../../models");


class UserDAO {

  /**
   * Retrieves a user by username
   * @param {string} username
   * @returns {Promise<{id:number, username:string, passwordHash:string, role:string} | null>}
   */
  async findByUsername(username) {
    const cred = await Credentials.findOne({
    where: { username },
    attributes: ["username", "password"],
    include: [
        {
          model: Person,
          attributes: ["person_id"],
          include: [
            {                
              model: Role,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!cred || !cred.Person) return null;
    const roleName = cred.Person.Role?.name ?? "unknown";

    return {
      id: cred.Person.person_id,
      username: cred.username,
      passwordHash: cred.password,
      role: roleName,
    };
  }

  /**
   * Checks if a username already exists.
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  async usernameExists(username) {
    const found = await Credentials.findOne({ where: { username }, attributes: ["credential_id"] });
    return found !== null;
  }

  /**
   * Checks if a email already exists.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const found = await Person.findOne({ where: { email }, attributes: ["person_id"] });
    return found !== null;
  }

  /**
   * Checks if a pnr already exists.
   * @param {string} pnr
   * @returns {Promise<boolean>}
   */
  async pnrExists(pnr) {
    const found = await Person.findOne({ where: { pnr }, attributes: ["person_id"] });
    return found !== null;
  }

  /**
   * Creates a new applicant account within a transaction.
   * Rolls back if any insert fails.
   * @param {Object} userData
   * @returns {Promise<{personId:number, username:string}>}
   */
  async createApplicant({ name, surname, email, pnr, username, passwordHash }) {
    return sequelize.transaction(async (t) => {
      const person = await Person.create(
        { name, surname, email, pnr, role_id: 2 },
        { transaction: t }
      );

      await Credentials.create(
        {
          person_id: person.person_id,
          username,
          password: passwordHash,
        },
        { transaction: t }
      );

      return { personId: person.person_id, username };
    });
  }
}

module.exports = UserDAO;