import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axios from '../lib/axios';

const Login: React.FC = () => {
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });

  // Redirect if already logged in (on page load only)
  React.useEffect(() => {
    // Only redirect if already authenticated when component mounts
    const checkAuth = () => {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.state?.isAuthenticated) {
            window.location.href = '/my-registrations';
          }
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }
    };
    
    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/simple-auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        date_of_birth: formData.dateOfBirth,
      });

      alert('Registration successful! Please login.');
      setIsRegister(false);
      setFormData({ ...formData, name: '', password: '', dateOfBirth: '' });
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/simple-auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = response.data.data;
      setAuth(user, token);
      alert('Login successful!');
      window.location.href = '/my-registrations';
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {isRegister
              ? 'Register to access events and features'
              : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-6">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
              minLength={6}
            />
            {isRegister && (
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? isRegister
                ? 'Creating Account...'
                : 'Signing In...'
              : isRegister
              ? 'Create Account'
              : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setFormData({ name: '', email: '', password: '', dateOfBirth: '' });
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>

        {!isRegister && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">
              💡 New User?
            </p>
            <p className="text-xs text-blue-700">
              Click "Register" above to create your account first
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;

// Made with Bob
