/**
 * @file authService.js
 * @description API client for authentication endpoints.
 */

import { httpClient } from "./httpClient";
/**
 * Register a new user account.
 *
 * @param {string} name
 * @param {string} surname
 * @param {string} email
 * @param {string} pnr
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>}
 * @throws {ApiError} if the request fails or validation errors occur
 */
export function register(name, surname, email, pnr, username, password) {
  return httpClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, surname, email, pnr, username, password }),
  });
}

/**
 * Request an account claim token by email.
 *
 * @param {string} email
 * @returns {Promise<Object>}
 * @throws {ApiError} If the request fails or the email is not found
 */
export function requestAccountToken(email) {
  return httpClient("/auth/account-token/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Claim an account using a token and set credentials.
 *
 * @param {string} token
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>}
 * @throws {ApiError} If the token is invalid, expired, or the request fails.
 */
export function claimAccountToken(token, username, password) {
  return httpClient(`/auth/account-token/claim/${token}`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Log in with username/password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user:{id:number, username:string, role:string}}>}
 * @throws {ApiError} If credentials are invalid or the request fails
 */
export function login(username, password) {
  return httpClient("/auth/login", {
    method: "POST",
    skipRedirect: true,
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Get currently logged in user (session-based).
 * @returns {Promise<{user:{id:number, username:string, role:string}}>}
 * @throws {ApiError} If the request fails for a reason other than authentication
 */
export function me() {
  return httpClient("/auth/me", { skipRedirect: true });
}

/**
 * Log out (destroy session).
 * @returns {Promise<{message:string}>}
 * @throws {ApiError} If the request fails
 */
export function logout() {
  return httpClient("/auth/logout", {
    method: "POST",
  });
}