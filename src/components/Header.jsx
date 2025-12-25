import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';

export default function Header({ onSearchClick }) {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, userData, isAdmin, signOut } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-theme shadow-sm transition-colors duration-200">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo & Title */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-9 bg-[#2860E0] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                            DC
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">DaCapo Tools</h1>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <button
                            onClick={onSearchClick}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                            aria-label="Zoeken"
                        >
                            <span className="material-symbols-outlined">search</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                            aria-label={isDarkMode ? 'Schakel naar light mode' : 'Schakel naar dark mode'}
                        >
                            <span className="material-symbols-outlined">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {/* Admin Actions (if admin) */}
                        {isAdmin && (
                            <div className="relative group">
                                <button
                                    className="flex items-center justify-center size-10 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                                    aria-label="Admin Menu"
                                >
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                </button>
                                {/* Admin Dropdown */}
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-theme rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-2 border-b border-theme">
                                        <p className="text-xs font-semibold text-secondary uppercase tracking-wide px-2">Admin Acties</p>
                                    </div>
                                    <div className="p-1">
                                        <Link
                                            to="/admin/tool/new"
                                            className="w-full px-3 py-2 text-left hover:bg-gray-500/10 transition-colors flex items-center gap-3 rounded-md"
                                        >
                                            <span className="material-symbols-outlined text-green-500">add_circle</span>
                                            <span>Tool Toevoegen</span>
                                        </Link>
                                        <Link
                                            to="/admin"
                                            className="w-full px-3 py-2 text-left hover:bg-gray-500/10 transition-colors flex items-center gap-3 rounded-md"
                                        >
                                            <span className="material-symbols-outlined text-blue-500">apps</span>
                                            <span>Alle Tools Beheren</span>
                                        </Link>
                                        <Link
                                            to="/admin/labels"
                                            className="w-full px-3 py-2 text-left hover:bg-gray-500/10 transition-colors flex items-center gap-3 rounded-md"
                                        >
                                            <span className="material-symbols-outlined text-purple-500">label</span>
                                            <span>Labels Beheren</span>
                                        </Link>
                                        <Link
                                            to="/admin/stats"
                                            className="w-full px-3 py-2 text-left hover:bg-gray-500/10 transition-colors flex items-center gap-3 rounded-md"
                                        >
                                            <span className="material-symbols-outlined text-orange-500">analytics</span>
                                            <span>Statistieken</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Profile / Login */}
                        {user ? (
                            <div className="relative group">
                                <button className="size-9 rounded-full bg-[#2860E0] flex items-center justify-center text-white font-semibold text-sm border border-theme shadow-sm overflow-hidden">
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || 'Profiel'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {(userData?.displayName || user.email || '?').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-theme rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-3 border-b border-theme">
                                        <p className="font-medium truncate">
                                            {userData?.displayName || user.displayName || user.email?.split('@')[0]}
                                        </p>
                                        <p className="text-sm text-secondary truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-xl">logout</span>
                                        Uitloggen
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="flex items-center justify-center size-9 rounded-full bg-[#2860E0] text-white hover:bg-[#1C4DAB] transition-colors shadow-sm"
                                aria-label="Inloggen"
                            >
                                <span className="material-symbols-outlined text-xl">login</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}
