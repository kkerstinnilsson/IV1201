/* eslint-disable class-methods-use-this */
/**
 * @file AccountTokenDAO.js
 * @description DAO for on-request account token (claim existing account).
 */
const { Op } = require('sequelize');
const { AccountToken, Person, Credentials } = require('../../models');
const { validateInteger, validateString } = require('./utils/validateIntegration');
const { DatabaseError, ValidationError } = require('../business/errors/AppError');

class AccountTokenDAO {
  /**
   * Finds an applicant by email.
   * @param {string} email
   * @param {Object} [t=null] - Optional transaction object
   * @returns {Promise<Person|null>}
   * @throws {ValidationError} If email is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async findApplicantByEmail(email, t = null) {
    if (!validateString(email)) {
      throw new ValidationError('Integration layer: email must be a non-empty string');
    }
    try {
      return await Person.findOne({
        where: { email, role_id: 2 },
        attributes: ['person_id', 'email'],
        transaction: t || undefined,
      });
    } catch (error) {
      throw new DatabaseError('Failed to find applicant by email', error);
    }
  }

  /**
   * Checks if a person already has credentials.
   * @param {number} personId
   * @param {Object} [t=null] - Optional transaction object
   * @returns {Promise<boolean>}
   * @throws {ValidationError} If personId is not a valid integer
   * @throws {DatabaseError} If a database error occurs
   */
  async personHasCredentials(personId, t = null) {
    if (!validateInteger(personId)) {
      throw new ValidationError('Integration layer: personId must be a valid integer');
    }
    try {
      const found = await Credentials.findOne({
        where: { person_id: personId },
        attributes: ['credential_id'],
        transaction: t || undefined,
      });
      return found !== null;
    } catch (error) {
      throw new DatabaseError('Failed to check credentials existence', error);
    }
  }

  /**
   * Creates or replaces a token row for a person.
   * @param {number} personId
   * @param {string} tokenHash
   * @param {Date} expiresAt
   * @param {Object} t - Sequelize transaction (required)
   * @returns {Promise<void>}
   * @throws {ValidationError} If personId or tokenHash fail validation
   * @throws {DatabaseError} If a database error occurs
   */
  async upsertAccountToken(personId, tokenHash, expiresAt, t) {
    if (!validateInteger(personId)) {
      throw new ValidationError('Integration layer: personId must be a valid integer');
    }
    if (!validateString(tokenHash)) {
      throw new ValidationError('Integration layer: tokenHash must be a non-empty string');
    }
    if (!t) throw new Error('Transaction is required for upsertAccountToken');
    try {
      await AccountToken.upsert(
        {
          person_id: personId,
          token_hash: tokenHash,
          expires_at: expiresAt,
          used_at: null,
        },
        { transaction: t },
      );
    } catch (error) {
      throw new DatabaseError('Failed to upsert account token', error);
    }
  }

  /**
   * Finds a valid token row by hash.
   * @param {string} tokenHash
   * @param {Object} t - Sequelize transaction (required)
   * @returns {Promise<AccountToken|null>}
   * @throws {ValidationError} If tokenHash is not a valid string
   * @throws {DatabaseError} If a database error occurs
   */
  async findValidTokenByHash(tokenHash, t) {
    if (!validateString(tokenHash)) {
      throw new ValidationError('Integration layer: tokenHash must be a non-empty string');
    }
    if (!t) throw new Error('Transaction is required for findValidTokenByHash');
    try {
      return await AccountToken.findOne({
        where: {
          token_hash: tokenHash,
          used_at: null,
          expires_at: { [Op.gt]: new Date() },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
    } catch (error) {
      throw new DatabaseError('Failed to find valid token by hash', error);
    }
  }

  /**
   * Marks a token row as used.
   * @param {number} accountTokenId
   * @param {Object} t - Sequelize transaction (required)
   * @returns {Promise<void>}
   * @throws {ValidationError} If accountTokenId is not a valid integer
   * @throws {DatabaseError} If a database error occurs
   */
  async markTokenUsed(accountTokenId, t) {
    if (!validateInteger(accountTokenId)) {
      throw new ValidationError('Integration layer: accountTokenId must be a valid integer');
    }
    if (!t) throw new Error('Transaction is required for markTokenUsed');
    try {
      await AccountToken.update(
        { used_at: new Date() },
        {
          where: { account_token_id: accountTokenId, used_at: null },
          transaction: t,
        },
      );
    } catch (error) {
      throw new DatabaseError('Failed to mark token as used', error);
    }
  }
}

module.exports = AccountTokenDAO;
