import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminToolForm from './pages/AdminToolForm';
import AdminLabels from './pages/AdminLabels';
import AdminStats from './pages/AdminStats';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tool/:id" element={<AdminToolForm />} />
            <Route path="/admin/tool/new" element={<AdminToolForm />} />
            <Route path="/admin/labels" element={<AdminLabels />} />
            <Route path="/admin/stats" element={<AdminStats />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
