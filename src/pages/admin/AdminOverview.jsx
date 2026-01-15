/**
 * AdminOverview Page
 * 
 * Landing page for the admin dashboard.
 * Shows KPI cards, usage charts (placeholder), and alerts.
 * "Alles onder controle in 30 seconden"
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import { useLabels } from '../../hooks/useLabels';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../../config/appCredits';

export default function AdminOverview() {
    const { isSupervisor } = useAuth();
    const { tools, loading: toolsLoading } = useTools();
    const { labels } = useLabels();

    const allAppIds = getAllAppIds();

    // Calculate stats
    const stats = useMemo(() => {
        const activeTools = tools.filter(t => t.isActive !== false);
        const publishedTools = tools.filter(t => t.status === 'published');
        const totalClicks = tools.reduce((sum, t) => sum + (t.clickCount || 0), 0);
        const totalFavorites = tools.reduce((sum, t) => sum + (t.favoriteCount || 0), 0);

        return {
            totalTools: tools.length,
            activeTools: activeTools.length,
            publishedTools: publishedTools.length,
            totalClicks,
            totalFavorites,
            totalApps: allAppIds.length
        };
    }, [tools, allAppIds]);

    // Find tools with issues
    const alerts = useMemo(() => {
        const issues = [];

        // Tools without images
        const noImageTools = tools.filter(t => !t.imageUrl);
        if (noImageTools.length > 0) {
            issues.push({
                type: 'warning',
                icon: 'image_not_supported',
                message: `${noImageTools.length} tool(s) zonder afbeelding`,
                link: '/admin/tools'
            });
        }

        // Draft tools
        const draftTools = tools.filter(t => t.status === 'draft');
        if (draftTools.length > 0) {
            issues.push({
                type: 'info',
                icon: 'edit_note',
                message: `${draftTools.length} tool(s) in concept`,
                link: '/admin/tools'
            });
        }

        // Inactive tools
        const inactiveTools = tools.filter(t => t.isActive === false);
        if (inactiveTools.length > 0) {
            issues.push({
                type: 'info',
                icon: 'visibility_off',
                message: `${inactiveTools.length} tool(s) inactief`,
                link: '/admin/tools'
            });
        }

        return issues;
    }, [tools]);

    if (toolsLoading) {
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
            {/* Welcome Message */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Welkom terug!
                    <span className="material-symbols-outlined text-[#2860E0]">waving_hand</span>
                </h2>
                <p className="text-secondary mt-1">
                    Hier is het overzicht van je DaCapo Tools platform.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500">construction</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalTools}</p>
                            <p className="text-sm text-secondary">Totaal Tools</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.publishedTools}</p>
                            <p className="text-sm text-secondary">Gepubliceerd</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500">touch_app</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalClicks}</p>
                            <p className="text-sm text-secondary">Totaal Clicks</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500 filled">favorite</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                            <p className="text-sm text-secondary">Favorieten</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions (Supervisor only) */}
            {isSupervisor && (
                <div className="bg-card rounded-xl border border-theme p-5">
                    <h3 className="font-semibold mb-4">Snelle Acties</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/admin/tools/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                            Nieuwe Tool
                        </Link>
                        <Link
                            to="/admin/labels"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-theme rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-elev-2)] text-primary transition-colors hover:border-[#2860E0]"
                        >
                            <span className="material-symbols-outlined text-xl">label</span>
                            Labels Beheren
                        </Link>
                        <Link
                            to="/admin/users"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-theme rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-elev-2)] text-primary transition-colors hover:border-[#2860E0]"
                        >
                            <span className="material-symbols-outlined text-xl">group</span>
                            Gebruikers
                        </Link>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-card rounded-xl border border-theme p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">notifications</span>
                        Aandachtspunten
                    </h3>
                    <div className="space-y-3">
                        {alerts.map((alert, index) => (
                            <Link
                                key={index}
                                to={alert.link}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${alert.type === 'warning'
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
                                    : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                    }`}>
                                    {alert.icon}
                                </span>
                                <span className="flex-1">{alert.message}</span>
                                <span className="material-symbols-outlined text-secondary">
                                    chevron_right
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Placeholder */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-theme p-5">
                    <h3 className="font-semibold mb-4 text-primary">Gebruik per Tool</h3>
                    <div className="h-48 flex items-center justify-center bg-[var(--bg-app)] rounded-lg">
                        <div className="text-center text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2 block">bar_chart</span>
                            <p className="text-sm">Grafiek komt binnenkort</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-theme p-5">
                    <h3 className="font-semibold mb-4 text-primary">Credits Overzicht</h3>
                    <div className="h-48 flex items-center justify-center bg-[var(--bg-app)] rounded-lg">
                        <div className="text-center text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2 block">pie_chart</span>
                            <p className="text-sm">Grafiek komt binnenkort</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Apps Summary */}
            <div className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Geregistreerde Apps</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {allAppIds.map(appId => {
                        const config = APP_CREDITS_CONFIG[appId];
                        return (
                            <div
                                key={appId}
                                className="p-4 rounded-lg border border-theme bg-[var(--bg-app)]"
                            >
                                <h4 className="font-medium">{config.appName}</h4>
                                <p className="text-sm text-secondary mt-1">{config.description}</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-secondary">
                                    <span className="material-symbols-outlined text-sm">payments</span>
                                    {config.monthlyLimit} {config.creditUnitPlural}/maand
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
