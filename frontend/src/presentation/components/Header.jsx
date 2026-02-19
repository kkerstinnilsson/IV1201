/**
 * Header component
 * Top navigation bar shown in all views
 */

import { Link } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  return (
    <header className="flex justify-between bg-gray-50 items-center px-6 py-4 border border-gray-200 shadow-sm">
      <h1 className="text-xl font-semibold">
        <Link to="/">
          Recruitment Application
        </Link>
      </h1>

      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span>
            {user.username} ({user.role})
          </span>
          <button
            onClick={onLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
