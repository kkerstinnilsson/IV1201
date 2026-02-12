/**
 * @file requireRole.js
 * @description Middleware that enforces a required user role.
 */

function requireRole(role) {
  return function (req, res, next) {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'not logged in' });
    }
    if (req.session.user.role !== role) {
      return res.status(403).json({ message: 'forbidden' });
    }
    return next();
  };
}

module.exports = requireRole;
