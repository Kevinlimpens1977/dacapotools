/**
 * AdminSidebar Component
 * 
 * Persistent sidebar navigation for admin dashboard.
 * Role-aware: shows different actions for supervisor vs admin.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    {
        label: 'Overzicht',
        path: '/admin',
        icon: 'dashboard',
        end: true // Only match exact path
    },
    {
        label: 'Tools',
        path: '/admin/tools',
        icon: 'construction'
    },
    {
        label: 'Gebruikers',
        path: '/admin/users',
        icon: 'group'
    },
    {
        label: 'Credits',
        path: '/admin/credits',
        icon: 'payments'
    },
    {
        label: 'Kosten',
        path: '/admin/costs',
        icon: 'euro'
    },
    {
        label: 'Labels & Metadata',
        path: '/admin/labels',
        icon: 'label'
    },
    {
        label: 'Rapportages',
        path: '/admin/reports',
        icon: 'description'
    }
];

export default function AdminSidebar() {
    const { userRole, isSupervisor, userData } = useAuth();

    return (
        <aside className="w-48 md:w-64 bg-card border-r border-theme flex flex-col shrink-0 hidden sm:flex">
            {/* Logo / Title */}
            <div className="p-4 border-b border-theme">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Admin</h1>
                        <p className="text-xs text-secondary">DaCapo Tools</p>
                    </div>
                </div>
            </div>

            {/* Role Badge */}
            <div className="px-4 py-3 border-b border-theme">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isSupervisor
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                        {isSupervisor ? 'shield_person' : 'verified_user'}
                    </span>
                    {isSupervisor ? 'Supervisor' : 'Admin'}
                </div>
                {!isSupervisor && (
                    <p className="text-xs text-secondary mt-2">
                        Alleen-lezen toegang
                    </p>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                            ${isActive
                                ? 'bg-[#2860E0] text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-theme">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-[#2860E0] flex items-center justify-center text-white text-sm font-medium">
                        {(userData?.displayName || userData?.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {userData?.displayName || 'Gebruiker'}
                        </p>
                        <p className="text-xs text-secondary truncate">
                            {userData?.email}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
