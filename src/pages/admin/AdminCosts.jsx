/**
 * AdminCosts Page
 * 
 * Cost overview and configuration for the admin dashboard.
 * Shows platform costs per app and per user.
 * Pricing configuration for supervisors only.
 */

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../../config/appCredits';

// Default cost per credit (can be configured)
const DEFAULT_COST_PER_CREDIT = {
    'paco': 0.05,      // €0.05 per image
    'translate': 0.001  // €0.001 per word
};

export default function AdminCosts() {
    const { isSupervisor } = useAuth();
    const [usersCredits, setUsersCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    const allAppIds = getAllAppIds();

    // Fetch all users and their credit usage
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const usersRef = collection(db, 'users');
                const usersSnap = await getDocs(usersRef);

                const result = [];

                for (const userDoc of usersSnap.docs) {
                    const userData = userDoc.data();
                    const userCredits = { uid: userDoc.id, email: userData.email, displayName: userData.displayName, apps: {} };

                    // Fetch apps subcollection
                    const appsRef = collection(db, 'users', userDoc.id, 'apps');
                    const appsSnap = await getDocs(appsRef);

                    appsSnap.forEach(appDoc => {
                        userCredits.apps[appDoc.id] = appDoc.data();
                    });

                    if (Object.keys(userCredits.apps).length > 0) {
                        result.push(userCredits);
                    }
                }

                setUsersCredits(result);
            } catch (error) {
                console.error('Error fetching costs data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate costs
    const costSummary = useMemo(() => {
        const summary = {
            totalCost: 0,
            costPerApp: {},
            costPerUser: []
        };

        // Initialize per-app costs
        allAppIds.forEach(appId => {
            summary.costPerApp[appId] = { used: 0, cost: 0 };
        });

        usersCredits.forEach(userCredit => {
            let userTotalCost = 0;

            Object.entries(userCredit.apps).forEach(([appId, appData]) => {
                const used = appData.totalUsedThisMonth || 0;
                const costPerCredit = DEFAULT_COST_PER_CREDIT[appId] || 0.01;
                const cost = used * costPerCredit;

                if (summary.costPerApp[appId]) {
                    summary.costPerApp[appId].used += used;
                    summary.costPerApp[appId].cost += cost;
                }

                userTotalCost += cost;
            });

            summary.costPerUser.push({
                ...userCredit,
                totalCost: userTotalCost
            });

            summary.totalCost += userTotalCost;
        });

        // Sort users by cost descending
        summary.costPerUser.sort((a, b) => b.totalCost - a.totalCost);

        return summary;
    }, [usersCredits, allAppIds]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                    sync
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Kosten</h2>
                <p className="text-secondary mt-1">
                    Overzicht van platformkosten per app en gebruiker
                </p>
            </div>

            {/* Total Cost Card */}
            <div className="bg-gradient-to-br from-[#2860E0] to-[#1C4DAB] rounded-xl p-6 text-white">
                <p className="text-white/70 text-sm">Totale Kosten Deze Maand</p>
                <p className="text-4xl font-bold mt-2">
                    €{costSummary.totalCost.toFixed(2)}
                </p>
                <p className="text-white/70 text-sm mt-2">
                    Gebaseerd op {usersCredits.length} actieve gebruikers
                </p>
            </div>

            {/* Cost per App */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Kosten per App</h3>
                <div className="space-y-4">
                    {allAppIds.map(appId => {
                        const config = APP_CREDITS_CONFIG[appId];
                        const appCost = costSummary.costPerApp[appId];
                        const costPerCredit = DEFAULT_COST_PER_CREDIT[appId] || 0.01;

                        return (
                            <div key={appId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#2860E0]/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#2860E0]">
                                            {appId === 'paco' ? 'image' : 'translate'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{config.appName}</p>
                                        <p className="text-sm text-secondary">
                                            {appCost.used} {config.creditUnitPlural} gebruikt
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">€{appCost.cost.toFixed(2)}</p>
                                    <p className="text-xs text-secondary">
                                        €{costPerCredit.toFixed(3)} per {config.creditUnit}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pricing Configuration (visible for all, editable for supervisor) */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">settings</span>
                    Prijsconfiguratie
                    {!isSupervisor && (
                        <span className="text-xs font-normal text-secondary ml-2">(alleen-lezen)</span>
                    )}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {allAppIds.map(appId => {
                        const config = APP_CREDITS_CONFIG[appId];
                        const costPerCredit = DEFAULT_COST_PER_CREDIT[appId] || 0.01;

                        return (
                            <div key={appId} className="p-4 border border-theme rounded-lg">
                                <p className="font-medium mb-2">{config.appName}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-secondary">€</span>
                                    <input
                                        type="number"
                                        step="0.001"
                                        defaultValue={costPerCredit}
                                        className="flex-1 px-3 py-2 rounded-lg border border-theme bg-white dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                        disabled={!isSupervisor}
                                        readOnly={!isSupervisor}
                                    />
                                    <span className="text-sm text-secondary">per {config.creditUnit}</span>
                                </div>
                                {isSupervisor && (
                                    <p className="text-xs text-secondary mt-2">
                                        * Prijswijzigingen momenteel niet actief
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cost per User */}
            <div className="bg-card rounded-xl border border-theme overflow-x-auto">
                <div className="p-4 border-b border-theme">
                    <h3 className="font-semibold">Kosten per Gebruiker</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-theme">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Gebruiker</th>
                            {allAppIds.map(appId => (
                                <th key={appId} className="text-center px-4 py-3 font-semibold">
                                    {APP_CREDITS_CONFIG[appId]?.appName}
                                </th>
                            ))}
                            <th className="text-right px-4 py-3 font-semibold">Totaal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costSummary.costPerUser.length === 0 ? (
                            <tr>
                                <td colSpan={allAppIds.length + 2} className="px-4 py-8 text-center text-secondary">
                                    Geen kosten geregistreerd
                                </td>
                            </tr>
                        ) : (
                            costSummary.costPerUser.slice(0, 20).map((userCost) => (
                                <tr key={userCost.uid} className="border-b border-theme last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{userCost.displayName || 'Onbekend'}</p>
                                            <p className="text-sm text-secondary">{userCost.email}</p>
                                        </div>
                                    </td>
                                    {allAppIds.map(appId => {
                                        const appData = userCost.apps[appId];
                                        const used = appData?.totalUsedThisMonth || 0;
                                        const cost = used * (DEFAULT_COST_PER_CREDIT[appId] || 0.01);

                                        return (
                                            <td key={appId} className="px-4 py-3 text-center text-secondary">
                                                {used > 0 ? `€${cost.toFixed(2)}` : '-'}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-right font-medium">
                                        €{userCost.totalCost.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Maandelijkse Trend</h3>
                <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 block">show_chart</span>
                        <p className="text-sm">Kostengrafiek komt binnenkort</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
