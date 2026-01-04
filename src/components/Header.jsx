import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';

export default function Header({ labels, selectedLabels, onToggleLabel, searchQuery, onSearchChange }) {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, userData, userRole, signOut } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const scrollContainerRef = useRef(null);

    const handleClear = () => onToggleLabel(null);
    const hasActiveFilters = selectedLabels?.length > 0;

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-theme shadow-sm transition-colors duration-200">
                <div className="flex items-center justify-between px-4 py-2 gap-4">
                    {/* Logo & Title */}
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <div className="size-9 bg-[#2860E0] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                            DC
                        </div>
                        <h1 className="text-lg font-bold tracking-tight hidden sm:block">DaCapo Tools</h1>
                    </Link>

                    {/* CENTER: Filter Bar in container with blue border */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border-[1.5px] border-[#2860E0] bg-[var(--bg-surface)]/50">
                            {/* FILTER OP Label */}
                            <div className="shrink-0 h-9 px-3 flex items-center justify-center rounded bg-[var(--bg-surface)] border border-theme text-[13px] font-bold text-secondary uppercase tracking-wide">
                                Filter op
                            </div>

                            {/* Scrollable Labels */}
                            <div
                                ref={scrollContainerRef}
                                className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar min-w-[200px]"
                            >
                                {labels?.map((label) => {
                                    const isSelected = selectedLabels?.includes(label.id);
                                    return (
                                        <button
                                            key={label.id}
                                            onClick={() => onToggleLabel(label.id)}
                                            className={`shrink-0 h-9 px-3 flex items-center gap-1 rounded-full text-[15px] font-medium transition-all select-none ${isSelected
                                                ? 'text-white shadow-sm'
                                                : 'bg-transparent text-secondary hover:bg-[var(--bg-surface-hover)]'
                                                }`}
                                            style={isSelected ? { backgroundColor: label.color } : {}}
                                        >
                                            {label.icon && (
                                                <span
                                                    className="material-symbols-outlined text-[18px]"
                                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                                >
                                                    {label.icon}
                                                </span>
                                            )}
                                            <span className="whitespace-nowrap">{label.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* DIVIDER */}
                            <div className="h-6 w-px bg-[var(--border-default)] shrink-0 opacity-40" />

                            {/* Controls Group: Search + Sort + Trash */}
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Search */}
                                <div className="flex items-center w-40 shrink-0 mr-1">
                                    <div className="relative w-full">
                                        <span className="material-symbols-outlined text-[20px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => onSearchChange(e.target.value)}
                                            placeholder="Zoeken..."
                                            className="w-full h-9 text-[15px] pl-10 pr-3 bg-[var(--bg-surface)] border border-theme rounded-full focus:ring-1 focus:ring-[var(--primary)] outline-none text-secondary placeholder:text-secondary/50"
                                        />
                                    </div>
                                </div>

                                {/* Sort Button */}
                                <button
                                    className="shrink-0 size-9 flex items-center justify-center rounded-full text-secondary hover:bg-[var(--bg-surface-hover)] transition-colors"
                                    title="Sorteren"
                                >
                                    <span className="material-symbols-outlined text-[24px]">sort</span>
                                </button>

                                {/* Clear Button (Trash) */}
                                <button
                                    onClick={hasActiveFilters ? handleClear : undefined}
                                    className={`shrink-0 size-9 flex items-center justify-center rounded-full transition-colors ${hasActiveFilters
                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer'
                                        : 'text-secondary cursor-default'
                                        }`}
                                    title={hasActiveFilters ? "Wis alle filters" : "Geen actieve filters"}
                                    disabled={!hasActiveFilters}
                                >
                                    <span className="material-symbols-outlined text-[24px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center size-9 rounded-full hover:bg-[var(--bg-surface-hover)] transition-colors"
                            aria-label={isDarkMode ? 'Schakel naar light mode' : 'Schakel naar dark mode'}
                        >
                            <span className="material-symbols-outlined">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {/* Admin Button (visible for admin/supervisor only) */}
                        {userRole && userRole !== 'user' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors font-bold"
                                aria-label="Admin Dashboard"
                            >
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                                <span>ADMIN</span>
                            </Link>
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
                                <div className="absolute right-0 mt-2 w-48 max-w-[90vw] bg-card border border-theme rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                    <div className="p-3 border-b border-theme">
                                        <p className="font-medium truncate">
                                            {userData?.displayName || user.displayName || user.email?.split('@')[0]}
                                        </p>
                                        <p className="text-sm text-secondary truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="w-full px-3 py-2 text-left hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center gap-2"
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
