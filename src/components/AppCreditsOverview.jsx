/**
 * AppCreditsOverview Component
 * 
 * Admin/Supervisor view of user credits per app.
 * Shows table with user info and credit usage.
 * Supervisors can edit credits and limits.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsersCredits, modifyCredits } from '../services/CreditService';
import { getAppConfig, getAllAppIds } from '../config/appCredits';
import { ROLES } from '../config/roles';

/**
 * Overview of all users' credits for admin/supervisor
 * @param {object} props
 * @param {string} props.appId - App ID to show (optional, shows selector if not provided)
 */
export default function AppCreditsOverview({ appId: initialAppId }) {
    const { userRole, isSupervisor } = useAuth();
    const [selectedAppId, setSelectedAppId] = useState(initialAppId || getAllAppIds()[0]);
    const [usersCredits, setUsersCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ creditsRemaining: 0, monthlyLimit: 0 });
    const [saving, setSaving] = useState(false);

    const appConfig = getAppConfig(selectedAppId);
    const allAppIds = getAllAppIds();

    // Fetch users credits
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllUsersCredits(selectedAppId);
                setUsersCredits(data);
            } catch (err) {
                console.error('[AppCreditsOverview] Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (selectedAppId) {
            fetchData();
        }
    }, [selectedAppId]);

    // Start editing a user's credits
    const handleStartEdit = (userCredit) => {
        setEditingUser(userCredit.uid);
        setEditForm({
            creditsRemaining: userCredit.creditsRemaining,
            monthlyLimit: userCredit.monthlyLimit
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({ creditsRemaining: 0, monthlyLimit: 0 });
    };

    // Save edited credits
    const handleSaveEdit = async (uid) => {
        try {
            setSaving(true);
            await modifyCredits(uid, selectedAppId, editForm);

            // Update local state
            setUsersCredits(prev => prev.map(uc =>
                uc.uid === uid
                    ? { ...uc, ...editForm }
                    : uc
            ));

            setEditingUser(null);
        } catch (err) {
            console.error('[AppCreditsOverview] Save error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Calculate totals
    const totalCreditsUsed = usersCredits.reduce((sum, uc) => sum + (uc.totalUsedThisMonth || 0), 0);
    const totalCreditsRemaining = usersCredits.reduce((sum, uc) => sum + (uc.creditsRemaining || 0), 0);

    return (
        <div className="space-y-4">
            {/* App Selector */}
            {!initialAppId && allAppIds.length > 1 && (
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">App:</label>
                    <select
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-theme bg-card focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                    >
                        {allAppIds.map(id => {
                            const config = getAppConfig(id);
                            return (
                                <option key={id} value={id}>
                                    {config?.appName || id}
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-lg border border-theme p-4">
                    <p className="text-secondary text-sm">Gebruikers</p>
                    <p className="text-2xl font-bold mt-1">{usersCredits.length}</p>
                </div>
                <div className="bg-card rounded-lg border border-theme p-4">
                    <p className="text-secondary text-sm">Totaal Gebruikt</p>
                    <p className="text-2xl font-bold mt-1">{totalCreditsUsed}</p>
                    <p className="text-xs text-secondary">{appConfig?.creditUnitPlural}</p>
                </div>
                <div className="bg-card rounded-lg border border-theme p-4">
                    <p className="text-secondary text-sm">Totaal Resterend</p>
                    <p className="text-2xl font-bold mt-1">{totalCreditsRemaining}</p>
                    <p className="text-xs text-secondary">{appConfig?.creditUnitPlural}</p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-card rounded-lg border border-theme overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-theme">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Gebruiker</th>
                            <th className="text-center px-4 py-3 font-semibold">Resterend</th>
                            <th className="text-center px-4 py-3 font-semibold">Limiet</th>
                            <th className="text-center px-4 py-3 font-semibold">Gebruikt</th>
                            {isSupervisor && (
                                <th className="text-right px-4 py-3 font-semibold">Acties</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={isSupervisor ? 5 : 4} className="px-4 py-8 text-center">
                                    <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                                </td>
                            </tr>
                        ) : usersCredits.length === 0 ? (
                            <tr>
                                <td colSpan={isSupervisor ? 5 : 4} className="px-4 py-8 text-center text-secondary">
                                    Geen gebruikers met credits voor deze app
                                </td>
                            </tr>
                        ) : (
                            usersCredits.map((uc) => (
                                <tr key={uc.uid} className="border-b border-theme last:border-0 hover:bg-gray-500/5">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{uc.displayName || 'Onbekend'}</p>
                                            <p className="text-sm text-secondary">{uc.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {editingUser === uc.uid ? (
                                            <input
                                                type="number"
                                                value={editForm.creditsRemaining}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    creditsRemaining: parseInt(e.target.value) || 0
                                                }))}
                                                className="w-20 h-8 px-2 text-center rounded border border-theme bg-gray-100 dark:bg-gray-700"
                                                min="0"
                                            />
                                        ) : (
                                            <span className={uc.creditsRemaining <= 0 ? 'text-red-500 font-medium' : ''}>
                                                {uc.creditsRemaining}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {editingUser === uc.uid ? (
                                            <input
                                                type="number"
                                                value={editForm.monthlyLimit}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    monthlyLimit: parseInt(e.target.value) || 1
                                                }))}
                                                className="w-20 h-8 px-2 text-center rounded border border-theme bg-gray-100 dark:bg-gray-700"
                                                min="1"
                                            />
                                        ) : (
                                            uc.monthlyLimit
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-secondary">
                                        {uc.totalUsedThisMonth || 0}
                                    </td>
                                    {isSupervisor && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingUser === uc.uid ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(uc.uid)}
                                                            disabled={saving}
                                                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                                                            title="Opslaan"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">
                                                                {saving ? 'sync' : 'check'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={saving}
                                                            className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                                                            title="Annuleren"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartEdit(uc)}
                                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                                                        title="Bewerken"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
