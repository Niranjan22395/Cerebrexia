import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        console.log('🔐 [AuthStore] setAuth called with:', {
          userId: user.id,
          userEmail: user.email,
          userRole: (user as any).role,
          tokenLength: token?.length,
        });

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log('✅ [AuthStore] State updated successfully');
        
        // Log the persisted state
        setTimeout(() => {
          const stored = localStorage.getItem('auth-storage');
          console.log('💾 [AuthStore] Persisted to localStorage:', stored ? 'Yes' : 'No');
          if (stored) {
            console.log('📦 [AuthStore] Stored data:', JSON.parse(stored));
          }
        }, 100);
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear persisted state
        localStorage.removeItem('auth-storage');
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Made with Bob
