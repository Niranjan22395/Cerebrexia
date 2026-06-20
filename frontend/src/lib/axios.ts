import axios from 'axios';

// Create axios instance with default config - NO AUTHENTICATION
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
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
