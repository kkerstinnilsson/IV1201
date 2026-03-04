/**
 * @file applicationService.js
 * @description API client for job application endpoints.
 */

import { httpClient } from "./httpClient";

/**
 * Fetch all applications (recruiter use).
 *
 * @returns {Promise<Array<{id: number|string, firstName: string, lastName: string, status: string}>>}
 *   List of all submitted applications.
 * @throws {ApiError} If the request fails or the user is unauthorized.
 */
export function getAllApplications() {
  return httpClient("/applications");
}

/**
 * Submit a new application for the currently authenticated user.
 *
 * @param {Object} application - The application payload.
 * @param {Array<{area: string, years: number}>} application.expertiseList - Areas of expertise with years of experience.
 * @param {{startDate: string, endDate: string}} application.availability - Desired availability date range.
 * @returns {Promise<Object>} The created application as returned by the server.
 * @throws {ApiError} If the request fails or validation errors occur.
 */
export function submitApplication({ expertiseList, availability }) {
  return httpClient("/applications", {
    method: "POST",
    body: JSON.stringify({ expertiseList, availability }),
  });
}

/**
 * Fetch the application status for the currently authenticated user.
 *
 * @returns {Promise<{status: boolean}>} Whether the user has an existing application.
 * @throws {ApiError} If the request fails or the user is unauthorized.
 */
export function getApplicationStatus() {
  return httpClient("/applications/me/status");
}

/**
 * Delete the currently authenticated user's application.
 *
 * @returns {Promise<null>} Resolves with null on success (204 No Content).
 * @throws {ApiError} If the request fails or the user is unauthorized.
 */
export function deleteApplication() {
  return httpClient("/applications/me", {
    method: "DELETE",
  });
}