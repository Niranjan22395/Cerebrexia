import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  // HARDCODED Google Client ID
  const clientId = '155072524943-sadag7v8m9igbvokanftvktl8s471d3j.apps.googleusercontent.com';

  useEffect(() => {
    console.log('🔵 GoogleLoginButton mounted');
    console.log('🔵 Client ID:', clientId);
    
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google script loaded');
      if (window.google) {
        try {
          console.log('✅ window.google exists');
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });
          console.log('✅ Google initialized');

          const buttonDiv = document.getElementById('googleSignInButton');
          console.log('🔵 Button div:', buttonDiv);
          
          if (buttonDiv) {
            window.google.accounts.id.renderButton(
              buttonDiv,
              {
                theme: 'outline',
                size: 'large',
                width: 350,
                text: 'continue_with',
              }
            );
            console.log('✅ Google button rendered');
          } else {
            console.error('❌ Button div not found');
          }
        } catch (error) {
          console.error('❌ Error initializing Google:', error);
        }
      } else {
        console.error('❌ window.google not available');
      }
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Google script:', error);
    };

    document.body.appendChild(script);
    console.log('🔵 Script added to body');

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
        console.log('🔵 Script removed from body');
      }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const { credential } = response;
      
      // Send credential to backend
      const data = await authApi.googleLogin(credential);
      
      // Store auth data
      setAuth(data.user, data.token);
      
      toast.success('Login successful!');
      
      // Redirect based on profile completion
      if (data.profileCompleted) {
        navigate('/');
      } else {
        navigate('/complete-profile');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="googleSignInButton"></div>
      
      <div className="text-center text-sm text-gray-600">
        <p>By continuing, you agree to our</p>
        <div className="space-x-2">
          <a href="/terms" className="text-indigo-600 hover:text-indigo-700">
            Terms of Service
          </a>
          <span>and</span>
          <a href="/privacy" className="text-indigo-600 hover:text-indigo-700">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;

// Made with Bob
