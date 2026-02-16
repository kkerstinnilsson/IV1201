const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all applications from the backend.
 * @returns {Promise<Array<{id: number|string, firstName: string, lastName: string, status: string}>>}
 * @throws {Error} If the request fails.
 */
export async function getAllApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }
  return data;
}


/**
 * Submits a new application to the backend.
 * @param {Object} application - The application data
 * @param {Array<{area: string, years: number}>} application.expertiseList - List of expertise areas
 * @param {Object} application.availability - Availability range { startDate: string, endDate: string }
 * @returns {Promise<Object>} - The created application from backend
 * @throws {Error} If the request fails
 */
export async function submitApplication({ expertiseList, availability }) {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      expertiseList,
      availability,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }

  return data;
}

/**
 * Fetches the application status for the currently authenticated user.
 * @returns {{status}} The status information of the user's application True/False (Existing/Not Existing).
 * @throws {Error} If the request fails or unauthorized.
 */
export async function getApplicationStatus() {
  const response = await fetch(`${API_BASE_URL}/applications/me/status`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Failed to fetch application status");
  }

  return data;
}


/**
 * Deletes the currently authenticated user's application.
 * @returns {Promise<void>}
 * @throws {Error} If the request fails
 */
export async function deleteApplication() {
  const response = await fetch(`${API_BASE_URL}/applications/me`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      // ignore JSON parse errors for 204 responses
    }

    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }
}

