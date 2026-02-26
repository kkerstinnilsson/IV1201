/**
 * @file LoginPage.jsx
 * @description Presentation component for login.
 * 
 */

import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { FcOk } from "react-icons/fc";

/**
 * Component for the login form.
 *
 * @param {boolean} loading - Loading state.
 * @param {string|null} error - Error message returned from the backend.
 * @param {(payload: {username: string, password: string}) => void} onLogin - Callback to login
 */
export default function LoginPage({ loading, error, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const location = useLocation();

  function handleSubmit(e) {
    e.preventDefault();
    onLogin({ username, password });
  }


  return (
    <div className="max-w-sm mx-auto">
      <div className="container">
        <h1 className="mb-4">Login</h1>

        <div>
        {location.state?.registered && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <FcOk className="text-xl" />
            <span>Account created successfully.</span>
          </div>
        )}
        </div>

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

        <div className="mt-6 text-center">
          <p>No account? {" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register here!
            </Link>
            </p>
        </div>
      </div>
    </div>
  );
}