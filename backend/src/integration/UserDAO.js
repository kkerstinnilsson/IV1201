/* eslint-disable class-methods-use-this */

/**
 * @file UserDAO.js
 * @description Data Access Object for users/authentication
 */

const { Credentials, Person, Role } = require('../../models');
const { DatabaseError, ValidationError } = require('../business/errors/AppError');
const { validateInteger, validateString, validatePnr } = require('./utils/validateIntegration');

class UserDAO {
  /**
   * Retrieves a user by username
   * @param {string} username
   * @returns {Promise<{id:number, username:string, passwordHash:string, role:string} | null>}
   * @throws {ValidationError} If username is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async findByUsername(username) {
    if (!validateString(username)) {
      throw new ValidationError('Integration layer: username must be a non-empty string');
    }
    try {
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
    } catch (error) {
      throw new DatabaseError('Failed to find user by username', error);
    }
  }

  /**
   * Checks if a username already exists.
   * @param {string} username
   * @param {Object} [t=null] - Optional transaction object
   * @returns {Promise<boolean>}
   * @throws {ValidationError} If username is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async usernameExists(username, t = null) {
    if (!validateString(username)) {
      throw new ValidationError('Integration layer: username must be a non-empty string');
    }
    try {
      const found = await Credentials.findOne({
        where: { username },
        attributes: ['credential_id'],
        transaction: t || undefined,
      });
      return found !== null;
    } catch (error) {
      throw new DatabaseError('Failed to check username existence', error);
    }
  }

  /**
   * Checks if an email already exists.
   * @param {string} email
   * @param {Object} [t=null] - Optional transaction object
   * @returns {Promise<boolean>}
   * @throws {ValidationError} If email is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async emailExists(email, t = null) {
    if (!validateString(email)) {
      throw new ValidationError('Integration layer: email must be a non-empty string');
    }
    try {
      const found = await Person.findOne({
        where: { email },
        attributes: ['person_id'],
        transaction: t || undefined,
      });
      return found !== null;
    } catch (error) {
      throw new DatabaseError('Failed to check email existence', error);
    }
  }

  /**
   * Checks if a pnr already exists.
   * @param {string} pnr
   * @param {Object} [t=null] - Optional transaction object
   * @returns {Promise<boolean>}
   * @throws {ValidationError} If pnr is not in the correct format
   * @throws {DatabaseError} If a database error occurs
   */
  async pnrExists(pnr, t = null) {
    if (!validatePnr(pnr)) {
      throw new ValidationError('Integration layer: pnr must follow the format YYYYMMDD-XXXX');
    }
    try {
      const found = await Person.findOne({
        where: { pnr },
        attributes: ['person_id'],
        transaction: t || undefined,
      });
      return found !== null;
    } catch (error) {
      throw new DatabaseError('Failed to check pnr existence', error);
    }
  }

  /**
   * Creates credentials for an existing person.
   * @param {number} personId
   * @param {string} username
   * @param {string} passwordHash
   * @param {Object} t - Sequelize transaction (required)
   * @returns {Promise<void>}
   * @throws {ValidationError} If any field fails validation
   * @throws {DatabaseError} If a database error occurs
   */
  async createCredentialsForPerson(personId, username, passwordHash, t) {
    if (!validateInteger(personId)) {
      throw new ValidationError('Integration layer: personId must be a valid integer');
    }
    if (!validateString(username)) {
      throw new ValidationError('Integration layer: username must be a non-empty string');
    }
    if (!validateString(passwordHash)) {
      throw new ValidationError('Integration layer: passwordHash must be a non-empty string');
    }
    if (!t) throw new Error('Transaction is required for createCredentialsForPerson');
    try {
      await Credentials.create(
        { person_id: personId, username, password: passwordHash },
        { transaction: t },
      );
    } catch (error) {
      throw new DatabaseError('Failed to create credentials for person', error);
    }
  }

  /**
   * Creates a new applicant account within a transaction.
   * Rolls back if any insert fails.
   * @param {Object} userData
   * @param {Object} t - Sequelize transaction (required)
   * @returns {Promise<{personId:number, username:string}>}
   * @throws {ValidationError} If any field fails validation
   * @throws {DatabaseError} If a database error occurs
   */
  async createApplicant({
    name, surname, email, pnr, username, passwordHash,
  }, t) {
    if (!validateString(name)) {
      throw new ValidationError('Integration layer: name must be a non-empty string');
    }
    if (!validateString(surname)) {
      throw new ValidationError('Integration layer: surname must be a non-empty string');
    }
    if (!validateString(email)) {
      throw new ValidationError('Integration layer: email must be a non-empty string');
    }
    if (!validatePnr(pnr)) {
      throw new ValidationError('Integration layer: pnr must follow the format YYYYMMDD-XXXX');
    }
    if (!validateString(username)) {
      throw new ValidationError('Integration layer: username must be a non-empty string');
    }
    if (!validateString(passwordHash)) {
      throw new ValidationError('Integration layer: passwordHash must be a non-empty string');
    }
    if (!t) throw new ValidationError('Transaction is required for createApplicant');
    try {
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
    } catch (error) {
      throw new DatabaseError('Failed to create applicant', error);
    }
  }

  /**
   * Deletes credentials by username.
   * @param {string} username
   * @returns {Promise<void>}
   * @throws {ValidationError} If username is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async deleteCredentialsByUsername(username) {
    if (!validateString(username)) {
      throw new ValidationError('Integration layer: username must be a non-empty string');
    }
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
   * @throws {ValidationError} If username is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async deleteAccountByUsername(username) {
    if (!validateString(username)) {
      throw new ValidationError('Integration layer: username must be a non-empty string');
    }
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