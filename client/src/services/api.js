/**
 * API Service for TaskFlow
 * Centralizes all communication between React frontend and Express backend.
 * Supports JWT authentication and Task CRUD operations.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

/**
 * Token and User persistence in localStorage
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
 * Helper to handle fetch responses and parse JSON with automatic auth header
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized due to expired/invalid token, clean up stored auth
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        clearAuthData();
      }

      const errorMsg =
        data?.message ||
        (data?.errors && data.errors.join(', ')) ||
        `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please verify the server is running on port 5000.');
    }
    throw error;
  }
}

/**
 * System Health check
 */
export async function checkHealth() {
  return request('/health');
}

/**
 * ============================================================================
 * AUTHENTICATION API
 * ============================================================================
 */

/**
 * Register a new user account
 * @param {Object} userData - { name, email, password, confirmPassword }
 */
export async function registerUser(userData) {
  const response = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  if (response.token && response.user) {
    setStoredToken(response.token);
    setStoredUser(response.user);
  }

  return response;
}

/**
 * Log in an existing user
 * @param {Object} credentials - { email, password }
 */
export async function loginUser(credentials) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

  if (response.token && response.user) {
    setStoredToken(response.token);
    setStoredUser(response.user);
  }

  return response;
}

/**
 * Fetch profile of currently authenticated user
 */
export async function getCurrentUser() {
  return request('/auth/me');
}

/**
 * Log out user by clearing credentials
 */
export function logoutUser() {
  clearAuthData();
}

/**
 * ============================================================================
 * TASKS API (Authenticated)
 * ============================================================================
 */

/**
 * Get all tasks for the logged in user, with optional status filter: 'all', 'pending', 'completed'
 */
export async function getTasks(status = 'all') {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/tasks${query}`);
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id) {
  return request(`/tasks/${id}`);
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

/**
 * Update an existing task
 */
export async function updateTask(id, taskData) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  });
}

/**
 * Toggle or update task completion status
 */
export async function toggleTaskStatus(id, completed) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed })
  });
}

/**
 * Delete a task
 */
export async function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE'
  });
}
