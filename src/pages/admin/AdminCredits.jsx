/**
 * AdminCredits Page
 * 
 * CREDIT MANAGEMENT INTERFACE
 * 
 * Role-aware interface for managing user credits per app.
 * - Supervisor: View & Edit (inline)
 * - Administrator: Read-only
 * 
 * Data Source: apps/{appId}/users/{uid}
 * Mutations: adminAdjustCredits (Cloud Function)
 */

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../../config/appCredits';
import { useTheme } from '../../context/ThemeContext';

export default function AdminCredits() {
    const { isSupervisor, userRole } = useAuth();
    const { isDarkMode } = useTheme();

    // 1. App Selector
    // Filter apps that actually use credits
    const creditApps = getAllAppIds().filter(id => APP_CREDITS_CONFIG[id]?.hasCredits);
    const [selectedAppId, setSelectedAppId] = useState('');

    // 2. User List
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 3. Inline Editing State
    const [editingUserId, setEditingUserId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    // 4. Success Toast State
    const [successUserId, setSuccessUserId] = useState(null);

    const inputRef = useRef(null);

    // Fetch users when app is selected
    useEffect(() => {
        if (!selectedAppId) {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Fetch ALL users for the selected app
                // Path: apps/{appId}/users
                const usersRef = collection(db, 'apps', selectedAppId, 'users');
                // Order by credits desc for utility
                const q = query(usersRef); // removed orderBy('credits', 'desc') to avoid potential index errors if index missing

                const snapshot = await getDocs(q);

                const fetchedUsers = snapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));

                // Sort client-side to be safe
                fetchedUsers.sort((a, b) => (b.credits || 0) - (a.credits || 0));

                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("Fout bij ophalen gebruikers. Controleer je rechten.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [selectedAppId, refreshTrigger]);

    // Focus input when editing starts
    useEffect(() => {
        if (editingUserId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingUserId]);

    // Handle Edit Click
    const handleEditClick = (user) => {
        if (!isSupervisor) return;
        setEditingUserId(user.uid);
        setEditValue(String(user.credits || 0));
    };

    // Handle Cancel
    const handleCancel = () => {
        setEditingUserId(null);
        setEditValue('');
        setSaving(false);
    };

    // Handle Save
    const handleSave = async (user) => {
        const newValue = parseInt(editValue, 10);
        const oldValue = user.credits || 0;

        if (isNaN(newValue)) return;
        if (newValue === oldValue) {
            handleCancel();
            return;
        }

        setSaving(true);
        // Delta logic removed; sending absolute value

        try {
            const adminAdjustCredits = httpsCallable(functions, 'adminAdjustCredits');

            // Call Cloud Function to update credits with absolute value
            await adminAdjustCredits({
                appId: selectedAppId,
                uid: user.uid,
                credits: newValue
            });

            // Success
            setRefreshTrigger(prev => prev + 1); // Trigger refetch
            setSuccessUserId(user.uid);
            handleCancel();

        } catch (error) {
            console.error("Error updating credits:", error);
            alert(`Fout bij updaten: ${error.message}`);
            setSaving(false);
        }
    };

    // Handle Key Press (Enter/Esc)
    const handleKeyDown = (e, user) => {
        if (e.key === 'Enter') {
            handleSave(user);
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Credit Management</h2>
                <p className="text-secondary mt-1">
                    Beheer gebruikerscredits per applicatie.
                </p>
                {/* Role Indicator */}
                <div className="mt-2 text-xs">
                    Rol: <span className={`font-semibold ${isSupervisor ? 'text-purple-600' : 'text-blue-600'}`}>
                        {isSupervisor ? 'Supervisor (Read/Write)' : 'Administrator (Read-Only)'}
                    </span>
                </div>
            </div>

            {/* 1. App Selector */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <label className="block text-sm font-medium mb-2">Selecteer App</label>
                <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 rounded-lg border border-theme bg-[var(--input-bg)] focus:ring-2 focus:ring-[#2860E0] outline-none transition-all"
                    style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                >
                    <option value="">-- Kies een app --</option>
                    {creditApps.map(appId => (
                        <option key={appId} value={appId}>
                            {APP_CREDITS_CONFIG[appId].appName}
                        </option>
                    ))}
                </select>
                {!selectedAppId && (
                    <p className="text-sm text-secondary mt-2">
                        Selecteer een app om gebruikers en credits te laden.
                    </p>
                )}
            </div>

            {/* 2. User List */}
            {selectedAppId && (
                <div className="bg-card rounded-xl border border-theme overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                                sync
                            </span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
                            <p>Geen gebruikers gevonden voor deze app.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#2860E0]/5 text-xs uppercase text-secondary font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Naam</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4 text-right">Credits</th>
                                        {isSupervisor && <th className="px-6 py-4 w-12"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme">
                                    {users.map(user => (
                                        <tr key={user.uid} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                                            {/* Name */}
                                            <td className="px-6 py-4 font-medium text-primary">
                                                {user.displayName || 'Naamloos'}
                                            </td>

                                            {/* Email */}
                                            <td className="px-6 py-4 text-sm text-secondary">
                                                {user.email || 'Geen email'}
                                            </td>

                                            {/* Credits (Editable for Supervisor) */}
                                            <td className="px-6 py-4 text-right relative">
                                                {editingUserId === user.uid ? (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 bg-card border border-theme shadow-xl rounded-lg p-1 animate-in zoom-in-95 duration-200">
                                                        <input
                                                            ref={inputRef}
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, user)}
                                                            className="w-20 px-2 py-1 text-right bg-[var(--input-bg)] rounded border border-theme outline-none focus:border-[#2860E0]"
                                                            disabled={saving}
                                                        />
                                                        <button
                                                            onClick={() => handleSave(user)}
                                                            disabled={saving}
                                                            className="p-1 hover:bg-green-500/10 text-green-500 rounded transition-colors"
                                                            title="Opslaan"
                                                        >
                                                            {saving ? (
                                                                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-lg">check</span>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            disabled={saving}
                                                            className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                                                            title="Annuleren"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">close</span>
                                                        </button>
                                                    </div>
                                                ) : (successUserId && successUserId === user.uid) ? (
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg animate-in fade-in zoom-in-95 duration-300">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        <span className="text-xs font-bold">Opgeslagen</span>
                                                    </div>
                                                ) : (
                                                    <div className="font-mono font-medium text-lg">
                                                        {typeof user.credits === 'number' ? user.credits : '-'}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Edit Action (Supervisor Only) */}
                                            {isSupervisor && (
                                                <td className="px-6 py-4 text-right">
                                                    {editingUserId !== user.uid && (
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="text-secondary hover:text-[#2860E0] p-1 rounded hover:bg-[#2860E0]/10 transition-colors"
                                                            title="Bewerk credits"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

