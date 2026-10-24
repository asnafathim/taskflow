import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredUser,
  getStoredToken,
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize immediately from localStorage for 0ms render delay
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [authLoading, setAuthLoading] = useState(false);

  // Silent background token validation - non-blocking
  useEffect(() => {
    let isMounted = true;
    const storedToken = getStoredToken();
    if (!storedToken) return;

    getCurrentUser()
      .then((response) => {
        if (isMounted && response?.user) {
          setUser(response.user);
        }
      })
      .catch((err) => {
        // Token expired or invalid
        console.warn('Session expired:', err.message);
        if (isMounted) {
          logoutUser();
          setUser(null);
          setToken(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res;
  }, []);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    const res = await registerUser({ name, email, password, confirmPassword });
    setUser(res.user);
    setToken(res.token);
    return res;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    authLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
