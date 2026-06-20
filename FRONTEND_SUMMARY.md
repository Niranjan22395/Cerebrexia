# Cerebrexia Frontend - Complete Structure & Implementation Guide

**Project:** Cerebrexia Event Management Platform  
**Frontend Framework:** React 18 + TypeScript + Vite  
**Styling:** Tailwind CSS  
**State Management:** Zustand + React Query  
**Status:** Configuration Complete, Ready for Implementation

---

## 📁 Frontend Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── QRCodeDisplay.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── auth/
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── ProfileCompletion.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── EventDetails.tsx
│   │   │   └── EventRegistration.tsx
│   │   ├── payment/
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── RazorpayCheckout.tsx
│   │   │   └── PaymentHistory.tsx
│   │   ├── qr/
│   │   │   ├── QRGenerator.tsx
│   │   │   ├── QRScanner.tsx
│   │   │   └── QRDisplay.tsx
│   │   ├── doctor/
│   │   │   ├── DoctorPaymentForm.tsx
│   │   │   └── DoctorReceipt.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── UserManagement.tsx
│   │       ├── EventManagement.tsx
│   │       ├── PaymentManagement.tsx
│   │       └── PromoCodeManagement.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Events.tsx
│   │   ├── EventDetails.tsx
│   │   ├── MyRegistrations.tsx
│   │   ├── Profile.tsx
│   │   ├── DoctorPortal.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Payments.tsx
│   │   │   └── Settings.tsx
│   │   └── NotFound.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── axios.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── usePayment.ts
│   │   ├── useQR.ts
│   │   └── useToast.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── eventStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── event.ts
│   │   ├── payment.ts
│   │   ├── qr.ts
│   │   └── user.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example ✅
├── .gitignore ✅
├── index.html ✅
├── package.json ✅
├── postcss.config.js ✅
├── tailwind.config.js ✅
├── tsconfig.json ✅
├── tsconfig.node.json ✅
└── vite.config.ts ✅
```

---

## ✅ Completed Configuration Files

### 1. **package.json** ✅
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8
- Tailwind CSS 3.3.6
- React Router DOM 6.20.0
- Axios 1.6.2
- Zustand 4.4.7
- React Query 5.12.2
- React Hook Form 7.48.2
- Zod 3.22.4
- QRCode.react 3.1.0
- React Hot Toast 2.4.1
- Lucide React 0.294.0

### 2. **TypeScript Configuration** ✅
- `tsconfig.json` - Main TypeScript config with path aliases
- `tsconfig.node.json` - Node-specific config for Vite

### 3. **Vite Configuration** ✅
- React plugin configured
- Path aliases (@/ → ./src/)
- Dev server on port 5173
- Proxy to backend API (localhost:3000)

### 4. **Tailwind CSS** ✅
- Custom color palette (primary, secondary)
- Inter font family
- PostCSS with autoprefixer

### 5. **Environment Variables** ✅
- `.env.example` with all required variables
- API URL configuration
- Google OAuth client ID
- Razorpay key ID

### 6. **HTML Template** ✅
- SEO meta tags
- Google Fonts (Inter)
- Responsive viewport

### 7. **Git Configuration** ✅
- `.gitignore` for node_modules, dist, env files

---

## 🎨 Design System

### Color Palette
```css
Primary (Blue):
- 50: #f0f9ff
- 500: #0ea5e9 (Main)
- 900: #0c4a6e

Secondary (Purple):
- 50: #faf5ff
- 500: #a855f7 (Main)
- 900: #581c87
```

### Typography
- Font Family: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700, 800

### Components
- Buttons: Primary, Secondary, Outline, Ghost
- Cards: Elevated, Flat, Bordered
- Inputs: Text, Email, Password, File Upload
- Modals: Centered, Full-screen
- Toast Notifications: Success, Error, Info, Warning

---

## 🔌 API Integration

### Base Configuration
```typescript
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoints Structure
```typescript
// lib/api.ts
export const authAPI = {
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  completeProfile: (data: any) => api.post('/auth/complete-profile', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const eventsAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  register: (id: string) => api.post(`/events/${id}/register`),
  getMyRegistrations: () => api.get('/events/my/registrations'),
};

export const paymentsAPI = {
  createOrder: (data: any) => api.post('/payments/create-order', data),
  verify: (data: any) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/user/history'),
};

export const qrAPI = {
  generate: (data: any) => api.post('/qr/generate', data),
  getMyQR: () => api.get('/qr/my-qr'),
  validate: (token: string) => api.post('/qr/validate', { token }),
  scan: (token: string) => api.post('/qr/scan', { token }),
};

export const doctorAPI = {
  createOrder: (data: any) => api.post('/doctors/create-order', data),
  verifyPayment: (data: any) => api.post('/doctors/verify-payment', data),
  getFinanceQR: () => api.get('/doctors/finance/qr'),
};
```

---

## 🔐 Authentication Flow

### 1. Google OAuth Login
```typescript
// components/auth/GoogleLoginButton.tsx
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse: any) => {
    const { data } = await authAPI.googleLogin(credentialResponse.credential);
    localStorage.setItem('token', data.token);
    
    if (!data.profileComplete) {
      navigate('/complete-profile');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast.error('Login failed')}
    />
  );
};
```

### 2. Profile Completion
```typescript
// pages/CompleteProfile.tsx
const CompleteProfile = () => {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = async (data: any) => {
    await authAPI.completeProfile(data);
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} label="Full Name" />
      <Input {...register('phone')} label="Phone" />
      <Input {...register('college_name')} label="College Name" />
      <Button type="submit">Complete Profile</Button>
    </form>
  );
};
```

### 3. Protected Routes
```typescript
// components/auth/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

---

## 💳 Payment Integration (Razorpay)

### Payment Flow
```typescript
// components/payment/RazorpayCheckout.tsx
const RazorpayCheckout = ({ amount, eventId }: Props) => {
  const handlePayment = async () => {
    // 1. Create order
    const { data } = await paymentsAPI.createOrder({ amount, eventId });

    // 2. Initialize Razorpay
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount * 100,
      currency: 'INR',
      order_id: data.orderId,
      handler: async (response: any) => {
        // 3. Verify payment
        await paymentsAPI.verify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
        toast.success('Payment successful!');
        navigate('/my-registrations');
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return <Button onClick={handlePayment}>Pay ₹{amount}</Button>;
};
```

---

## 📱 QR Code System

### QR Display
```typescript
// components/qr/QRDisplay.tsx
import QRCode from 'qrcode.react';

const QRDisplay = ({ token, validDate }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <QRCode value={token} size={256} level="H" />
      <p className="mt-4 text-sm text-gray-600">
        Valid for: {validDate}
      </p>
      <p className="text-xs text-red-600 font-semibold">
        ⚠️ Single use only
      </p>
    </div>
  );
};
```

### QR Scanner (Admin/Gate Staff)
```typescript
// components/qr/QRScanner.tsx
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const handleScan = async (decodedText: string) => {
    const { data } = await qrAPI.scan(decodedText);
    if (data.success) {
      toast.success(`Entry granted for ${data.userName}`);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
    });
    scanner.render(handleScan, console.error);
  }, []);

  return <div id="qr-reader" />;
};
```

---

## 📊 State Management (Zustand)

### Auth Store
```typescript
// store/authStore.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
```

---

## 🎯 Key Pages Implementation

### 1. Home Page
- Hero section with event highlights
- Featured events carousel
- Quick registration CTA
- Statistics (70+ events, participants, etc.)

### 2. Events Page
- Event listing with filters (category, date, price)
- Search functionality
- Event cards with quick view
- Pagination

### 3. Event Details Page
- Full event information
- Registration button
- Participant count
- Event rules and prizes

### 4. My Registrations
- List of registered events
- Payment status
- QR code access
- Download receipt

### 5. Profile Page
- User information
- College ID upload
- Verification status
- Edit profile

### 6. Doctor Portal
- Payment form (name, designation, amount)
- Razorpay integration
- Receipt download
- Finance QR display

### 7. Admin Dashboard
- Overview statistics
- Recent registrations
- Payment summary
- Quick actions

---

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
# Opens on http://localhost:5173
```

### Build
```bash
npm run build
# Output in dist/
```

### Preview Production Build
```bash
npm run preview
```

---

## 📝 Implementation Checklist

### Phase 1: Core Setup ✅
- [x] Project configuration
- [x] Package.json with dependencies
- [x] TypeScript configuration
- [x] Vite configuration
- [x] Tailwind CSS setup
- [x] Environment variables

### Phase 2: Components (To Do)
- [ ] Common components (Button, Input, Card, Modal)
- [ ] Layout components (Header, Footer, Sidebar)
- [ ] Auth components (Google Login, Profile Completion)
- [ ] Event components (Card, List, Details)
- [ ] Payment components (Razorpay integration)
- [ ] QR components (Display, Scanner)

### Phase 3: Pages (To Do)
- [ ] Home page
- [ ] Login page
- [ ] Events listing
- [ ] Event details
- [ ] My registrations
- [ ] Profile page
- [ ] Doctor portal
- [ ] Admin dashboard

### Phase 4: Integration (To Do)
- [ ] API integration
- [ ] State management
- [ ] Authentication flow
- [ ] Payment flow
- [ ] QR code system
- [ ] Error handling
- [ ] Loading states

### Phase 5: Testing & Deployment (To Do)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Production build
- [ ] Deployment

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Clean & Modern**: Minimalist design with focus on content
2. **Responsive**: Mobile-first approach
3. **Accessible**: WCAG 2.1 AA compliance
4. **Fast**: Optimized loading and interactions
5. **Intuitive**: Clear navigation and user flows

### Component Guidelines
- Use consistent spacing (4px grid)
- Follow color palette strictly
- Maintain typography hierarchy
- Add loading states for async operations
- Show error messages clearly
- Provide success feedback

---

## 📦 Dependencies Overview

### Core
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool

### Routing & State
- **React Router DOM**: Client-side routing
- **Zustand**: State management
- **React Query**: Server state management

### Forms & Validation
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### UI & Styling
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library
- **React Hot Toast**: Notifications

### Features
- **Axios**: HTTP client
- **QRCode.react**: QR code generation
- **date-fns**: Date formatting

---

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Auto Rename Tag
- Path Intellisense

### Browser Extensions
- React Developer Tools
- Redux DevTools (for Zustand)

---

## 📞 Support & Resources

**Project Location:** C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/frontend/

**Documentation:**
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- React Query: https://tanstack.com/query
- Zustand: https://github.com/pmndrs/zustand

**Status:** Configuration Complete ✅  
**Next:** Component Implementation 🚀

---

**Last Updated:** June 19, 2026, 12:14 PM IST