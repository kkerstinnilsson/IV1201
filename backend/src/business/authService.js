/**
 * @file authService.js
 * @description Business logic for authentication.
 */

const bcrypt = require("bcrypt");
const UserDAO = require("../integration/UserDAO");
const userDAO = new UserDAO();

const BCRYPT_ROUNDS = 12;

/**
 * Registers a new applicant account.
 * - Ensures username, email and pnr are unique
 * - Hashes the plaintext password using bcrypt
 * - Delegates persistence (Person + Credentials) to DAO
 *
 * @param {{name:string, surname:string, email:string, pnr:string, username:string, password:string}} data
 * @returns {Promise<{id:number, username:string}>}
 * @throws {Error} With code USERNAME_TAKEN / EMAIL_TAKEN / PNR_TAKEN if duplicates exist.
 */
async function register(data) {
  const { name, surname, email, pnr, username, password } = data;
    if (await userDAO.usernameExists(username)) {
    const err = new Error("username already exists");
    err.code = "USERNAME_TAKEN";
    throw err;
  }

  if (await userDAO.emailExists(email)) {
    const err = new Error("email already exists");
    err.code = "EMAIL_TAKEN";
    throw err;
  }

  if (await userDAO.pnrExists(pnr)) {
    const err = new Error("pnr already exists");
    err.code = "PNR_TAKEN";
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const created = await userDAO.createApplicant({
    name,
    surname,
    email,
    pnr,
    username,
    passwordHash,
  });

  return {
    id: created.personId,
    username: created.username,
  };
}

/**
 * Authenticate a user.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id:number, username:string, role:string} | null>}
 */
async function login(username, password) {
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
}

module.exports = { login, register };