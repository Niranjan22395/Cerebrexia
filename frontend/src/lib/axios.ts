import axios from 'axios';

// Create axios instance with default config - NO AUTHENTICATION
// On Render, frontend and backend are on same domain, so use relative path
// In development, use localhost:5000
const getBaseURL = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Render), use relative path (same domain)
  if (import.meta.env.PROD) {
    return '/api/v1';
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api/v1';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - handle errors only
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle errors without authentication logic
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;

// Made with Bob
