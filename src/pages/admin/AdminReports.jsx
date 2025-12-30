/**
 * AdminReports Page
 * 
 * Reporting and export functionality for the admin dashboard.
 * Provides monthly reports and export options (PDF, Excel).
 */

import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../../config/appCredits';

export default function AdminReports() {
    const { isSupervisor } = useAuth();
    const { tools } = useTools();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedApp, setSelectedApp] = useState('all');
    const [exporting, setExporting] = useState(null);

    const allAppIds = getAllAppIds();

    // Generate last 12 months
    const months = useMemo(() => {
        const result = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push({
                value: date.toISOString().slice(0, 7),
                label: date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
            });
        }
        return result;
    }, []);

    // Mock report data (in a real implementation, this would fetch from Firestore)
    const reportData = useMemo(() => {
        return {
            period: selectedMonth,
            totalUsers: 0,
            activeUsers: 0,
            totalCreditsUsed: 0,
            totalCosts: 0,
            apps: allAppIds.map(appId => ({
                appId,
                name: APP_CREDITS_CONFIG[appId]?.appName,
                creditsUsed: 0,
                cost: 0
            }))
        };
    }, [selectedMonth, allAppIds]);

    // Export handlers (placeholders)
    const handleExport = async (format) => {
        setExporting(format);

        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real implementation, this would:
        // 1. Fetch data from Firestore
        // 2. Generate PDF/Excel using a library
        // 3. Trigger download

        alert(`${format.toUpperCase()} export functie komt binnenkort beschikbaar`);
        setExporting(null);
    };

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Rapportages</h2>
                <p className="text-secondary mt-1">
                    Genereer en exporteer maandelijkse rapporten
                </p>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Rapport Instellingen</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Month Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Periode</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-theme bg-white dark:bg-gray-800"
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* App Filter */}
                    <div>
                        <label className="block text-sm font-medium mb-2">App</label>
                        <select
                            value={selectedApp}
                            onChange={(e) => setSelectedApp(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-theme bg-white dark:bg-gray-800"
                        >
                            <option value="all">Alle Apps</option>
                            {allAppIds.map(appId => (
                                <option key={appId} value={appId}>
                                    {APP_CREDITS_CONFIG[appId]?.appName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                        <button
                            className="w-full px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-xl">refresh</span>
                            Genereer Rapport
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Preview */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Rapport Overzicht</h3>
                    <p className="text-sm text-secondary">
                        {months.find(m => m.value === selectedMonth)?.label}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-secondary">Actieve Gebruikers</p>
                        <p className="text-2xl font-bold mt-1">{reportData.activeUsers}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-secondary">Credits Gebruikt</p>
                        <p className="text-2xl font-bold mt-1">{reportData.totalCreditsUsed}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-secondary">Totale Kosten</p>
                        <p className="text-2xl font-bold mt-1">€{reportData.totalCosts.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-secondary">Aantal Tools</p>
                        <p className="text-2xl font-bold mt-1">{tools.length}</p>
                    </div>
                </div>

                {/* Per App Breakdown */}
                <div className="border-t border-theme pt-4">
                    <h4 className="font-medium mb-3">Per App</h4>
                    <div className="space-y-2">
                        {reportData.apps.map(app => (
                            <div
                                key={app.appId}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                            >
                                <span className="font-medium">{app.name}</span>
                                <div className="flex items-center gap-6 text-sm">
                                    <span className="text-secondary">{app.creditsUsed} credits</span>
                                    <span className="font-medium">€{app.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* No Data Message */}
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg text-center">
                    <span className="material-symbols-outlined text-3xl text-blue-500 mb-2 block">info</span>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        Rapportagedata wordt verzameld zodra het creditsysteem in gebruik is.
                    </p>
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Exporteren</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting === 'pdf'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {exporting === 'pdf' ? (
                            <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                        )}
                        Exporteer als PDF
                    </button>

                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting === 'excel'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {exporting === 'excel' ? (
                            <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">table_chart</span>
                        )}
                        Exporteer als Excel
                    </button>

                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting === 'csv'}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-theme rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {exporting === 'csv' ? (
                            <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">csv</span>
                        )}
                        Exporteer als CSV
                    </button>
                </div>
                <p className="text-sm text-secondary mt-4">
                    Export functionaliteit wordt binnenkort toegevoegd.
                </p>
            </div>

            {/* Recent Reports */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Recente Rapporten</h3>
                <div className="text-center py-8 text-secondary">
                    <span className="material-symbols-outlined text-4xl mb-2 block">folder_open</span>
                    <p>Nog geen rapporten gegenereerd</p>
                </div>
            </div>
        </div>
    );
}
