/**
 * @file requireRole.js
 * @description Middleware that enforces a required user role.
 */

const { ValidationError } = require('../../business/errors/AppError');

function requireRole(role) {
  return function (req, res, next) {

    if (!req.session?.user) {
      throw new ValidationError('Not authenticated', 401);
    }

    if (req.session.user.role !== role) {
      throw new ValidationError('Forbidden', 403);
    }

    return next();
  };
}

module.exports = requireRole;
