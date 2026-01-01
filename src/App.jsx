import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

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

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Dashboard />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Suspense fallback={<AdminLoadingFallback />}><AdminOverview /></Suspense>} />
              <Route path="tools" element={<Suspense fallback={<AdminLoadingFallback />}><AdminTools /></Suspense>} />
              <Route path="tools/:id" element={<Suspense fallback={<AdminLoadingFallback />}><AdminToolForm /></Suspense>} />
              <Route path="tools/new" element={<Suspense fallback={<AdminLoadingFallback />}><AdminToolForm /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<AdminLoadingFallback />}><AdminUsers /></Suspense>} />
              <Route path="credits" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCredits /></Suspense>} />
              <Route path="costs" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCosts /></Suspense>} />
              <Route path="labels" element={<Suspense fallback={<AdminLoadingFallback />}><AdminLabels /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<AdminLoadingFallback />}><AdminReports /></Suspense>} />
              <Route path="analytics/nieuwsbrief" element={<Suspense fallback={<AdminLoadingFallback />}><AdminNewsletterAnalytics /></Suspense>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
