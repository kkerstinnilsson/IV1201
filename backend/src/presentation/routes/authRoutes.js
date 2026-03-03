/**
 * @file authRoutes.js
 * @description Express routes for authentication endpoints.
 */

const express = require('express');
const authController = require('../controllers/authController');
const accountTokenController = require('../controllers/accountTokenController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/account-token/request', accountTokenController.requestAccountToken);
router.post('/account-token/claim/:token', accountTokenController.claimAccountToken);

module.exports = router;
