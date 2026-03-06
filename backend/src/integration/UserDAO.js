/* eslint-disable class-methods-use-this */

/**
 * @file UserDAO.js
 * @description Data Access Object for users/authentication
 */

const { Credentials, Person, Role } = require('../../models');
const {  ValidationError } = require('../business/errors/AppError');
const { validateInteger, validateString, validatePnr } = require('./utils/validateIntegration');

class UserDAO {
  /**
   * Retrieves a user by username
   * @param {string} username
   * @returns {Promise<{id:number, username:string, passwordHash:string, role:string} | null>}
   */
  async findByUsername(username) {
    // validating correct data format
    validateString(username, 'username');
   
      const cred = await Credentials.findOne({
        where: { username },
        attributes: ['username', 'password'],
        include: [
          {
            model: Person,
            attributes: ['person_id'],
            include: [
              {
                model: Role,
                attributes: ['name'],
              },
            ],
          },
        ],
      });
      if (!cred || !cred.Person) return null;
      const roleName = cred.Person.Role?.name ?? 'unknown';

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
  async usernameExists(username, t = null) {
    // validating correct data format
    validateString(username, 'username');
      const found = await Credentials.findOne({
        where: { username },
        attributes: ['credential_id'],
        transaction: t || undefined,
      });

      return found !== null;
  }

  /**
   * Checks if a email already exists.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email, t = null) {
    // validating correct data format
    validateString(email, 'email');
      const found = await Person.findOne({
        where: { email },
        attributes: ['person_id'],
        transaction: t || undefined,
      });

      return found !== null;
  }

  /**
   * Checks if a pnr already exists.
   * @param {string} pnr
   * @returns {Promise<boolean>}
   */
  async pnrExists(pnr, t = null) {
    // validating correct data format
    validatePnr(pnr, 'pnr');
      const found = await Person.findOne({
        where: { pnr },
        attributes: ['person_id'],
        transaction: t || undefined,
      });
      return found !== null;
  }

  /**
   * Creates credentials for an existing person.
   * @param {number} personId
   * @param {string} username
   * @param {string} passwordHash
   * @param {*} t Sequelize transaction (required)
   * @returns {Promise<void>}
   */
  async createCredentialsForPerson(personId, username, passwordHash, t) {
    // validating correct data format
    validateInteger(personId, 'personId');
    validateString(username, 'username');
    validateString(passwordHash, 'passwordHash');

    if (!t) throw new Error('Transaction is required for createCredentialsForPerson');

    await Credentials.create( 
      { person_id: personId, username, password: passwordHash },
      { transaction: t },
    );
  }

  /**
   * Creates a new applicant account within a transaction.
   * Rolls back if any insert fails.
   * @param {Object} userData
   * @returns {Promise<{personId:number, username:string}>}
   */
  async createApplicant({
    name, surname, email, pnr, username, passwordHash,
  }, t) {
    // validating correct data format
    validateString(name, 'name');
    validateString(surname, 'surname');
    validateString(email, 'email');
    validatePnr(pnr, 'pnr');
    validateString(username, 'username');
    validateString(passwordHash, 'passwordHash');

    if (!t) {
      throw new ValidationError('Transaction is required for createApplicant');
    }
      const person = await Person.create(
        {
          name, surname, email, pnr, role_id: 2,
        },
        { transaction: t },
      );
      await Credentials.create(
        {
          person_id: person.person_id,
          username,
          password: passwordHash,
        },
        { transaction: t },
      );
      return { personId: person.person_id, username };
  }

  /**
   * Deletes credentials by username.
   * @param {string} username
   * @returns {Promise<void>}
   */
  async deleteCredentialsByUsername(username) {
    try {
      await Credentials.destroy({
        where: { username },
      });
    } catch (error) {
      throw new DatabaseError('Failed to delete credentials by username', error);
    }
  }

  /**
   * Deletes credentials and person by username.
   * @param {string} username
   * @returns {Promise<void>}
   */
  async deleteAccountByUsername(username) {
    try {
      const cred = await Credentials.findOne({
        where: { username },
        attributes: ['person_id'],
      });
      if (!cred) return;
      await Credentials.destroy({ where: { username } });
      await Person.destroy({ where: { person_id: cred.person_id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete account by username', error);
    }
  }
}

module.exports = UserDAO;
