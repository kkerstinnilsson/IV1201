/**
 * @file accountTokenController.js
 * @description Controllers for claiming account endpoints.
 */

const accountTokenService = require('../../business/accountTokenService');
const { sendValidationError, validateEmail, validateMinLen } =
  require("../utils/validate");

/**
 * Handles request for account claim token.
 * Validates input and delegates to accountTokenService.
 */
async function requestAccountToken(req, res) {
  const { email } = req.body ?? {};

  const missing = [];
  const invalid = [];

  validateEmail(email, missing, invalid);

  if (missing.length || invalid.length ) {
    return sendValidationError(res, missing, invalid);
  }

  try {
    const result = await accountTokenService.requestAccountToken(email);

    return res.status(200).json({
      message: "token link generated",
      data: result, // { email, link, expiresAt }
    });
  } catch (err) {
    if (err.code === "EMAIL_NOT_FOUND") {
      return res.status(404).json({ message: err.message, code: err.code });
    }
    if (err.code === "ALREADY_HAS_CREDENTIALS") {
      return res.status(409).json({ message: err.message, code: err.code });
    }
    return res.status(500).json({ message: "token request failed" });
  }
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

  if (!token) missing.push("token");
  validateMinLen(username, 3, "username", missing, invalid);
  validateMinLen(password, 6, "password", missing, invalid);

  if (missing.length || invalid.length) {
    return sendValidationError(res, missing, invalid);
  }

  try {
    const result = await accountTokenService.claimAccountToken(token, username, password);

    return res.status(201).json({
      message: "account claimed",
      user: result, // { id, username }
    });
  } catch (err) {
    if (err.code === "TOKEN_INVALID") {
      return res.status(400).json({ message: err.message, code: err.code });
    }
    if (err.code === "USERNAME_TAKEN") {
      return res.status(409).json({ message: err.message, code: err.code });
    }
    if (err.code === "ALREADY_HAS_CREDENTIALS") {
      return res.status(409).json({ message: err.message, code: err.code });
    }
    return res.status(500).json({ message: "claim failed" });
  }
}


module.exports = { requestAccountToken, claimAccountToken };