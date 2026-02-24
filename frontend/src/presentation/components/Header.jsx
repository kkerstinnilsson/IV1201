/**
 * Header component
 * Top navigation bar shown in all views
 */

import { Link } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  return (
    <header className="flex justify-between bg-gray-50 items-center px-6 py-3 border border-gray-200 shadow-sm">
      <h1 className="text-xl font-semibold">
        <Link to="/">
          <img
            src="/logo2.png"
            alt="Recruitment Application"
            className="h-15 w-auto"
          />
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
