import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Material-UI Theme Imports
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Authentication & Layout
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Layout from './components/Layout';
import authService from './api/authService';

// Core Feature Pages
import DashboardPage from './pages/DashboardPage';
import CasesListPage from './pages/CasesListPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import CaseCreateEditPage from './pages/CaseCreateEditPage';
import ClientDirectoryPage from './pages/ClientDirectoryPage';
import ClientCreateEditPage from './pages/ClientCreateEditPage';
import ClientDetailsPage from './pages/ClientDetailsPage';
import DocumentsPage from './pages/DocumentsPage';
import CalendarPage from './pages/CalendarPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import AiLookupPage from './pages/AiLookupPage';
import UserManagementPage from './pages/UserManagementPage';

// Fallback
const NotFoundPage = () => <div style={{ padding: '20px' }}><h2>404 - Page Not Found</h2></div>;

// LEGAL CASE MANAGEMENT CUSTOM THEME - Updated with your color palette
const legalTheme = createTheme({
    palette: {
        mode: 'light',
        // Primary Color: Navy Blue from your palette
        primary: {
            main: '#113167',
            light: '#1D4A8F',
            dark: '#0A234A',
            contrastText: '#FFFFFF',
        },
        // Secondary Color: Teal from your palette
        secondary: {
            main: '#02807E',
            light: '#33A09E',
            dark: '#015958',
            contrastText: '#FFFFFF',
        },
        // Error Color: Critical Action, Danger
        error: {
            main: '#CC0000',
        },
        // Success Color: Resolution, Completion
        success: {
            main: '#38761D',
        },
        // Background Color: Clean, Professional Canvas
        background: {
            default: '#f7f8fa',
            paper: '#FFFFFF',
        },
        // Text Color: High contrast for readability
        text: {
            primary: '#333333',
            secondary: '#6B7280',
        },
        // Divider color
        divider: '#E0E0E0',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: 13, // Reduced from default 14px - this scales everything down
        h1: {
            fontFamily: '"Playfair Display", serif',
            fontSize: '2.75rem',   // ~44px
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#1a1a1a',
          },
          h2: {
            fontFamily: '"Playfair Display", serif',
            fontSize: '2rem',      // ~32px
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#1a1a1a',
          },
          h3: {
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.75rem',   // ~28px
            fontWeight: 500,
            color: '#1a1a1a',
          },
          h4: {
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.5rem',    // ~24px
            fontWeight: 500,
            color: '#113167',
          },
        body1: {
            fontSize: '0.875rem', // ~14px for main text
            letterSpacing: '0.01em',
        },
        body2: {
            fontSize: '0.8125rem', // ~13px for secondary text
        },
        caption: {
            fontSize: '0.75rem', // ~12px for captions
        },
        button: {
            fontSize: '0.875rem', // ~14px for buttons
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    '&.Mui-checked': {
                        color: '#113167',
                    },
                },
            },
        },
    }
});

// Helper Components
const PrivateRoutes = () => {
  const currentUser = authService.getCurrentUser();
  const token = localStorage.getItem('token');
  let isTokenValid = false;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      isTokenValid = decodedToken.exp >= currentTime;
    } catch (error) {
      isTokenValid = false;
    }
  }

  if (!currentUser || !isTokenValid) {
     if (token || currentUser) {
        console.log("Private route access denied or token invalid, logging out.");
        authService.logout();
     }
     return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

const AdminRoutes = ({ children }) => {
    const currentUser = authService.getCurrentUser();
    const isAdminOrPartner = currentUser && ['admin', 'partner'].includes(currentUser.role);
    return isAdminOrPartner ? children : <Navigate to="/dashboard" replace />;
};

// Main Application Router
function App() {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicAuthPaths = ['/login', '/register', '/forgot-password'];
    const isResetPasswordPath = location.pathname.startsWith('/reset-password/');

    if (token && !publicAuthPaths.includes(location.pathname) && !isResetPasswordPath) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.log("Token expired during session, logging out.");
          authService.logout();
          window.location.href = '/login';
        }
      } catch (error) {
        console.error("Invalid token found during session, logging out.", error);
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, [location.pathname]);

  return (
    // Wrap the entire application with ThemeProvider
    <ThemeProvider theme={legalTheme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Private Routes */}
        <Route element={<PrivateRoutes />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesListPage />} />
          <Route path="/cases/new" element={<CaseCreateEditPage />} />
          <Route path="/cases/:id" element={<CaseDetailsPage />} />
          <Route path="/cases/edit/:id" element={<CaseCreateEditPage />} />
          <Route path="/clients" element={<ClientDirectoryPage />} />
          <Route path="/clients/new" element={<ClientCreateEditPage />} />
          <Route path="/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/clients/edit/:id" element={<ClientCreateEditPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ai-lookup" element={<AiLookupPage />} />
          <Route path="/admin/users" element={<AdminRoutes><UserManagementPage /></AdminRoutes>} />
        </Route>

        {/* General Catch-all for non-matching paths */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;