/**
 * @file accountTokenService.js
 * @description Business logic for requesting and claiming an account token.
 */
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sequelize } = require('../../models');

const AccountTokenDAO = require('../integration/AccountTokenDAO');
const UserDAO = require('../integration/UserDAO');

const accountTokenDAO = new AccountTokenDAO();
const userDAO = new UserDAO();

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_HOURS = 24;

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Request a token link.
 * This simulates sending an email by returning/logging the link.
 *
 * @param {string} email
 * @returns {Promise<{email:string, link:string, expiresAt:Date}>}
 */
async function requestAccountToken(email) {
  return sequelize.transaction(async (t) => {
    const person = await accountTokenDAO.findApplicantByEmail(email, t);
    if (!person) {
      const err = new Error('email not found');
      err.code = 'EMAIL_NOT_FOUND';
      throw err;
    }

    // Only applicants without credentials can request a token
    if (await accountTokenDAO.personHasCredentials(person.person_id, t)) {
      const err = new Error('already has credentials');
      err.code = 'ALREADY_HAS_CREDENTIALS';
      throw err;
    }

    const token = randomToken();
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await accountTokenDAO.upsertAccountToken(person.person_id, tokenHash, expiresAt, t);

    // const link = `http://localhost:5173/claim/${token}`;

    const FRONTEND_BASE_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const link = `${FRONTEND_BASE_URL}/claim/${token}`;

    // Simulated email
    console.log(`[SIMULATED_EMAIL] to=${person.email} link=${link}`);

    return { email: person.email, link, expiresAt };
  });
}

/**
 * Claim account using token.
 * Creates Credentials and marks token used.
 *
 * @param {string} token
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id:number, username:string}>}
 */
async function claimAccountToken(token, username, password) {
  const tokenHash = sha256(token);

  return sequelize.transaction(async (t) => {
    const tokenRow = await accountTokenDAO.findValidTokenByHash(tokenHash, t);
    if (!tokenRow) {
      const err = new Error('invalid/expired/used token');
      err.code = 'TOKEN_INVALID';
      throw err;
    }

    // Ensure username is unique
    if (await userDAO.usernameExists(username, t)) {
      const err = new Error('username already exists');
      err.code = 'USERNAME_TAKEN';
      throw err;
    }

    // Ensure person still doesn't have credentials
    if (await accountTokenDAO.personHasCredentials(tokenRow.person_id, t)) {
      const err = new Error('already has credentials');
      err.code = 'ALREADY_HAS_CREDENTIALS';
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create credentials for existing person
    await userDAO.createCredentialsForPerson(tokenRow.person_id, username, passwordHash, t);

    // Mark token as used
    await accountTokenDAO.markTokenUsed(tokenRow.account_token_id, t);

    return { id: tokenRow.person_id, username };
  });
}

module.exports = { requestAccountToken, claimAccountToken };
