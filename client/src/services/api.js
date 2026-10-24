```javascript
/**
 * API Service for TaskFlow
 * Handles authentication and task CRUD operations.
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://taskflow-kqjm.onrender.com'
).replace(/\/+$/, '');

const API_PREFIX = '/api';

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

/**
 * Token and user persistence
 */
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  const userStr = localStorage.getItem(USER_KEY);

  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Common request helper
 */
async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${API_PREFIX}${normalizedEndpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      if (
        response.status === 401 &&
        normalizedEndpoint !== '/auth/login' &&
        normalizedEndpoint !== '/auth/register'
      ) {
        clearAuthData();
      }

      const errorMessage =
        typeof data === 'object' && data !== null
          ? data.message ||
            (Array.isArray(data.errors) ? data.errors.join(', ') : null)
          : null;

      throw new Error(
        errorMessage || `Request failed with status ${response.status}`
      );
    }

    return data;
  } c
```
