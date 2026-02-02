const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all applications from the backend.
 * @returns {Promise<Array<{id: number|string, firstName: string, lastName: string, status: string}>>}
 * @throws {Error} If the request fails.
 */
export async function getAllApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`);
  if (!response.ok) throw new Error("Failed to fetch applications");
  return response.json();
}