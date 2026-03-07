import { ApiError } from "../services/httpClient";

/**
 * Converts an ApiError into a UI-friendly error message.
 *
 * @param {Error} error - The caught error, expected to be an ApiError instance.
 * @param {string} [fallbackMessage="Something went wrong"] - Message to return for unknown errors.
 * @returns {string} A human-readable error message suitable for display.
 */
export function handleApiError(error, fallbackMessage = "Something went wrong") {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return "Network error. Please check your connection.";
      case 400:
        return error.message; // validation/business error
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return error.message || fallbackMessage;
    }
  }
  return fallbackMessage;
}