import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to extract user profile from token
  const parseToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded.sub ? parseInt(decoded.sub) : 101,
        name: decoded.name || 'User',
        email: decoded.email,
        role: decoded.role?.toUpperCase(), // Standardize role to uppercase
      };
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const parsedUser = parseToken(token);
        if (parsedUser) {
          setUser(parsedUser);
        } else {
          // Clear corrupted/expired tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Event listener for global session expiry (triggered by axios client 401 retry failure)
    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth_session_expired', handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.status === 'success' && res.data?.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        
        const parsedUser = parseToken(res.data.access_token);
        setUser(parsedUser);
        
        return { success: true };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Invalid credentials';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res.status === 'success') {
        return { success: true };
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to register';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
