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
      {!user ? (
        <LoginContainer onLoginSuccess={setUser} />
      ) : user.role === 'recruiter' ? (
        <ApplicationListContainer />
      ) : (
        <ApplicantHomeContainer user={user} />
      )}
    </Layout>
  );
}

export default App;
