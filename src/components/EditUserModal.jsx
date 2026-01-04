import { useState, useEffect } from 'react';
import { ROLES } from '../config/roles';

export default function EditUserModal({ user, onClose, onSave }) {
    const [newsletterRole, setNewsletterRole] = useState('none');
    const [gastenRole, setGastenRole] = useState('none');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            // STRICT: Source of truth is appRoles.nieuwsbriefgenerator
            // Do NOT use user.newsletterRole or other derived props here
            setNewsletterRole(user.appRoles?.nieuwsbriefgenerator ?? 'none');
            setGastenRole(user.appRoles?.gastenregistratie ?? 'none');
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // STRICT: Explicit payload structure
            await onSave({
                appRoles: {
                    nieuwsbriefgenerator: newsletterRole === 'none' ? undefined : 'administrator',
                    gastenregistratie: gastenRole === 'none' ? undefined : 'administrator'
                }
            });
            onClose();
        } catch (error) {
            console.error('Error saving user roles:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Gebruiker bewerken</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined transform rotate-45">add</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {user.email}
                        </div>
                    </div>

                    {/* Global Role - Read Only */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Global Role</label>
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            {user.role === ROLES.SUPERVISOR ? (
                                <span className="material-symbols-outlined text-purple-500 text-sm">shield_person</span>
                            ) : (
                                <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                            )}
                            <span className="capitalize">{user.role || 'User'}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            De globale rol kan niet hier gewijzigd worden.
                        </p>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    {/* App Roles */}
                    <div>
                        <h4 className="font-medium mb-4">App Rollen</h4>

                        {/* Nieuwsbrief Generator */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Nieuwsbrief Generator</label>
                            <select
                                value={newsletterRole}
                                onChange={(e) => setNewsletterRole(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            >
                                <option value="none">Geen toegang (Gebruiker)</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </div>

                        {/* Gastenregistratie */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Gastenregistratie</label>
                            <select
                                value={gastenRole}
                                onChange={(e) => setGastenRole(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            >
                                <option value="none">Geen toegang (Gebruiker)</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors font-medium"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-[#2860E0] hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                        {saving && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                        Opslaan
                    </button>
                </div>
            </div>
        </div>
    );
}
