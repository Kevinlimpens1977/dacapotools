import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

// Admin Layout and Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTools from './pages/admin/AdminTools';
import AdminToolForm from './pages/admin/AdminToolForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCredits from './pages/admin/AdminCredits';
import AdminCosts from './pages/admin/AdminCosts';
import AdminLabels from './pages/admin/AdminLabels';
import AdminReports from './pages/admin/AdminReports';
import AdminNewsletterAnalytics from './pages/admin/AdminNewsletterAnalytics';

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
              <Route index element={<AdminOverview />} />
              <Route path="tools" element={<AdminTools />} />
              <Route path="tools/:id" element={<AdminToolForm />} />
              <Route path="tools/new" element={<AdminToolForm />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="credits" element={<AdminCredits />} />
              <Route path="costs" element={<AdminCosts />} />
              <Route path="labels" element={<AdminLabels />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="analytics/nieuwsbrief" element={<AdminNewsletterAnalytics />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
