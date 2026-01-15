/**
 * AdminCosts Page
 * 
 * Cost overview and configuration for the admin dashboard.
 * Shows platform costs per app and per user.
 * Pricing configuration for supervisors only.
 */

import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    getDocs,
    query,
    where,
    collectionGroup,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../../config/appCredits';

// Default cost per credit (can be configured)
const DEFAULT_COST_PER_CREDIT = {
    'paco': 0.05,      // €0.05 per image
    'translate': 0.001  // €0.001 per word
};

export default function AdminCosts() {
    const { isSupervisor } = useAuth();
    const [prices, setPrices] = useState({});
    const [editingPrices, setEditingPrices] = useState({}); // Local edit state
    const [aggregatedData, setAggregatedData] = useState({
        userCosts: [], // Flattened user costs
        appCosts: {}   // appId -> doc data
    });
    // Live costs per app from getCostsSummary Cloud Function
    const [liveAppCosts, setLiveAppCosts] = useState({});
    const [liveAppCostsLoading, setLiveAppCostsLoading] = useState(true);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const allAppIds = getAllAppIds();
    const getCostsSummary = httpsCallable(functions, 'getCostsSummary');

    // Helper: Current Month Key (YYYY-MM)
    const currentMonthKey = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }, []);

    // Fetch LIVE costs per app via getCostsSummary Cloud Function
    useEffect(() => {
        const fetchLiveCosts = async () => {
            setLiveAppCostsLoading(true);
            const costsMap = {};

            // Fetch costs for each app in parallel
            const promises = allAppIds.map(async (appId) => {
                try {
                    const res = await getCostsSummary({ appId });
                    costsMap[appId] = {
                        used: res.data?.totalUsage ?? 0,
                        cost: res.data?.totalCost ?? 0,
                        monthKey: res.data?.monthKey ?? currentMonthKey
                    };
                } catch (err) {
                    console.error(`Failed to fetch costs for ${appId}:`, err);
                    costsMap[appId] = { used: 0, cost: 0, monthKey: currentMonthKey };
                }
            });

            await Promise.all(promises);
            setLiveAppCosts(costsMap);
            setLiveAppCostsLoading(false);
        };

        fetchLiveCosts();
    }, [currentMonthKey]);


    // 1. Fetch Users (Reference)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await getDocs(collection(db, 'users'));
                const userMap = {};
                snap.forEach(doc => {
                    userMap[doc.id] = doc.data();
                });
                setUsers(userMap);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
    }, []);

    // 2. Fetch Prices (Configuration)
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const docRef = doc(db, 'admin', 'costConfig');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setPrices(snap.data());
                } else {
                    // Fallback to defaults (visual only, server uses its own defaults)
                    setPrices({
                        paco: 0.05,
                        translate: 0.001
                    });
                }
            } catch (err) {
                console.error('Error fetching prices:', err);
            }
        };
        fetchPrices();
    }, []);

    // 3. Fetch Aggregated Data (Source of Truth)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch User Costs via CollectionGroup
                // Query: collection 'costs', where monthKey == current
                const costsQuery = query(
                    collectionGroup(db, 'costs'),
                    where('monthKey', '==', currentMonthKey)
                );

                const snap = await getDocs(costsQuery);

                const userCostsMap = {}; // uid -> { uid, totalCost, apps: { appId: { cost, usage } } }
                const appCostsMap = {};  // appId -> { totalCost, totalUsage }

                snap.forEach(doc => {
                    const data = doc.data();
                    const path = doc.ref.path; // apps/{appId}/costs/... or apps/{appId}/users/{uid}/costs/...

                    // Determine if App Aggregate or User Aggregate
                    // Path splits: ["apps", appId, "costs", month] OR ["apps", appId, "users", uid, "costs", month]
                    const segments = path.split('/');
                    const appId = segments[1];

                    if (segments.length === 4) {
                        // App Aggregate: apps/{appId}/costs/{month}
                        appCostsMap[appId] = {
                            cost: data.totalCost || 0,
                            used: data.totalUsage || 0,
                            count: data.count || 0
                        };
                    } else if (segments.length === 6) {
                        // User Aggregate
                        const uid = data.uid;
                        if (!userCostsMap[uid]) {
                            userCostsMap[uid] = {
                                uid,
                                totalCost: 0,
                                apps: {}
                            };
                        }

                        userCostsMap[uid].apps[appId] = {
                            cost: data.totalCost || 0,
                            totalUsedThisMonth: data.totalUsage || 0
                        };
                        userCostsMap[uid].totalCost += (data.totalCost || 0);
                    }
                });

                setAggregatedData({
                    userCosts: Object.values(userCostsMap).sort((a, b) => b.totalCost - a.totalCost),
                    appCosts: appCostsMap
                });

            } catch (err) {
                console.error('Error fetching cost aggregates:', err);
            } finally {
                setLoading(false);
            }
        };

        if (currentMonthKey) {
            fetchData();
        }
    }, [currentMonthKey]);

    // Handle local input change (no Firestore write)
    const handlePriceInput = (appId, value) => {
        setEditingPrices(prev => ({ ...prev, [appId]: value }));
    };

    // Save Price Configuration on blur
    const handlePriceSave = async (appId) => {
        if (!isSupervisor) return;

        const inputValue = editingPrices[appId];
        if (inputValue === undefined) return; // No edit made

        const price = parseFloat(inputValue);
        if (isNaN(price) || price < 0) {
            // Reset to original
            setEditingPrices(prev => {
                const next = { ...prev };
                delete next[appId];
                return next;
            });
            return;
        }

        try {
            setSaving(true);
            const docRef = doc(db, 'admin', 'costConfig');
            await setDoc(docRef, {
                [appId]: price
            }, { merge: true });

            setPrices(prev => ({ ...prev, [appId]: price }));
            setEditingPrices(prev => {
                const next = { ...prev };
                delete next[appId];
                return next;
            });
        } catch (err) {
            console.error('Error saving price:', err);
            alert('Fout bij opslaan prijs');
        } finally {
            setSaving(false);
        }
    };

    // Calculate Grand Total from LIVE App Costs (Cloud Function)
    const grandTotal = Object.values(liveAppCosts).reduce((sum, app) => sum + (app.cost || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#2860E0]">
                        sync
                    </span>
                    <p className="text-secondary mt-2 text-sm">Rapport genereren...</p>
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
                    Overzicht van platformkosten per app en gebruiker ({currentMonthKey})
                </p>
                <div className="text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded inline-block mt-2">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">history</span>
                    Data wordt elk uur geüpdatet
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
                        // Use LIVE costs from getCostsSummary Cloud Function
                        const appCost = liveAppCosts[appId] || { used: 0, cost: 0 };
                        const currentPrice = prices[appId] || 0;
                        const isLoading = liveAppCostsLoading;

                        return (
                            <div key={appId} className="flex items-center justify-between p-4 bg-[var(--bg-app)] rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#2860E0]/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#2860E0]">
                                            {appId === 'paco' ? 'image' : 'translate'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{config.appName}</p>
                                        <p className="text-sm text-secondary">
                                            {isLoading ? '…' : appCost.used} {config.creditUnitPlural} verbruikt
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">
                                        {isLoading ? '…' : `€${(appCost.cost || 0).toFixed(2)}`}
                                    </p>
                                    <p className="text-xs text-secondary">
                                        Huidige prijs: €{currentPrice.toFixed(3)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pricing Configuration */}
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
                        const price = prices[appId] || 0;

                        return (
                            <div key={appId} className="p-4 border border-theme rounded-lg">
                                <p className="font-medium mb-2">{config.appName}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-secondary">€</span>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={editingPrices[appId] !== undefined ? editingPrices[appId] : price}
                                        onChange={(e) => handlePriceInput(appId, e.target.value)}
                                        onBlur={() => handlePriceSave(appId)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-theme bg-[var(--input-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
                                        disabled={!isSupervisor || saving}
                                    />
                                    <span className="text-sm text-secondary">per {config.creditUnit}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cost per User */}
            <div className="bg-card rounded-xl border border-theme overflow-x-auto">
                <div className="p-4 border-b border-theme">
                    <h3 className="font-semibold">Kosten per Gebruiker (Toplijst)</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-[var(--bg-app)] border-b border-theme">
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
                        {aggregatedData.userCosts.length === 0 ? (
                            <tr>
                                <td colSpan={allAppIds.length + 2} className="px-4 py-8 text-center text-secondary">
                                    Nog geen kosten geregistreerd deze maand.
                                </td>
                            </tr>
                        ) : (
                            aggregatedData.userCosts.slice(0, 50).map((userCost) => {
                                const userProfile = users[userCost.uid] || {};
                                return (
                                    <tr key={userCost.uid} className="border-b border-theme last:border-0 hover:bg-[var(--bg-surface-hover)]">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">{userProfile.displayName || 'Onbekend'}</p>
                                                <p className="text-sm text-secondary">{userProfile.email || 'Geen email'}</p>
                                            </div>
                                        </td>
                                        {allAppIds.map(appId => {
                                            const appData = userCost.apps[appId];
                                            const cost = appData?.cost || 0;
                                            return (
                                                <td key={appId} className="px-4 py-3 text-center text-secondary">
                                                    {cost > 0 ? `€${cost.toFixed(2)}` : '-'}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 text-right font-medium">
                                            €{userCost.totalCost.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Maandelijkse Trend</h3>
                <div className="h-48 flex items-center justify-center bg-[var(--bg-app)] rounded-lg">
                    <div className="text-center text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 block">show_chart</span>
                        <p className="text-sm">Historische data wordt nu verzameld.</p>
                    </div>
                </div>
            </div>

            {/* OPTIONAL: Detailed Breakdown (Cloud Function Source) */}
            <DetailedCostBreakdown currentMonthKey={currentMonthKey} />
        </div>
    );
}

function DetailedCostBreakdown({ currentMonthKey }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const getUserCostBreakdown = httpsCallable(functions, 'getUserCostBreakdown');
            const result = await getUserCostBreakdown({ monthKey: currentMonthKey });
            setData(result.data); // [{ userId, userEmail, appId, usage, cost }]
        } catch (err) {
            console.error('Error loading breakdown:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border border-theme p-5">
            <details className="group">
                <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2860E0]">table_view</span>
                        Kosten per gebruiker (Detailoverzicht)
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                        expand_more
                    </span>
                </summary>

                <div className="mt-4 border-t border-theme pt-4">
                    <p className="text-sm text-secondary mb-4">
                        Dit overzicht toont gedetailleerd gebruik en kosten per app voor de maand <strong>{currentMonthKey}</strong>.
                        Data wordt opgehaald via een Cloud Function.
                    </p>

                    {!data && !loading && (
                        <button
                            onClick={loadData}
                            className="px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Laad Details
                        </button>
                    )}

                    {loading && (
                        <div className="flex items-center gap-3 text-[#2860E0]">
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            <span>Data ophalen...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">
                            Fout bij laden: {error}
                        </div>
                    )}

                    {data && (
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--bg-app)] text-left border-b border-theme">
                                    <tr>
                                        <th className="px-3 py-2">Gebruiker</th>
                                        <th className="px-3 py-2">Email</th>
                                        <th className="px-3 py-2">App</th>
                                        <th className="px-3 py-2 text-right">Verbruik</th>
                                        <th className="px-3 py-2 text-right">Kosten</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-3 py-4 text-center text-secondary">
                                                Geen data gevonden voor deze maand.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.sort((a, b) => b.cost - a.cost).map((row, i) => {
                                            const config = APP_CREDITS_CONFIG[row.appId];
                                            const appName = config ? config.appName : row.appId;

                                            return (
                                                <tr key={`${row.userId}-${row.appId}`} className="hover:bg-[var(--bg-surface-hover)]">
                                                    <td className="px-3 py-2 font-mono text-xs text-secondary">{row.userId}</td>
                                                    <td className="px-3 py-2 font-medium">{row.userEmail}</td>
                                                    <td className="px-3 py-2">
                                                        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-500/20">
                                                            {appName}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono">
                                                        {row.usage}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        €{row.cost.toFixed(4)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </details>
        </div>
    );
}
