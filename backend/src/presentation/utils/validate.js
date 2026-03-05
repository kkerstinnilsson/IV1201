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

function validateNonEmptyArray(value, fieldName, missing, invalid) {
  if (value === undefined || value === null) {
    missing.push(fieldName);
    return false;
  }
  if (!Array.isArray(value) || value.length === 0) {
    invalid.push(fieldName);
    return false;
  }
  return true;
}

function isValidDate(value) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function validateDateRange(start, end, startField, endField, rangeField, missing, invalid) {
  if (!start) missing.push(startField);
  else if (!isValidDate(start)) invalid.push(startField);

  if (!end) missing.push(endField);
  else if (!isValidDate(end)) invalid.push(endField);

  if (
    start && end
    && isValidDate(start) && isValidDate(end)
    && new Date(start) > new Date(end)
  ) {
    invalid.push(rangeField);
  }
}

module.exports = {
  validateEmail,
  validateMinLen,
  validatePnr,
  validateDateRange,
  validateNonEmptyArray,
};
