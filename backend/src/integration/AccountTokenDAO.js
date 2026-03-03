/* eslint-disable class-methods-use-this */

/**
 * @file AccountTokenDAO.js
 * @description DAO for on-request account token (claim existing account).
 */

const { Op } = require('sequelize');
const { AccountToken, Person, Credentials } = require('../../models');

class AccountTokenDAO {
  /**
   * Finds an applicant by email.
   * @param {string} email
   * @returns {Promise<Person|null>}
   */
  async findApplicantByEmail(email, t = null) {
    return Person.findOne({
      where: { email, role_id: 2 },
      attributes: ['person_id', 'email'],
      transaction: t || undefined,
    });
  }

  /**
   * Checks if a person already has credentials.
   * @param {number} personId
   * @returns {Promise<boolean>}
   */
  async personHasCredentials(personId, t = null) {
    const found = await Credentials.findOne({
      where: { person_id: personId },
      attributes: ['credential_id'],
      transaction: t || undefined,
    });
    return found !== null;
  }

  /**
   * Creates or replaces a token row for a person.
   * @param {number} personId
   * @param {string} tokenHash
   * @param {Date} expiresAt
   * @param {*} t Sequelize transaction (required)
   * @returns {Promise<void>}
   */
  async upsertAccountToken(personId, tokenHash, expiresAt, t) {
    if (!t) throw new Error('Transaction is required for upsertAccountToken');

    await AccountToken.upsert(
      {
        person_id: personId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used_at: null,
      },
      { transaction: t },
    );
  }

  /**
   * Finds a valid token row by hash.
   * @param {string} tokenHash
   * @param {*} t Sequelize transaction (required)
   * @returns {Promise<AccountToken|null>}
   */
  async findValidTokenByHash(tokenHash, t) {
    if (!t) throw new Error('Transaction is required for findValidTokenByHash');

    return AccountToken.findOne({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
      transaction: t,
      lock: t.LOCK.UPDATE, // prevent race conditions on claim
    });
  }

  /**
   * Marks a token row as used.
   * @param {number} accountTokenId
   * @param {*} t Sequelize transaction (required)
   * @returns {Promise<void>}
   */
  async markTokenUsed(accountTokenId, t) {
    if (!t) throw new Error('Transaction is required for markTokenUsed');

    await AccountToken.update(
      { used_at: new Date() },
      {
        where: { account_token_id: accountTokenId, used_at: null },
        transaction: t,
      },
    );
  }
}

module.exports = AccountTokenDAO;
