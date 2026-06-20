import { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axios';
import { User, GoogleAuthResponse, CompleteProfileData } from '../types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (credential: string) => Promise<GoogleAuthResponse>;
  completeProfile: (data: CompleteProfileData) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!localStorage.getItem('token');

  // Fetch current user
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch user:', err);
      setError(err.response?.data?.message || 'Failed to fetch user');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with token
  const login = useCallback(async (token: string) => {
    try {
      setLoading(true);
      localStorage.setItem('token', token);
      await fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUser]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      setLoading(false);
      window.location.href = '/login';
    }
  }, []);

  // Google Login
  const googleLogin = useCallback(async (credential: string): Promise<GoogleAuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/auth/google', { credential });
      const data: GoogleAuthResponse = response.data.data;
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete Profile
  const completeProfile = useCallback(async (data: CompleteProfileData) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('collegeName', data.collegeName);
      formData.append('collegeId', data.collegeId);

      const response = await axios.post('/auth/complete-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to complete profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put('/users/profile', data);
      setUser(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    googleLogin,
    completeProfile,
    refreshUser,
    updateProfile,
  };
};

// Made with Bob