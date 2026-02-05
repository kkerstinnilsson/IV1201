import { useState } from 'react';

/**
 * Presentation component for login.
 *
 * @param {boolean} loading - Loading state
 * @param {string|null} error - Error message if any
 * @param {(payload: {username: string, password: string}) => void} onLogin - Callback to login
 */
export default function LoginPage({ loading, error, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onLogin({ username, password });
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username:{' '}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Password:{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      {error && <p>Error: {error}</p>}
    </div>
  );
}
