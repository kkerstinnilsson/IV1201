/**
 * @file App.jsx
 * @description Root component that controls authentication state
 * and conditionally renders views based on login status.
 */

import { useEffect, useState } from 'react';
import ApplicationListContainer from './containers/ApplicationListContainer';
import ApplicantHomeContainer from './containers/ApplicantHomeContainer';
import LoginContainer from './containers/LoginContainer';
import { me, logout } from './services/authService';
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

  // If no authenticated user exists, show login view
  if (!user) {
    return <LoginContainer onLoginSuccess={setUser} />;
  }

  // Authenticated view
  return (
    <div className="App">
      <p>
        Logged in as {user.username} ({user.role}){' '}
        <button onClick={handleLogout}>Logout</button>
      </p>

      {user.role === 'recruiter' && (
        <ApplicationListContainer />
      )}

      {user.role === 'applicant' && (
        <ApplicantHomeContainer user={user} />
      )}
    </div>
  );
}

export default App;
