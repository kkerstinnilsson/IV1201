/**
 * @file httpClient.js
 * @description Centralized fetch wrapper and custom API error class for all HTTP requests.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Represents an error returned from the API.
 * @class
 * @extends Error
 */
export class ApiError extends Error {
  /**
   * @param {Object} params
   * @param {number} params.status - HTTP status code (0 for network errors).
   * @param {string} params.message - Human-readable error message.
   * @param {Object} [params.data] - Optional parsed response body.
   */
  constructor({ status, message, data }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Centralized fetch wrapper that handles JSON serialization, credentials, and error handling.
 * Automatically redirects to /login on 401 responses unless skipRedirect is set.
 *
 * @param {string} endpoint - The API endpoint path (e.g. "/auth/login").
 * @param {RequestInit & { skipRedirect?: boolean }} [options={}] - Optional fetch options.
 *   Set skipRedirect: true to suppress the automatic /login redirect on 401 (e.g. session checks).
 * @returns {Promise<any>} Parsed JSON response body, or null for empty responses (e.g. 204).
 * @throws {ApiError} If a network error occurs or the response status is not ok.
 */
export async function httpClient(endpoint, options = {}) {
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new ApiError({
      status: 0,
      message: "Network error. Please check your connection.",
    });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Ignore JSON parse errors (e.g., 204 No Content)
  }

  if (!response.ok) {
    const error = new ApiError({
      status: response.status,
      message: data?.message || `Request failed with status ${response.status}`,
      data,
    });

    // 401 handling: redirect to login unless caller opts out (session check)
    if (response.status === 401 && !options.skipRedirect) {
      window.location.href = "/login";
    }

    throw error;
  }

  return data;
}