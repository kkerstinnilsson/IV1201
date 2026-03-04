/**
 * @file ApplicationListContainer.jsx
 * @description Container component that manages state and data fetching for the application list.
 * Delegates rendering to ApplicationList (ApplicationsPage).
 */

import { useState } from 'react';
import ApplicationList from '../presentation/pages/ApplicationsPage';
import { getAllApplications } from "../services/applicationService";
import { handleApiError } from "../utils/handleApiError";

/**
 * Provides applications data and fetch logic to the ApplicationList presentation component.
 *
 * @returns {JSX.Element} ApplicationList with applications, loading, error, and fetch handler props.
 */
export default function ApplicationListContainer() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches all applications from the API and updates local state.
   * Sets loading during the request and populates error state on failure.
   *
   * @returns {Promise<void>}
   */
  async function handleFetchApplications() {
    setError(null);
    setLoading(true);

    try {
      const data = await getAllApplications();
      setApplications(data);
    } catch (error) {
      setError(handleApiError(error, "Failed to fetch applications"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ApplicationList
      applications={applications}
      loading={loading}
      error={error}
      onFetchApplications={handleFetchApplications}
    />
  );
}