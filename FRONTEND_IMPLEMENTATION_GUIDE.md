# Cerebrexia Frontend - Complete Implementation Guide

**Status:** Ready for Implementation  
**Estimated Time:** 8-10 hours  
**Progress:** Configuration 100%, Components 0%

---

## 🎯 Implementation Roadmap

### Phase 1: Core Setup (30 min)
1. Create main.tsx and App.tsx
2. Setup routing
3. Create utility functions
4. Setup API client

### Phase 2: Common Components (2 hours)
1. Button, Input, Card, Modal
2. Loading, Toast
3. Layout components

### Phase 3: Feature Components (3 hours)
1. Authentication components
2. Event components
3. Payment components
4. QR components

### Phase 4: Pages (2 hours)
1. Public pages
2. User pages
3. Admin pages

### Phase 5: Integration (2 hours)
1. State management
2. API integration
3. Testing

---

## 📁 Complete File Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Main app component
├── vite-env.d.ts              # Vite types
├── styles/
│   └── index.css ✅           # Global styles
├── lib/
│   ├── axios.ts               # Axios instance
│   ├── api.ts                 # API functions
│   ├── utils.ts               # Utility functions
│   └── constants.ts           # Constants
├── types/
│   ├── index.ts               # Export all types
│   ├── auth.ts                # Auth types
│   ├── event.ts               # Event types
│   ├── payment.ts             # Payment types
│   └── user.ts                # User types
├── store/
│   ├── authStore.ts           # Auth state
│   ├── eventStore.ts          # Event state
│   └── uiStore.ts             # UI state
├── hooks/
│   ├── useAuth.ts             # Auth hook
│   ├── useEvents.ts           # Events hook
│   ├── usePayment.ts          # Payment hook
│   └── useToast.ts            # Toast hook
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── GoogleLoginButton.tsx
│   │   ├── ProfileCompletion.tsx
│   │   └── ProtectedRoute.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   └── EventDetails.tsx
│   ├── payment/
│   │   ├── PaymentForm.tsx
│   │   └── RazorpayCheckout.tsx
│   ├── qr/
│   │   ├── QRDisplay.tsx
│   │   └── QRScanner.tsx
│   └── doctor/
│       └── DoctorPaymentForm.tsx
└── pages/
    ├── Home.tsx
    ├── Login.tsx
    ├── Events.tsx
    ├── EventDetails.tsx
    ├── MyRegistrations.tsx
    ├── Profile.tsx
    ├── DoctorPortal.tsx
    ├── CompleteProfile.tsx
    ├── admin/
    │   ├── Dashboard.tsx
    │   ├── Users.tsx
    │   ├── Events.tsx
    │   └── Payments.tsx
    └── NotFound.tsx
```

---

## 🚀 Quick Implementation Steps

### Step 1: Install Dependencies
```bash
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/frontend
npm install
```

### Step 2: Create Core Files

Run these commands to create all necessary files:

```powershell
# Create all component directories
cd src/components
New-Item -ItemType Directory -Path common,layout,auth,events,payment,qr,doctor,admin -Force

# Create all files (will be populated with code below)
New-Item -ItemType File -Path common/Button.tsx,common/Input.tsx,common/Card.tsx,common/Modal.tsx,common/Loading.tsx
New-Item -ItemType File -Path layout/Header.tsx,layout/Footer.tsx,layout/Sidebar.tsx,layout/Layout.tsx
New-Item -ItemType File -Path auth/GoogleLoginButton.tsx,auth/ProfileCompletion.tsx,auth/ProtectedRoute.tsx
```

### Step 3: Copy Code Templates

Use the code templates provided in sections below for each file.

---

## 📝 Code Templates

### 1. main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2. App.tsx
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import MyRegistrations from './pages/MyRegistrations'
import Profile from './pages/Profile'
import CompleteProfile from './pages/CompleteProfile'
import DoctorPortal from './pages/DoctorPortal'
import NotFound from './pages/NotFound'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminEvents from './pages/admin/Events'
import AdminPayments from './pages/admin/Payments'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/doctor-portal" element={<DoctorPortal />} />

            {/* Protected User Routes */}
            <Route path="/complete-profile" element={
              <ProtectedRoute><CompleteProfile /></ProtectedRoute>
            } />
            <Route path="/my-registrations" element={
              <ProtectedRoute><MyRegistrations /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute requireAdmin><AdminEvents /></ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
```

### 3. lib/axios.ts
```typescript
import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export default api
```

### 4. lib/api.ts
```typescript
import api from './axios'

export const authAPI = {
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  completeProfile: (data: any) => api.post('/auth/complete-profile', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
}

export const eventsAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  register: (id: string) => api.post(`/events/${id}/register`),
  getMyRegistrations: () => api.get('/events/my/registrations'),
}

export const paymentsAPI = {
  createOrder: (data: any) => api.post('/payments/create-order', data),
  verify: (data: any) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/user/history'),
}

export const qrAPI = {
  generate: (data: any) => api.post('/qr/generate', data),
  getMyQR: () => api.get('/qr/my-qr'),
  validate: (token: string) => api.post('/qr/validate', { token }),
  scan: (token: string) => api.post('/qr/scan', { token }),
}

export const doctorAPI = {
  createOrder: (data: any) => api.post('/doctors/create-order', data),
  verifyPayment: (data: any) => api.post('/doctors/verify-payment', data),
  getFinanceQR: () => api.get('/doctors/finance/qr'),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadCollegeId: (url: string) => api.post('/users/upload-college-id', { college_id_url: url }),
  getVerificationStatus: () => api.get('/users/verification-status'),
}

export const adminAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  verifyUser: (userId: string, status: string, reason?: string) => 
    api.put(`/users/${userId}/verify`, { status, rejection_reason: reason }),
  getPayments: (params?: any) => api.get('/payments/admin/all', { params }),
  getStats: () => api.get('/users/stats/overview'),
}
```

### 5. store/authStore.ts
```typescript
import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  profileCompleted: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  },
  
  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null
  })),
}))
```

### 6. hooks/useAuth.ts
```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await authAPI.getMe()
      return data.user
    },
    enabled: isAuthenticated,
  })

  const loginMutation = useMutation({
    mutationFn: authAPI.googleLogin,
    onSuccess: (response) => {
      login(response.data.token, response.data.user)
      toast.success('Login successful!')
    },
    onError: () => {
      toast.error('Login failed')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logout()
      toast.success('Logged out successfully')
    },
  })

  return {
    user: currentUser || user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  }
}
```

### 7. components/common/Button.tsx
```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        isLoading && 'btn-loading',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## 🎨 Component Implementation Priority

### High Priority (Implement First)
1. ✅ Button, Input, Card - Common components
2. ✅ Layout (Header, Footer) - Navigation
3. ✅ GoogleLoginButton - Authentication
4. ✅ Home Page - Landing page
5. ✅ Events Page - Event listing

### Medium Priority
6. EventCard, EventDetails - Event display
7. PaymentForm, RazorpayCheckout - Payments
8. QRDisplay - QR code display
9. Profile Page - User profile
10. MyRegistrations - User registrations

### Low Priority
11. Admin Dashboard - Admin interface
12. QRScanner - Gate staff
13. DoctorPortal - Doctor payments

---

## 📦 Installation & Setup

```bash
# Navigate to frontend
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your values:
# VITE_API_URL=http://localhost:3000/api
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
# VITE_RAZORPAY_KEY_ID=your-razorpay-key-id

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## ✅ Implementation Checklist

### Core Setup
- [ ] Create main.tsx
- [ ] Create App.tsx with routing
- [ ] Setup axios instance
- [ ] Create API functions
- [ ] Setup auth store
- [ ] Create useAuth hook

### Common Components
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component
- [ ] Loading component

### Layout
- [ ] Header component
- [ ] Footer component
- [ ] Layout wrapper

### Auth Components
- [ ] GoogleLoginButton
- [ ] ProfileCompletion
- [ ] ProtectedRoute

### Pages
- [ ] Home page
- [ ] Login page
- [ ] Events page
- [ ] Event details page
- [ ] My registrations
- [ ] Profile page
- [ ] Doctor portal

### Integration
- [ ] Test authentication flow
- [ ] Test event registration
- [ ] Test payment flow
- [ ] Test QR code generation

---

## 🚀 Next Steps

1. **Copy all code templates** from this guide into respective files
2. **Install dependencies**: `npm install`
3. **Configure environment**: Edit `.env` file
4. **Start development**: `npm run dev`
5. **Test each feature** as you implement it

---

**Status:** Ready for Implementation  
**Estimated Completion:** 8-10 hours  
**Current Progress:** 60% (Backend + Config Complete)
