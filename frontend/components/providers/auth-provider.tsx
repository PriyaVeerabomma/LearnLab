'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('Initial AuthProvider mount');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('Checking authentication status...');
    try {
      const token = localStorage.getItem('access_token');
      console.log('Stored token:', token ? 'exists' : 'not found');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // TODO: Replace with actual /me endpoint call
      console.log('Setting dummy user data for development');
      setUser({
        id: "dummy-id",
        email: "user@example.com",
        username: "demouser",
        full_name: "Demo User"
      });
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeCookie('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setCookie('access_token', data.access_token);
        return data.access_token;
      } else {
        throw new Error('Refresh token failed');
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeCookie('access_token');
      setUser(null);
      throw error;
    }
  };

  const updateUserData = async (token: string) => {
    console.log('Updating user data with token:', token ? 'exists' : 'missing');
    // TODO: Replace with actual /me endpoint call
    setUser({
      id: "dummy-id",
      email: "user@example.com",
      username: "demouser",
      full_name: "Demo User"
    });
    console.log('User data updated successfully');
  };

  const handleAuthSuccess = async (tokens: { access_token: string, refresh_token: string }) => {
    console.log('Handling successful authentication...');
    
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    setCookie('access_token', tokens.access_token);
    console.log('Tokens stored in localStorage and cookies');

    await updateUserData(tokens.access_token);
    console.log('User data updated, preparing for navigation');

    try {
      await router.push('/dashboard');
      console.log('Navigation to dashboard completed');
    } catch (navError) {
      console.error('Navigation error:', navError);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Starting login process for email:', email);
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Making login request to:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        console.error('Login request failed:', response.status);
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful, received token');
      
      await handleAuthSuccess(data);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    console.log('Starting registration process');
    try {
      setIsLoading(true);
      setError(null);

      console.log('Making registration request');
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        console.error('Registration request failed:', response.status);
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      console.log('Registration successful, proceeding to login');
      await login(userData.email, userData.password);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    console.log('Starting logout process');
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        console.log('Making logout request');
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }

      console.log('Clearing storage and cookies');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeCookie('access_token');
      setUser(null);
      
      console.log('Navigating to home page');
      await router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}