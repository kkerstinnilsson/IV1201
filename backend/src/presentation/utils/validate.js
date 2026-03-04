/**
 * @file validate.js
 * @description Helper functions for server-side validation in the presentation layer.
 *
 */

function validateEmail(email, missing, invalid, fieldName = 'email') {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) missing.push(fieldName);
  else if (!emailRegex.test(email)) invalid.push(fieldName);
}

function validateMinLen(value, minLen, fieldName, missing, invalid) {
  if (!value) missing.push(fieldName);
  else if (value.length < minLen) invalid.push(fieldName);
}

function validatePnr(pnr, missing, invalid) {
  const pnrRegex = /^\d{8}-\d{4}$/;
  if (!pnr) missing.push('pnr');
  else if (!pnrRegex.test(pnr)) invalid.push('pnr');
}

module.exports = { validateEmail, validateMinLen, validatePnr };
