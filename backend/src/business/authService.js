/**
 * @file authService.js
 * @description Business logic for authentication.
 */

const bcrypt = require('bcrypt');
const { sequelize } = require('../../models');
const UserDAO = require('../integration/UserDAO');

const userDAO = new UserDAO();

const {
  AppError,
  ValidationError,
} = require('./errors/AppError');

const BCRYPT_ROUNDS = 12;

/**
 * Registers a new applicant account.
 * - Ensures username, email and pnr are unique
 * - Hashes the plaintext password using bcrypt
 * - Delegates persistence (Person + Credentials) to DAO
 *
 * @param {{name:string, surname:string, email:string, pnr:string, username:string,
 * password:string}} data
 * @returns {Promise<{id:number, username:string}>}
 * @throws {Error} With code USERNAME_TAKEN / EMAIL_TAKEN / PNR_TAKEN if duplicates exist.
 */
async function register(data) {
  const {
    name, surname, email, pnr, username, password,
  } = data;

  try {
    return await sequelize.transaction(async (t) => {
      if (await userDAO.usernameExists(username, t)) {
        throw new ValidationError('Username already exists');
      }

      if (await userDAO.emailExists(email, t)) {
        throw new ValidationError('Email already exists');
      }

      if (await userDAO.pnrExists(pnr, t)) {
        throw new ValidationError('Personal number already exists');
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const created = await userDAO.createApplicant(
        {
          name, surname, email, pnr, username, passwordHash,
        },
        t,
      );

      return { id: created.personId, username: created.username };
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError('Registration failed', 500, { cause: error });
  }
}

/**
 * Authenticate a user.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id:number, username:string, role:string} | null>}
 */
async function login(username, password) {
  try {
    const user = await userDAO.findByUsername(username);

    if (!user) {
      return null;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError('Authentication failed', 500, { cause: error });
  }
}

module.exports = { login, register };
