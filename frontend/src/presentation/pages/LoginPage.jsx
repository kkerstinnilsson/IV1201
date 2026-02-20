/**
 * Presentation component for login.
 *
 * @param {boolean} loading - Loading state
 * @param {string|null} error - Error message if any
 * @param {(payload: {username: string, password: string}) => void} onLogin - Callback to login
 */

import { useState } from 'react';

export default function LoginPage({ loading, error, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onLogin({ username, password });
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="container">
        <h1 className="mb-4">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label>Username</label>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label>Password</label>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {error && (
          <p className="error-box mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}