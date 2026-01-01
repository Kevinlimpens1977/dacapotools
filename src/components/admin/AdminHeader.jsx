/**
 * AdminHeader Component
 * 
 * Header for admin dashboard pages.
 * Shows page title and theme toggle.
 */

import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// Map paths to page titles
const pageTitles = {
    '/admin': 'Overzicht',
    '/admin/tools': 'Tools',
    '/admin/tools/new': 'Nieuwe Tool',
    '/admin/users': 'Gebruikers',
    '/admin/credits': 'Credits',
    '/admin/costs': 'Kosten',
    '/admin/labels': 'Labels & Metadata',
    '/admin/reports': 'Rapportages'
};

export default function AdminHeader() {
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();

    // Get current page title
    const getPageTitle = () => {
        // Check for exact match first
        if (pageTitles[location.pathname]) {
            return pageTitles[location.pathname];
        }

        // Check for tool edit page
        if (location.pathname.startsWith('/admin/tools/')) {
            return 'Tool Bewerken';
        }

        return 'Admin Dashboard';
    };

    return (
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-theme">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Title */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Terug naar App"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">{getPageTitle()}</h1>
                        <p className="text-xs text-secondary">Admin Dashboard</p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label={isDarkMode ? 'Schakel naar light mode' : 'Schakel naar dark mode'}
                    >
                        <span className="material-symbols-outlined">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
