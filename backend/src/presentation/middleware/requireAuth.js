/**
 * @file requireAuth.js
 * @description Middleware that requires an authenticated session.
 */

/**
 * Require that a user is logged in (session contains user).
 */
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'not logged in' });
  }
  return next();
}

module.exports = requireAuth;