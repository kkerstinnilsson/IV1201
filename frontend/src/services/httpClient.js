/**
 * @file httpClient.js
 * @description Centralized fetch wrapper and custom API error class for all HTTP requests to backend
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


let unauthorizedHandler = null;

/**
 * Register a callback to be invoked when a 401 response is received.
 * Used to handle session expiry (redirect to /login)
 *
 * @param {() => void} handler - Callback invoked on 401 (unless skipRedirect is set).
 * @returns {void}
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

/**
 * Centralized fetch wrapper that handles JSON serialization, credentials, and error handling.
 *
 * @param {string} endpoint - The API endpoint path
 * @param {RequestInit & { skipRedirect?: boolean }} [options={}] - Optional fetch options.
 *   Set skipRedirect: true to suppress the 401 handler (for passive session checks).
 * @returns {Promise<any>} Parsed JSON response body, or null for empty responses
 * @throws {ApiError} If a network error occurs or the response status is not ok.
 */
export async function httpClient(endpoint, options = {}) {
  const { skipRedirect = false, ...fetchOptions } = options;

  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
    ...fetchOptions,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch {
    throw new ApiError({
      status: 0,
      message: "Network error. Please check your connection.",
    });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Ignore JSON parse errors (e.g. 204 No Content)
  }

  if (!response.ok) {
    const error = new ApiError({
      status: response.status,
      message: data?.message ?? `Request failed with status ${response.status}`,
      data,
    });

    if (response.status === 401 && !skipRedirect) {
      unauthorizedHandler?.();
    }

    throw error;
  }

  return data;
}