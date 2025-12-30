/**
 * AdminLayout Component
 * 
 * Wrapper component for all admin pages providing:
 * - Route protection (redirects users with role === 'user')
 * - Persistent sidebar navigation
 * - Admin header
 * - Content area with Outlet for nested routes
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
    const { user, userRole, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                        sync
                    </span>
                    <p className="mt-2 text-secondary">Laden...</p>
                </div>
            </div>
        );
    }

    // Redirect if not logged in
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Redirect if user role (not admin or supervisor)
    if (userRole === 'user') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md px-4">
                    <span className="material-symbols-outlined text-6xl text-red-500">
                        block
                    </span>
                    <h1 className="text-2xl font-bold mt-4">Geen toegang</h1>
                    <p className="text-secondary mt-2">
                        Je hebt geen rechten om het admin dashboard te bekijken.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">home</span>
                        Terug naar home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <AdminHeader />

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
