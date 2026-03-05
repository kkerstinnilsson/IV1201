/**
 * @file testRoutes.js
 * @description Test-only routes for acceptance testing. Protected by test secret.
 */
const express = require('express');
const UserDAO = require('../../integration/UserDAO');

const router = express.Router();
const userDAO = new UserDAO();

/**
 * Middleware to verify test secret header.
 */
function requireTestSecret(req, res, next) {
  const secret = req.headers['x-test-secret'];
  if (!secret || secret !== process.env.TEST_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

/**
 * DELETE /test/delete-credentials
 * Deletes credentials for a user. Used for magic link test cleanup.
 */
router.delete('/delete-credentials', requireTestSecret, async (req, res, next) => {
  try {
    const { username } = req.query;
    await userDAO.deleteCredentialsByUsername(username);
    res.json({ message: 'Credentials deleted' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /test/delete-account
 * Deletes credentials and person. Used for create account test cleanup.
 */
router.delete('/delete-account', requireTestSecret, async (req, res, next) => {
  try {
    const { username } = req.query;
    await userDAO.deleteAccountByUsername(username);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;