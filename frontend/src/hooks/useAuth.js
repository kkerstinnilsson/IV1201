/**
* @file useAuth.js
* @description Custom hook for handling authentication session state.
*/

import { useEffect, useState } from 'react';
import { me, logout } from '../services/authService';
import { ApiError } from "../services/httpClient";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await me();
        setUser(data.user);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setUser(null);
        } else {
          // unexpected error
          console.error("Session check failed:", error);
          setAuthError("Failed to verify session.");
          setUser(null);
        }
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return { user, setUser, checkingSession, handleLogout, authError };
}
