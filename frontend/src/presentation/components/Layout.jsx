/**
 * Layout component that provides the common page structure.
 * Renders the application header and centers page content.
 */

import Header from './Header';

export default function Layout({ user, onLogout, children }) {
  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <main className="max-w-4xl mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
