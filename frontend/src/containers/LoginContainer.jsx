/**
 * Container component for managing login state.
 * Uses service layer for authentication.
 */

import { useState } from 'react';
import LoginPage from '../presentation/pages/LoginPage';
import { login } from '../services/authService';

export default function LoginContainer({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  async function handleLogin({ username, password }) {
    setLoading(true);
    try {
      const data = await login(username, password);
      onLoginSuccess(data.user);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginPage
      loading={loading}
      onLogin={handleLogin}
    />
  );
}
