
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

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
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
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

async function request(endpoint, options = {}) {
  const token = getStoredToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check the API URL and server status."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      endpoint !== "/auth/login" &&
      endpoint !== "/auth/register"
    ) {
      clearAuthData();
    }

    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error
        : null;

    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export function checkHealth() {
  return request("/health");
}

export async function registerUser(userData) {
  const response = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (response.token && response.user) {
    setStoredToken(response.token);
    setStoredUser(response.user);
  }

  return response;
}

export async function loginUser(credentials) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.token && response.user) {
    setStoredToken(response.token);
    setStoredUser(response.user);
  }

  return response;
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function logoutUser() {
  clearAuthData();
}

export function getTasks(status = "all") {
  const query =
    status && status !== "all"
      ? `?status=${encodeURIComponent(status)}`
      : "";

  return request(`/tasks${query}`);
}

export function getTaskById(id) {
  return request(`/tasks/${encodeURIComponent(id)}`);
}

export function createTask(taskData) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export function updateTask(id, taskData) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
}

export function toggleTaskStatus(id, completed) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

