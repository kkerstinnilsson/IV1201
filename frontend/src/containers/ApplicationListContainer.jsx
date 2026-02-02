import { useState } from 'react';
import ApplicationList from '../presentation/pages/ApplicationList';
import { getAllApplications } from "../services/applicationService";

/**
 * Container component for managing application list state
 * Uses service layer for fetching data.
 */
export default function ApplicationListContainer() {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFetchApplications() {
      setError(null);
      setLoading(true);
  
      try {
        const data = await getAllApplications();
        setApplications(data);
      } catch (err) {
        setError(err?.message ?? "Failed to fetch applications");
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