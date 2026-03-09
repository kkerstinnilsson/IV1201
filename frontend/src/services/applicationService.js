/**
 * @file applicationService.js
 * @description API client for job application endpoints.
 */

import { httpClient } from "./httpClient";
/**
 * Fetches all applications from the backend.
 * @returns {Promise<Array<{id: number|string, firstName: string, lastName: string, status: string}>>}
 * @throws {ApiError} If the request fails or the user is unauthorized
 */
export function getAllApplications() {
  return httpClient("/applications");
}


/**
 * Submits a new application to the backend.
 * @param {Object} application - The application data
 * @param {Array<{area: string, years: number}>} application.expertiseList - List of expertise areas
 * @param {Object} application.availability - Availability range { startDate: string, endDate: string }
 * @returns {Promise<Object>} - The created application from backend
 * @throws {ApiError} If the request fails or validation errors occur.
 */
export function submitApplication({ expertiseList, availability }) {
  return httpClient("/applications", {
    method: "POST",
    body: JSON.stringify({ expertiseList, availability }),
  });
}

/**
 * Fetches the application status for the currently authenticated user.
 * @returns {{status}} The status information of the user's application True/False (Existing/Not Existing).
 * @throws {ApiError} If the request fails or the user is unauthorized
 */
export function getApplicationStatus() {
  return httpClient("/applications/me/status");
}


/**
 * Deletes the currently authenticated user's application.
 * @returns {Promise<void>}  Resolves with null on success
 * @throws {ApiError} If the request fails or the user is unauthorized.
 */
export function deleteApplication() {
  return httpClient("/applications/me", {
    method: "DELETE",
  });
}

