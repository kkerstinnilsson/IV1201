import { useState } from 'react';
import LoginPage from '../presentation/pages/LoginPage';
import { login } from '../services/authService';

/**
 * Container component for managing login state.
 * Uses service layer for authentication.
 */
export default function LoginContainer({ onLoginSuccess }) {
    
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin({ username, password }) {
    setError(null);
    setLoading(true);

    try {
      const data = await login(username, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginPage
      loading={loading}
      error={error}
      onLogin={handleLogin}
    />
  );
}
