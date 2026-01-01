/**
 * AdminNewsletterAnalytics Page
 * 
 * Read-only analytics dashboard for Newsletter Generator.
 * Shows metrics on submissions, approvals, and content distribution.
 * Accessible to admin and supervisor roles only.
 */

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function AdminNewsletterAnalytics() {
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [weekRange, setWeekRange] = useState(8); // Default: last 8 weeks

    // Fetch newsletter items from Firestore
    useEffect(() => {
        const fetchNewsletterData = async () => {
            try {
                setLoading(true);

                // Query newsletter items from Firestore
                const itemsRef = collection(db, 'apps/nieuwsbrief/items');
                const itemsQuery = query(itemsRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(itemsQuery);

                const newsletterItems = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setItems(newsletterItems);

            } catch (error) {
                console.error('Error fetching newsletter data:', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsletterData();
    }, [weekRange]);

    // Calculate analytics metrics
    const analytics = useMemo(() => {
        const now = new Date();
        const weeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekRange * 7));

        const recentItems = items.filter(item => {
            const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
            return itemDate >= weeksAgo;
        });

        const totalItems = recentItems.length;
        const pendingItems = recentItems.filter(item => item.status === 'pending').length;
        const approvedItems = recentItems.filter(item => item.status === 'approved').length;

        // Calculate average approval time (in hours)
        const approvedWithTime = recentItems.filter(item =>
            item.status === 'approved' && item.approvedAt && item.createdAt
        );
        const avgApprovalTime = approvedWithTime.length > 0
            ? approvedWithTime.reduce((sum, item) => {
                const created = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
                const approved = item.approvedAt?.toDate ? item.approvedAt.toDate() : new Date(item.approvedAt);
                return sum + (approved - created) / (1000 * 60 * 60); // Convert to hours
            }, 0) / approvedWithTime.length
            : 0;

        // Group by week
        const itemsByWeek = {};
        recentItems.forEach(item => {
            const weekKey = item.week || getWeekNumber(item.createdAt);
            itemsByWeek[weekKey] = (itemsByWeek[weekKey] || 0) + 1;
        });

        // Group by submitter
        const itemsByUser = {};
        recentItems.forEach(item => {
            const user = item.submittedBy || 'Unknown';
            itemsByUser[user] = (itemsByUser[user] || 0) + 1;
        });

        // Group by doelgroep
        const itemsByDoelgroep = {};
        recentItems.forEach(item => {
            const doelgroep = item.doelgroep || 'Onbekend';
            itemsByDoelgroep[doelgroep] = (itemsByDoelgroep[doelgroep] || 0) + 1;
        });

        return {
            totalItems,
            pendingItems,
            approvedItems,
            approvalRatio: totalItems > 0 ? (approvedItems / totalItems * 100).toFixed(1) : 0,
            avgApprovalTime: avgApprovalTime.toFixed(1),
            itemsByWeek,
            itemsByUser,
            itemsByDoelgroep
        };
    }, [items, weekRange]);

    // Generate last N weeks for chart
    const weekLabels = useMemo(() => {
        const weeks = [];
        const now = new Date();
        for (let i = weekRange - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
            const weekNum = getWeekNumber(date);
            weeks.push(`Week ${weekNum}`);
        }
        return weeks;
    }, [weekRange]);

    // CSV Export Handlers
    const downloadCSV = (data, filename) => {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportItemsPerWeek = () => {
        const date = new Date().toISOString().split('T')[0];
        const csvRows = [
            ['Week', 'Aantal Items'],
            ...Object.entries(analytics.itemsByWeek).map(([week, count]) => [
                `Week ${week}`,
                count
            ])
        ];
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        downloadCSV(csvContent, `nieuwsbrief_per_week_${weekRange}w_${date}.csv`);
    };

    const exportItemsPerUser = () => {
        const date = new Date().toISOString().split('T')[0];
        const csvRows = [
            ['Gebruiker', 'Aantal Submissions'],
            ...Object.entries(analytics.itemsByUser)
                .sort(([, a], [, b]) => b - a)
                .map(([user, count]) => [user, count])
        ];
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        downloadCSV(csvContent, `nieuwsbrief_per_user_${weekRange}w_${date}.csv`);
    };

    const exportDoelgroepDistribution = () => {
        const date = new Date().toISOString().split('T')[0];
        const csvRows = [
            ['Doelgroep', 'Aantal Items'],
            ...Object.entries(analytics.itemsByDoelgroep).map(([doelgroep, count]) => [
                doelgroep,
                count
            ])
        ];
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        downloadCSV(csvContent, `nieuwsbrief_doelgroep_${weekRange}w_${date}.csv`);
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block">block</span>
                    <p className="text-xl font-semibold">Toegang Geweigerd</p>
                    <p className="text-secondary mt-2">Je hebt geen toegang tot deze pagina.</p>
                </div>
            </div>
        );
    }

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
                <h2 className="text-2xl font-bold">Nieuwsbrief Analytics</h2>
                <p className="text-secondary mt-1">
                    Inzichten in nieuwsbrief submissions en goedkeuringen
                </p>
            </div>

            {/* Week Range Filter */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <label className="block text-sm font-medium mb-2">Periode</label>
                <select
                    value={weekRange}
                    onChange={(e) => setWeekRange(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-theme bg-white dark:bg-gray-800"
                >
                    <option value={4}>Laatste 4 weken</option>
                    <option value={8}>Laatste 8 weken</option>
                    <option value={12}>Laatste 12 weken</option>
                    <option value={26}>Laatste 6 maanden</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500">description</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{analytics.totalItems}</p>
                            <p className="text-sm text-secondary">Totaal Items</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500">pending</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{analytics.pendingItems}</p>
                            <p className="text-sm text-secondary">In Afwachting</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{analytics.approvalRatio}%</p>
                            <p className="text-sm text-secondary">Goedgekeurd</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500">schedule</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{analytics.avgApprovalTime}u</p>
                            <p className="text-sm text-secondary">Gem. Goedkeuring</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items per Week Chart */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Items per Week</h3>
                <div className="space-y-3">
                    {weekLabels.map((week, index) => {
                        const count = analytics.itemsByWeek[week.replace('Week ', '')] || 0;
                        const maxCount = Math.max(...Object.values(analytics.itemsByWeek), 1);
                        const percentage = (count / maxCount) * 100;

                        return (
                            <div key={week} className="flex items-center gap-3">
                                <div className="w-20 text-sm text-secondary">{week}</div>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 overflow-hidden">
                                    <div
                                        className="bg-[#2860E0] h-full flex items-center justify-end px-3 text-white text-sm font-medium transition-all"
                                        style={{ width: `${percentage}%` }}
                                    >
                                        {count > 0 && count}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submissions per User */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Submissions per Gebruiker</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-theme">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold">Gebruiker</th>
                                <th className="text-right px-4 py-3 font-semibold">Aantal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(analytics.itemsByUser)
                                .sort(([, a], [, b]) => b - a)
                                .map(([user, count]) => (
                                    <tr key={user} className="border-b border-theme last:border-0">
                                        <td className="px-4 py-3">{user}</td>
                                        <td className="px-4 py-3 text-right font-medium">{count}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    {Object.keys(analytics.itemsByUser).length === 0 && (
                        <div className="text-center py-8 text-secondary">
                            <p>Geen data beschikbaar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Doelgroep Distribution */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Verdeling per Doelgroep</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analytics.itemsByDoelgroep).map(([doelgroep, count]) => (
                        <div key={doelgroep} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-secondary mb-1">{doelgroep}</p>
                            <p className="text-2xl font-bold">{count}</p>
                        </div>
                    ))}
                    {Object.keys(analytics.itemsByDoelgroep).length === 0 && (
                        <div className="col-span-full text-center py-8 text-secondary">
                            <p>Geen data beschikbaar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Exporteren</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={exportItemsPerWeek}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">download</span>
                        Items per Week
                    </button>
                    <button
                        onClick={exportItemsPerUser}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">download</span>
                        Items per Gebruiker
                    </button>
                    <button
                        onClick={exportDoelgroepDistribution}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">download</span>
                        Doelgroep Verdeling
                    </button>
                </div>
                <p className="text-sm text-secondary mt-3">
                    Download analytics data als CSV bestand (periode: {weekRange} weken)
                </p>
            </div>

            {/* Data Source Info */}
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">info</span>
                <p className="text-sm">
                    Deze analytics zijn read-only en gebaseerd op Newsletter Generator data.
                    Wijzig rollen en instellingen via de Admin → Gebruikers pagina.
                </p>
            </div>
        </div>
    );
}

// Helper function to get ISO week number
function getWeekNumber(date) {
    const d = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date));
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target - jan4) / 86400000;
    return 1 + Math.ceil(dayDiff / 7);
}
