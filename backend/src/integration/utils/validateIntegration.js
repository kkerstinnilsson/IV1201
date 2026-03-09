/**
 * @file validateIntegration.js
 * @description Validation helper functions for the integration layer.
 * Each function returns true if valid, false if not.
 */

/**
 * Validates that a value is an integer
 * @param {any} value - The value to be checked
 * @returns {boolean} True if valid integer, false otherwise
 */
function validateInteger(value) {
  return value !== undefined && value !== null && Number.isInteger(Number(value));
}

/**
 * Validates that a value is a numeric/decimal value
 * @param {any} value - The value to be checked
 * @returns {boolean} True if valid numeric value, false otherwise
 */
function validateDecimal(value) {
  return value !== undefined && value !== null && !Number.isNaN(parseFloat(value));
}

/**
 * Validates that a value is a non-empty string
 * @param {any} value - The value to be checked
 * @returns {boolean} True if non-empty string, false otherwise
 */
function validateString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a string follows the date format YYYY-MM-DD
 * @param {string} dateStr - The date string to be checked
 * @returns {boolean} True if valid date string, false otherwise
 */
function validateDateStr(dateStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return !!dateStr && dateRegex.test(dateStr) && !Number.isNaN(Date.parse(dateStr));
}

/**
 * Validates that a string follows the Swedish personal number format: YYYYMMDD-XXXX
 * @param {string} pnr - The personal number string
 * @returns {boolean} True if valid personal number format, false otherwise
 */
function validatePnr(pnr) {
  const pnrRegex = /^\d{8}-\d{4}$/;
  return typeof pnr === 'string' && pnrRegex.test(pnr);
}

module.exports = {
  validateInteger, validateDecimal, validateString, validateDateStr, validatePnr,
};
