/**
 * AdminUserDetail Page
 * 
 * Detail page for managing a specific user's app settings.
 * Supervisor-only access.
 * 
 * Data model: users/{uid}/apps/{appId} { role, creditsRemaining?, totalGenerations? }
 * 
 * Rules:
 * - Global role (users/{uid}.role) is READ-ONLY
 * - App roles can be changed (user/administrator)  
 * - Credits can only be modified via Cloud Function (adminAdjustCredits)
 * - Direct Firestore writes for credits are PROHIBITED
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { APP_CREDITS_CONFIG } from '../../config/appCredits';

export default function AdminUserDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { isSupervisor } = useAuth();

    // States
    const [userData, setUserData] = useState(null);
    const [appSettings, setAppSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({}); // Map of appId -> boolean
    const [saveSuccess, setSaveSuccess] = useState({}); // Map of appId -> boolean

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ appId: '', amount: 10, reason: '' });
    const [modalLoading, setModalLoading] = useState(false);

    // Fetch user and app settings
    const fetchData = async () => {
        if (!userId) return;

        try {
            // 1. Fetch Basic User Data
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setUserData({ id: userSnap.id, ...userSnap.data() });
            } else {
                console.error('User not found');
                navigate('/admin/users');
                return;
            }

            // 2. Fetch App Settings per app from central config
            const appIds = Object.keys(APP_CREDITS_CONFIG);
            const settings = {};
            for (const appId of appIds) {
                const appRef = doc(db, 'users', userId, 'apps', appId);
                const appSnap = await getDoc(appRef);

                if (appSnap.exists()) {
                    settings[appId] = appSnap.data();
                } else {
                    settings[appId] = null; // Mark as not existing yet
                }
            }
            setAppSettings(settings);

        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId, navigate]);

    // Handle form changes for apps
    const handleAppChange = (appId, field, value) => {
        setAppSettings(prev => ({
            ...prev,
            [appId]: {
                ...(prev[appId] || {}),
                [field]: value
            }
        }));
        // Clear success state when user makes changes
        setSaveSuccess(prev => ({ ...prev, [appId]: false }));
    };

    // Save specific app settings (Roles ONLY)
    const handleSaveApp = async (appId) => {
        setSaving(prev => ({ ...prev, [appId]: true }));
        setSaveSuccess(prev => ({ ...prev, [appId]: false }));

        try {
            const appRef = doc(db, 'users', userId, 'apps', appId);
            const currentSettings = appSettings[appId] || {};

            // Build payload - only include allowed fields
            // SECURITY: Credits are explicitly EXCLUDED from this write
            const payload = {
                role: currentSettings.role || 'user'
            };

            // Write to users/{uid}/apps/{appId} with merge
            await setDoc(appRef, payload, { merge: true });

            // Re-fetch to sync state
            const updatedSnap = await getDoc(appRef);
            setAppSettings(prev => ({
                ...prev,
                [appId]: updatedSnap.data()
            }));

            setSaveSuccess(prev => ({ ...prev, [appId]: true }));

            // Clear success after 3 seconds
            setTimeout(() => {
                setSaveSuccess(prev => ({ ...prev, [appId]: false }));
            }, 3000);

        } catch (error) {
            console.error(`Error saving ${appId}:`, error);
            alert('Er is een fout opgetreden bij het opslaan.');
        } finally {
            setSaving(prev => ({ ...prev, [appId]: false }));
        }
    };

    // Open Credit Adjustment Modal
    const openCreditModal = (appId) => {
        setModalData({ appId, amount: 10, reason: '' });
        setModalOpen(true);
    };

    // Submit Credit Adjustment
    const handleSubmitCredits = async (e) => {
        e.preventDefault();
        setModalLoading(true);

        try {
            const adminAdjustCredits = httpsCallable(functions, 'adminAdjustCredits');

            const result = await adminAdjustCredits({
                targetUserId: userId,
                appId: modalData.appId,
                amount: parseInt(modalData.amount, 10),
                reason: modalData.reason
            });

            if (result.data.success) {
                // Close modal
                setModalOpen(false);
                // Refresh data to show new credits
                await fetchData();
                alert(`Succesvol ${result.data.delta} credits toegevoegd.`);
            }
        } catch (error) {
            console.error('Error adjusting credits:', error);
            alert(`Fout bij toevoegen credits: ${error.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                    sync
                </span>
            </div>
        );
    }

    if (!userData) {
        return <div className="p-4">Gebruiker niet gevonden.</div>;
    }

    if (!isSupervisor) {
        return <div className="p-4">Geen toegang. Alleen supervisors mogen gebruikersinstellingen beheren.</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto relative">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold">Gebruiker Details</h2>
                    <p className="text-secondary text-sm">
                        Beheer app-specifieke instellingen voor deze gebruiker
                    </p>
                </div>
            </div>

            {/* Basic Info Card (Read Only) */}
            <div className="bg-card rounded-xl border border-theme p-6">
                <h3 className="font-semibold mb-4 border-b border-theme pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Algemene Informatie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Naam</label>
                        <div className="text-primary font-medium">{userData.displayName || 'Onbekend'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                        <div className="text-primary font-medium">{userData.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Globale Rol</label>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {userData.role === 'supervisor' ? 'Supervisor' : 'Gebruiker'}
                        </div>
                        <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">lock</span>
                            Alleen-lezen
                        </p>
                    </div>
                </div>
            </div>

            {/* Apps Section */}
            <div className="space-y-4">
                <h3 className="font-bold text-xl px-1 flex items-center gap-2">
                    <span className="material-symbols-outlined">apps</span>
                    App Instellingen
                </h3>

                {Object.keys(APP_CREDITS_CONFIG).map((appId) => {
                    const config = APP_CREDITS_CONFIG[appId];
                    const settings = appSettings[appId];

                    // Check if credits field exists in DB (not just in config)
                    const hasCreditsInDb = settings && settings.creditsRemaining !== undefined;
                    const showCreditsUi = config.hasCredits && hasCreditsInDb;
                    const totalGenerations = settings?.totalGenerations;

                    return (
                        <div key={appId} className="bg-card rounded-xl border border-theme p-6 transition-all hover:border-[var(--color-primary)]">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-lg">{config.appName}</h4>
                                    <p className="text-sm text-secondary mt-0.5">{config.description}</p>
                                    <p className="text-xs text-secondary font-mono mt-1">{appId}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {settings === null && (
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-secondary px-2 py-1 rounded">
                                            Nog niet geconfigureerd
                                        </span>
                                    )}
                                    {saveSuccess[appId] && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check</span>
                                            Opgeslagen
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        App Rol
                                    </label>
                                    <select
                                        value={settings?.role || 'user'}
                                        onChange={(e) => handleAppChange(appId, 'role', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--bg-app)] border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2860E0]"
                                    >
                                        <option value="user">User</option>
                                        <option value="administrator">Administrator</option>
                                    </select>
                                </div>

                                {/* Credits - READ ONLY + Add Button */}
                                {showCreditsUi ? (
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">
                                            Resterende Credits
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                readOnly
                                                value={settings.creditsRemaining}
                                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-theme rounded-lg focus:outline-none text-secondary cursor-not-allowed"
                                                title="Credits kunnen alleen via de knop hiernaast worden gewijzigd"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openCreditModal(appId)}
                                                className="p-2 bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] text-primary rounded-lg border border-theme transition-colors flex items-center justify-center shrink-0"
                                                title="Credits toevoegen"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                        {config.monthlyLimit && (
                                            <p className="text-xs text-secondary mt-1">
                                                Limiet: {config.monthlyLimit} {config.creditUnitPlural}/maand
                                            </p>
                                        )}
                                    </div>
                                ) : config.hasCredits ? (
                                    <div className="flex items-center">
                                        <p className="text-sm text-secondary italic">
                                            Geen credits geïnitialiseerd voor deze gebruiker.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <p className="text-sm text-secondary italic">
                                            Deze app gebruikt geen credits.
                                        </p>
                                    </div>
                                )}

                                {/* Read-only Stats */}
                                {totalGenerations !== undefined && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                        <span className="block text-xs text-secondary uppercase tracking-wider">Totaal Generaties</span>
                                        <span className="block text-xl font-mono font-medium">{totalGenerations}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => handleSaveApp(appId)}
                                    disabled={saving[appId]}
                                    className="px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving[appId] ? (
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">save</span>
                                    )}
                                    Rol Opslaan
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined mt-0.5">info</span>
                <div className="text-sm space-y-1">
                    <p><strong>Let op:</strong> Wijzigingen worden opgeslagen naar <code className="bg-blue-500/20 px-1 rounded">users/{'{uid}'}/apps/{'{appId}'}</code>.</p>
                    <p>Credits kunnen alleen via de (+)-knop worden toegevoegd, dit wordt gelogd voor auditdoeleinden.</p>
                </div>
            </div>

            {/* Credit Adjustment Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-theme p-6 animate-in zoom-in-95 fade-in duration-200">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2860E0]">add_circle</span>
                            Credits Toevoegen
                        </h3>

                        <p className="text-sm text-secondary mb-6">
                            Voeg extra credits toe aan <strong>{APP_CREDITS_CONFIG[modalData.appId]?.appName}</strong> voor deze gebruiker.
                        </p>

                        <form onSubmit={handleSubmitCredits} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Aantal credits
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={modalData.amount}
                                    onChange={e => setModalData({ ...modalData, amount: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-theme rounded-lg focus:ring-2 focus:ring-[#2860E0]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Reden (verplicht)
                                </label>
                                <textarea
                                    required
                                    placeholder="Bijv. incident compensatie, extra testcapaciteit..."
                                    value={modalData.reason}
                                    onChange={e => setModalData({ ...modalData, reason: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-theme rounded-lg focus:ring-2 focus:ring-[#2860E0] min-h-[80px]"
                                />
                                <p className="text-xs text-secondary mt-1">Dit wordt opgeslagen in de audit logs.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-theme rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="flex-1 px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {modalLoading ? (
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">save</span>
                                    )}
                                    Toevoegen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
