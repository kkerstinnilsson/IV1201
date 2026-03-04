/**
 * @file authService.js
 * @description API client for authentication endpoints.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Register a new user account.
 *
 * @param {string} name
 * @param {string} surname
 * @param {string} email
 * @param {string} pnr
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function register(name, surname, email, pnr, username, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, surname, email, pnr, username, password }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }
  return data;
}

/**
 * Request an account claim token by email.
 *
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function requestAccountToken(email) {
  const response = await fetch(`${API_BASE}/auth/account-token/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Response status: ${response.status}`);
  return data;
}

/**
 * Claim an account using a token and set credentials.
 *
 * @param {string} token
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function claimAccountToken(token, username, password) {
  const response = await fetch(`${API_BASE}/auth/account-token/claim/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Response status: ${response.status}`);
  return data;
}

/**
 * Log in with username/password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user:{id:number, username:string, role:string}}>}
 */
export async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }
  return data;
}

/**
 * Get currently logged in user (session-based).
 * @returns {Promise<{user:{id:number, username:string, role:string}}>}
 */
export async function me() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }
  return data;
}

/**
 * Log out (destroy session).
 * @returns {Promise<{message:string}>}
 */
export async function logout() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? `Response status: ${response.status}`);
  }
  return data;
}