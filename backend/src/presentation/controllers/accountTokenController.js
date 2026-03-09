/**
 * @file accountTokenController.js
 * @description Controllers for claiming account endpoints.
 */

const accountTokenService = require('../../business/accountTokenService');
const { validateEmail, validateMinLen } = require('../utils/validate');

const { ValidationError } = require('../../business/errors/AppError');

/**
 * Handles request for account claim token.
 * Validates input and delegates to accountTokenService.
 */
async function requestAccountToken(req, res) {
  const { email } = req.body ?? {};

  const missing = [];
  const invalid = [];

  validateEmail(email, missing, invalid);

  if (missing.length || invalid.length) {
    throw new ValidationError('Validation failed', 400, { missing, invalid });
  }

  const result = await accountTokenService.requestAccountToken(email);

  return res.status(200).json({
    message: 'token link generated',
    data: result,
  });
}

/**
 * Handles account claim using a token.
 * Validates input and delegates to accountTokenService.
 */
async function claimAccountToken(req, res) {
  const { token } = req.params ?? {};
  const { username, password } = req.body ?? {};

  const missing = [];
  const invalid = [];

  if (!token) missing.push('token');
  validateMinLen(username, 3, 'username', missing, invalid);
  validateMinLen(password, 6, 'password', missing, invalid);

  if (missing.length || invalid.length) {
    throw new ValidationError('Validation failed', 400, { missing, invalid });
  }

  const result = await accountTokenService.claimAccountToken(token, username, password);

  return res.status(201).json({
    message: 'account claimed',
    user: result,
  });
}

module.exports = { requestAccountToken, claimAccountToken };
