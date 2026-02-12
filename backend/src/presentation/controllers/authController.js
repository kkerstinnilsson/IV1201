/**
 * @file authController.js
 * @description Controllers for authentication endpoints.
 */

const authService = require('../../business/authService');


/**
 * Log in a user and store user info in session.
 */
async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  const user = await authService.login(username, password);
  
  if (!user) {
    return res.status(401).json({ message: 'login failed' });
  }

  // Regenerate session to prevent session fixation
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ message: 'session regeneration failed' });
    }

    req.session.user = user;

    // Ensure session is saved before responding
    req.session.save((saveErr) => {
      if (saveErr) {
        return res.status(500).json({ message: 'session save failed' });
      }

      return res.json({ user });
    });
  });
}

/**
 * Log out the current user by destroying the session.
 */
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'logout failed' });
    }

    // Clear session-cookien in browser
    res.clearCookie('connect.sid');
    return res.json({ message: 'logged out' });
  });
}


/**
 * Return the currently authenticated user from the session.
 */
async function me(req, res) {
  return res.json({ user: req.session.user });
}


module.exports = { login, logout, me, };