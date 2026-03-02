/**
 * @file requireAuth.js
 * @description Middleware that requires an authenticated session.
 */

const { ValidationError } = require('../../business/errors/AppError');

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    throw new ValidationError('Not authenticated', 401);
  }

  return next();
}

module.exports = requireAuth;
