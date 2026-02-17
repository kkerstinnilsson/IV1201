/**
 * @file App.jsx
 * @description Root component that controls authentication state
 * and conditionally renders views based on login status.
 */

import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApplicationListContainer from './containers/ApplicationListContainer';
import ApplicantHomeContainer from './containers/ApplicantHomeContainer';
import LoginContainer from './containers/LoginContainer';
import { me, logout } from './services/authService';
import Layout from './presentation/components/Layout';


/**
 * Main application component.
 */
function App() {

  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  /**
   * Check for an existing authenticated session
   * when the application first loads.
   */
  useEffect(() => {
    me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  /**
   * Log out the current user and clear local auth state.
   */
  async function handleLogout() {
    await logout();
    setUser(null);
  }

  // While checking session, show loading state
  if (checkingSession) {
    return <p>Loading...</p>;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/applicant'} replace />
              : <LoginContainer onLoginSuccess={setUser} />
          }
        />

        {/* Recruiter */}
        <Route
          path="/recruiter"
          element={
            user?.role === 'recruiter'
              ? <ApplicationListContainer />
              : <Navigate to="/login" replace />
          }
        />

        {/* Applicant */}
        <Route
          path="/applicant"
          element={
            user?.role === 'applicant'
              ? <ApplicantHomeContainer user={user} />
              : <Navigate to="/login" replace />
          }
        />

        {/* Default */}
        <Route
          path="/"
          element={
            !user
              ? <Navigate to="/login" replace />
              : user.role === 'recruiter'
              ? <Navigate to="/recruiter" replace />
              : <Navigate to="/applicant" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
