/**
* @file useAuth.js
* @description Custom hook for handling authentication session state.
*/

import { useEffect, useState } from 'react';
import { me, logout } from '../services/authService';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  return { user, setUser, checkingSession, handleLogout };
}
