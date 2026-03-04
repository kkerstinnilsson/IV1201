/**
 * @file authService.js
 * @description API client for authentication endpoints.
 */

import { httpClient } from "./httpClient";

/**
 * Register a new user account.
 *
 * @param {string} name - First name.
 * @param {string} surname - Last name.
 * @param {string} email - Email address.
 * @param {string} pnr - Personal number.
 * @param {string} username - Desired username.
 * @param {string} password - Desired password.
 * @returns {Promise<Object>} The created user object returned by the server.
 * @throws {ApiError} If the request fails or validation errors occur.
 */
export function register(name, surname, email, pnr, username, password) {
  return httpClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, surname, email, pnr, username, password }),
  });
}

/**
 * Log in with username and password.
 *
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<{user: {id: number, username: string, role: string}}>} The authenticated user's info.
 * @throws {ApiError} If credentials are invalid or the request fails.
 */
export function login(username, password) {
  return httpClient("/auth/login", {
    method: "POST",
    skipRedirect: true,
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Fetch the currently authenticated user based on the active session.
 *
 * @returns {Promise<{user: {id: number, username: string, role: string}}>} The current user's info.
 * @throws {ApiError} If no active session exists or the request fails.
 */
export function me() {
  return httpClient("/auth/me");
}


/**
 * Log out the current user by destroying their session.
 *
 * @returns {Promise<{message: string}>} A confirmation message from the server.
 * @throws {ApiError} If the request fails.
 */
export function logout() {
  return httpClient("/auth/logout", {
    method: "POST",
  });
}