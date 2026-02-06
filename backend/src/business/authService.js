/**
 * @file authService.js
 * @description Business logic for authentication.
 */

const UserDAO = require("../integration/UserDAO");
const userDAO = new UserDAO();


/**
 * Attempt to authenticate a user.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<PublicUser|null>}
 */
async function login(username, password) {
  const user = await userDAO.findByUsername(username);

  if (!user) {
    return null;
  }

  // JUST NU: plaintext bcrypt senare
  if (user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

module.exports = { login };