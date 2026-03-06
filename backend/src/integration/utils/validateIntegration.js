/**
 * @file validateIntegration.js
 * @description Validation for the integration layer 
 */

/**
 * Validates that a value is an integer
 * @param {any} value - The value to be checked
 * @param {string} fieldName - Label of the value used for the error message
 * @throws {Error} If the value is not a valid integer
 */
function validateInteger(value, fieldName) {
    if (value == undefined || !Number.isInteger(Number(value))) {
        throw new Error(`Integration layer: ${fieldName} must be a valid integer`);
    }
}

/**
 * Validates that a value is a numeric/decimal value 
 * @param {any} value - The value to be checked
 * @param {string} fieldName - Label of the value used for the error message
 * @throws {Error} If the value is not a valid numeric value
 */
function validateDecimal(value, fieldName) {
    if (value == undefined || isNaN(parseFloat(value))) {
        throw new Error(`Integration layer: ${fieldName} must be a valid numeric value`);
    }
}

/**
 * Validates that a value is a non-empty string
 * @param {any} value - The value to be checked
 * @param {string} fieldName - Label of the value used for the error message
 * @throws {Error} If the value is not a valid string
 */
function validateString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Integration layer: ${fieldName} must be a non-empty string`);
    }
}

/**
 * Validates that a string follows the date format YYYY-MM-DD
 * @param {string} dateStr - The date string to be checked
 * @param {string} fieldName - Label of the value used for the error message
 * @throws {Error} If the format is incorrect or the date is invalid
 */
function validateDateStr(dateStr, fieldName) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateStr || !dateRegex.test(dateStr) || isNaN(Date.parse(dateStr))) {
        throw new Error(`Integration layer: ${fieldName} must be a valid date (YYYY-MM-DD)`);
    }
}

/**
 * Validates that a string follows the Swedish personal number format: YYYYMMDD-XXXX
 * @param {string} pnr - The personal number string
 * @param {string} fieldName - Label for the error message
 * @throws {Error} If the format is incorrect
 */
function validatePnr(pnr, fieldName) {
    const pnrRegex = /^\d{8}-\d{4}$/;
    if (!pnr || typeof pnr !== 'string') {
        throw new Error(`Integration layer: ${fieldName} is missing or not a string`);
    }
    if (!pnrRegex.test(pnr)) {
        throw new Error(`Integration layer: ${fieldName} must follow the format XXXXXXXX-YYYY`);
    }
}

module.exports = { validateInteger, validateDecimal, validateString, validateDateStr, validatePnr };