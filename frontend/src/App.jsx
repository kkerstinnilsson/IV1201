/**
 * @file App.jsx
 * @description Root component that controls authentication state
 * and conditionally renders views based on login status.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ApplicationListContainer from './containers/ApplicationListContainer';
import ApplicantHomeContainer from './containers/ApplicantHomeContainer';
import LoginContainer from './containers/LoginContainer';
import Layout from './presentation/components/Layout';
import useAuth from './hooks/useAuth';


/**
 * Main application component.
 */
function App() {

const { user, setUser, checkingSession, handleLogout } = useAuth();

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
