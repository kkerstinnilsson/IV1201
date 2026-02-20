/**
 * Presentation component for displaying application list
 * @param {Array} applications - List of applications to display
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message if any
 * @param {Function} onFetchApplications - Callback to fetch applications
 */
export default function ApplicationList({ 
  applications, 
  loading, 
  error, 
  onFetchApplications 
}) {
  return (
    <div>
      <div className="container">
      <h1>Applications</h1>
      
      <button onClick={onFetchApplications}
      className="btn-secondary mt-4 mb-4">
        List All Applications
      </button>

      {loading && <p>Loading applications...</p>}
      
      {error && <p className="error-box mt-4">Error: {error}</p>}
      
      {applications.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.firstName} {application.lastName}</td>
                <td>{application.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
}