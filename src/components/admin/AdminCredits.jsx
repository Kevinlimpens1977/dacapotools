/**
 * AdminCredits Page
 * 
 * Displays LIVE monthly cost data for all apps.
 * Data source: getCostsSummary Cloud Function (ONLY)
 * 
 * CANONICAL RULES:
 * - NO Firestore imports
 * - NO client-side cost calculation
 * - Read-only for Admin & MT
 */

import { useState, useEffect, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../../config/appCredits';

export default function AdminCredits() {
    // Live costs per app: { [appId]: { totalUsage, totalCost, monthKey } }
    const [appCosts, setAppCosts] = useState({});
    const [loading, setLoading] = useState(true);

    const allAppIds = getAllAppIds();
    const getCostsSummary = httpsCallable(functions, 'getCostsSummary');

    // Current month key for display
    const currentMonthKey = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }, []);

    // Fetch LIVE costs for each app via Cloud Function
    useEffect(() => {
        const fetchAllCosts = async () => {
            setLoading(true);
            const costsMap = {};

            // Fetch costs for each app in parallel
            const promises = allAppIds.map(async (appId) => {
                try {
                    const res = await getCostsSummary({ appId });
                    costsMap[appId] = {
                        totalUsage: res.data?.totalUsage ?? 0,
                        totalCost: res.data?.totalCost ?? 0,
                        monthKey: res.data?.monthKey ?? currentMonthKey
                    };
                } catch (err) {
                    console.error(`Failed to fetch costs for ${appId}:`, err);
                    costsMap[appId] = { totalUsage: 0, totalCost: 0, monthKey: currentMonthKey };
                }
            });

            await Promise.all(promises);
            setAppCosts(costsMap);
            setLoading(false);
        };

        fetchAllCosts();
    }, [currentMonthKey]);

    // Calculate grand total from all app costs
    const grandTotal = Object.values(appCosts).reduce(
        (sum, app) => sum + (app.totalCost || 0),
        0
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                        sync
                    </span>
                    <p className="text-secondary mt-2 text-sm">Kosten laden...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Kosten</h2>
                <p className="text-secondary mt-1">
                    Overzicht van platformkosten per app ({currentMonthKey})
                </p>
                <div className="text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded inline-block mt-2">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">cloud_done</span>
                    Live data via Cloud Functions
                </div>
            </div>

            {/* Total Cost Card */}
            <div className="bg-gradient-to-br from-[#2860E0] to-[#1C4DAB] rounded-xl p-6 text-white">
                <p className="text-white/70 text-sm">Totale Kosten Deze Maand</p>
                <p className="text-4xl font-bold mt-2">
                    €{grandTotal.toFixed(2)}
                </p>
                <p className="text-white/70 text-sm mt-2">
                    Gebaseerd op server-side aggregatie
                </p>
            </div>

            {/* Cost per App */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Kosten per App</h3>
                <div className="space-y-4">
                    {allAppIds.map(appId => {
                        const config = APP_CREDITS_CONFIG[appId];
                        const costs = appCosts[appId] || { totalUsage: 0, totalCost: 0 };

                        return (
                            <div key={appId} className="flex items-center justify-between p-4 bg-[var(--bg-app)] rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#2860E0]/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#2860E0]">
                                            {appId === 'paco' ? 'image' : appId === 'translate' ? 'translate' : 'apps'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{config.appName}</p>
                                        <p className="text-sm text-secondary">
                                            {costs.totalUsage} {config.creditUnitPlural || 'acties'} verbruikt
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">
                                        €{(costs.totalCost || 0).toFixed(2)}
                                    </p>
                                    {config.hasCredits && (
                                        <p className="text-xs text-secondary">
                                            Limiet: {config.monthlyLimit} {config.creditUnitPlural}/maand
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Note */}
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">info</span>
                <p className="text-sm">
                    Kosten worden automatisch berekend door Cloud Functions.
                    Data is read-only voor administrators.
                </p>
            </div>
        </div>
    );
}
