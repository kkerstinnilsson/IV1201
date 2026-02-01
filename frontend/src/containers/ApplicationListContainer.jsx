import { useState } from 'react';
import ApplicationList from '../presentation/components/ApplicationList';

/**
 * Container component for managing application list state
 * THIS IS A SIMPLE HARDCODED VERSION FOR TESTING
 */
export default function ApplicationListContainer() {
  const fakeApplications = [
    { id: 1, firstName: 'Anna', lastName: 'Andersson', status: 'accepted' },
    { id: 2, firstName: 'Erik', lastName: 'Svensson', status: 'unhandled' },
    { id: 3, firstName: 'Maria', lastName: 'Johansson', status: 'rejected' },
  ];

  const [applications, setApplications] = useState([]);

  const handleFetchApplications = () => {
    setApplications(fakeApplications);
  };

  return (
    <ApplicationList
      applications={applications}
      loading={false}
      error={null}
      onFetchApplications={handleFetchApplications}
    />
  );
}