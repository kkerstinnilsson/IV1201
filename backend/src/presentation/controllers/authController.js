/**
 * @file authController.js
 * @description Controllers for authentication endpoints.
 */

const authService = require('../../business/authService');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pnrRegex = /^\d{8}-\d{4}$/;

/**
 * Handles user registration.
 * - Validates that required fields are present in the request body
 * - Delegates business logic to authService
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function register(req, res) {
  const {
    name, surname, email, pnr, username, password,
  } = req.body ?? {};

  const missing = [];
  const invalid = [];

  if (!name) missing.push('name');
  if (!surname) missing.push('surname');
  if (!email) {
    missing.push('email');
  } else if (!emailRegex.test(email)) {
    invalid.push('email');
  }
  if (!pnr) {
    missing.push('pnr');
  } else if (!pnrRegex.test(pnr)) {
    invalid.push('pnr');
  }
  if (!username) {
    missing.push('username');
  } else if (username.length < 3) {
    invalid.push('username');
  }
  if (!password) {
    missing.push('password');
  } else if (password.length < 6) {
    invalid.push('password');
  }

  if (missing.length > 0 || invalid.length > 0) {
    return res.status(400).json({
      message: 'validation failed',
      missing,
      invalid,
    });
  }

  try {
    const created = await authService.register({
      name, surname, email, pnr, username, password,
    });

    return res.status(201).json({
      message: 'account created',
      user: created,
    });
  } catch (err) {
    if (err.code === 'USERNAME_TAKEN' || err.code === 'EMAIL_TAKEN' || err.code === 'PNR_TAKEN') {
      return res.status(409).json({ message: err.message, code: err.code });
    }
    return res.status(500).json({ message: 'registration failed' });
  }
}

/**
 * Log in a user and store user info in session.
 */
async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {
    const user = await authService.login(username, password);

    if (!user) {
      return res.status(401).json({ message: 'login failed' });
    }

    // Regenerate session to prevent session fixation
    return req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: 'session regeneration failed' });
      }

      req.session.user = user;

      // Ensure session is saved before responding
      return req.session.save((saveErr) => {
        if (saveErr) {
          return res.status(500).json({ message: 'session save failed' });
        }

        return res.json({ user });
      });
    });
  } catch (err) {
    return res.status(500).json({ message: 'login failed due to server error' });
  }
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
  if (!req.session?.user) return res.status(401).json({ message: 'not authenticated' });
  return res.json({ user: req.session.user });
}

module.exports = {
  login, logout, me, register,
};
