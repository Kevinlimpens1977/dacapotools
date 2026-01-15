import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LoginLanding from './components/LoginLanding';

// Admin Layout (loaded immediately as it's the wrapper)
import AdminLayout from './components/admin/AdminLayout';

// Lazy-loaded Admin Pages (code-split for smaller main bundle)
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminTools = lazy(() => import('./pages/admin/AdminTools'));
const AdminToolForm = lazy(() => import('./pages/admin/AdminToolForm'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCredits = lazy(() => import('./pages/admin/AdminCredits'));
const AdminCosts = lazy(() => import('./pages/admin/AdminCosts'));
const AdminLabels = lazy(() => import('./pages/admin/AdminLabels'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminNewsletterAnalytics = lazy(() => import('./pages/admin/AdminNewsletterAnalytics'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));

// Loading fallback component
function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
        sync
      </span>
    </div>
  );
}

/**
 * AuthGate - GLOBAL ROUTE PROTECTION
 * 
 * SECURITY: This component enforces authentication at the route level.
 * - If auth is loading → show spinner
 * - If user is NOT authenticated → show login screen (NOT modal)
 * - If user IS authenticated → render children (app)
 * 
 * This prevents ANY access to internal routes without authentication.
 */
function AuthGate({ children }) {
  const { user, loading } = useAuth();

  // Auth state is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="size-16 bg-[#2860E0] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">
            DC
          </div>
          <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
            sync
          </span>
          <p className="text-secondary mt-2 text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  // User is NOT authenticated → show login screen
  if (!user) {
    return <LoginLanding />;
  }

  // User IS authenticated → render app
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <Routes>
              {/* All Routes - Now Protected by AuthGate */}
              <Route path="/" element={<Dashboard />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Suspense fallback={<AdminLoadingFallback />}><AdminOverview /></Suspense>} />
                <Route path="tools" element={<Suspense fallback={<AdminLoadingFallback />}><AdminTools /></Suspense>} />
                <Route path="tools/:id" element={<Suspense fallback={<AdminLoadingFallback />}><AdminToolForm /></Suspense>} />
                <Route path="tools/new" element={<Suspense fallback={<AdminLoadingFallback />}><AdminToolForm /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<AdminLoadingFallback />}><AdminUsers /></Suspense>} />
                <Route path="users/:userId" element={<Suspense fallback={<AdminLoadingFallback />}><AdminUserDetail /></Suspense>} />
                <Route path="credits" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCredits /></Suspense>} />
                <Route path="costs" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCosts /></Suspense>} />
                <Route path="labels" element={<Suspense fallback={<AdminLoadingFallback />}><AdminLabels /></Suspense>} />
                <Route path="reports" element={<Suspense fallback={<AdminLoadingFallback />}><AdminReports /></Suspense>} />
                <Route path="newsletter-analytics" element={<Suspense fallback={<AdminLoadingFallback />}><AdminNewsletterAnalytics /></Suspense>} />
              </Route>
            </Routes>
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

