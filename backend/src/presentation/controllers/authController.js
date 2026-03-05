/**
 * @file authController.js
 * @description Controllers for authentication endpoints.
 */

const authService = require('../../business/authService');
const {
  ValidationError,
  AppError,
} = require('../../business/errors/AppError');

const { validateEmail, validateMinLen, validatePnr } = require('../utils/validate');

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
  validateEmail(email, missing, invalid);
  validatePnr(pnr, missing, invalid);
  validateMinLen(username, 3, 'username', missing, invalid);
  validateMinLen(password, 6, 'password', missing, invalid);

  if (missing.length > 0 || invalid.length > 0) {
    throw new ValidationError('Validation failed', 400, { missing, invalid });
  }

  const created = await authService.register({
    name,
    surname,
    email,
    pnr,
    username,
    password,
  });

  return res.status(201).json({
    message: 'account created',
    user: created,
  });
}

/**
 * Handles user login.
 * Validates input and delegates authentication to authService.
 * Stores authenticated user in the session.
 */
async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    throw new ValidationError('Username and password are required', 400);
  }

  const user = await authService.login(username, password);

  if (!user) {
    // not revealing whether username or password was wrong
    throw new ValidationError('Invalid credentials', 401);
  }

  // prevent session fixation
  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(new AppError('Session regeneration failed', 500, { cause: err }));
      return resolve();
    });
  });

  req.session.user = user;

  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) return reject(new AppError('Session save failed', 500, { cause: err }));
      return resolve();
    });
  });

  return res.json({ user });
}

/**
 * Handles user logout by destroying the session.
 */
async function logout(req, res) {
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(new AppError('Logout failed', 500, { cause: err }));
      return resolve();
    });
  });

  // Clear session-cookien in browser
  res.clearCookie('connect.sid');

  return res.json({ message: 'logged out' });
}

/**
 * Return the currently authenticated user from the session.
 */
async function me(req, res) {
  if (!req.session?.user) {
    throw new ValidationError('Not authenticated', 401);
  }

  return res.json({ user: req.session.user });
}

module.exports = {
  login, logout, me, register,
};
