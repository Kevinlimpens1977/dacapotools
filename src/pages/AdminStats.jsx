import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useLabels } from '../hooks/useLabels';

export default function AdminStats() {
    const { isAdmin } = useAuth();
    const { tools, loading: toolsLoading } = useTools();
    const { labels } = useLabels();

    // Calculate statistics
    const stats = useMemo(() => {
        if (!tools.length) return null;

        // Sort by clicks (descending)
        const byClicks = [...tools].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));

        // Sort by favorites (descending)
        const byFavorites = [...tools].sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));

        // Unused tools (0 clicks)
        const unused = tools.filter(t => !t.clickCount || t.clickCount === 0);

        // Inactive tools
        const inactive = tools.filter(t => t.isActive === false);

        // Total stats
        const totalClicks = tools.reduce((sum, t) => sum + (t.clickCount || 0), 0);
        const totalFavorites = tools.reduce((sum, t) => sum + (t.favoriteCount || 0), 0);

        return {
            topClicked: byClicks.slice(0, 5),
            topFavorited: byFavorites.slice(0, 5),
            unused,
            inactive,
            totalTools: tools.length,
            activeTools: tools.filter(t => t.isActive !== false).length,
            totalClicks,
            totalFavorites,
            allTools: byClicks // All tools sorted by clicks
        };
    }, [tools]);

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-500">block</span>
                    <h1 className="text-2xl font-bold mt-4">Geen toegang</h1>
                    <Link to="/" className="text-[#2860E0] hover:underline mt-4 inline-block">
                        Terug naar dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (toolsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin">
                    <span className="material-symbols-outlined text-4xl">sync</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-theme">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin"
                            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-lg font-bold">Statistieken</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Global Stats */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card rounded-xl border border-theme p-4 text-center">
                        <span className="material-symbols-outlined text-3xl text-[#2860E0]">apps</span>
                        <p className="text-3xl font-bold mt-2">{stats?.totalTools || 0}</p>
                        <p className="text-sm text-secondary">Totaal tools</p>
                    </div>
                    <div className="bg-card rounded-xl border border-theme p-4 text-center">
                        <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span>
                        <p className="text-3xl font-bold mt-2">{stats?.activeTools || 0}</p>
                        <p className="text-sm text-secondary">Actieve tools</p>
                    </div>
                    <div className="bg-card rounded-xl border border-theme p-4 text-center">
                        <span className="material-symbols-outlined text-3xl text-purple-500">ads_click</span>
                        <p className="text-3xl font-bold mt-2">{stats?.totalClicks || 0}</p>
                        <p className="text-sm text-secondary">Totaal clicks</p>
                    </div>
                    <div className="bg-card rounded-xl border border-theme p-4 text-center">
                        <span className="material-symbols-outlined text-3xl text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        <p className="text-3xl font-bold mt-2">{stats?.totalFavorites || 0}</p>
                        <p className="text-sm text-secondary">Totaal favorieten</p>
                    </div>
                </section>

                {/* Top Clicked */}
                <section className="bg-card rounded-xl border border-theme p-5">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">trending_up</span>
                        Meest Geklikt
                    </h2>
                    {stats?.topClicked?.length > 0 ? (
                        <div className="space-y-2">
                            {stats.topClicked.map((tool, i) => (
                                <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-secondary w-6">{i + 1}</span>
                                        <div
                                            className="size-8 rounded-md bg-cover bg-center bg-gray-200 dark:bg-gray-700"
                                            style={tool.imageUrl ? { backgroundImage: `url('${tool.imageUrl}')` } : {}}
                                        />
                                        <span className="font-medium">{tool.name}</span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-500">{tool.clickCount || 0}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary">Nog geen click data</p>
                    )}
                </section>

                {/* Top Favorited */}
                <section className="bg-card rounded-xl border border-theme p-5">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        Meest Gefavoriet
                    </h2>
                    {stats?.topFavorited?.filter(t => t.favoriteCount > 0).length > 0 ? (
                        <div className="space-y-2">
                            {stats.topFavorited.filter(t => t.favoriteCount > 0).map((tool, i) => (
                                <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-secondary w-6">{i + 1}</span>
                                        <div
                                            className="size-8 rounded-md bg-cover bg-center bg-gray-200 dark:bg-gray-700"
                                            style={tool.imageUrl ? { backgroundImage: `url('${tool.imageUrl}')` } : {}}
                                        />
                                        <span className="font-medium">{tool.name}</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-500">{tool.favoriteCount || 0}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary">Nog geen favorieten</p>
                    )}
                </section>

                {/* Unused Tools */}
                {stats?.unused?.length > 0 && (
                    <section className="bg-card rounded-xl border border-theme p-5">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                            Ongebruikte Tools ({stats.unused.length})
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {stats.unused.map(tool => (
                                <Link
                                    key={tool.id}
                                    to={`/admin/tool/${tool.id}`}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="font-medium">{tool.name}</span>
                                    <span className="material-symbols-outlined text-sm text-secondary">edit</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* All Tools Table */}
                <section className="bg-card rounded-xl border border-theme p-5">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2860E0]">list</span>
                        Alle Tools
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-theme">
                                    <th className="text-left py-2 px-3 text-sm font-semibold">Tool</th>
                                    <th className="text-center py-2 px-3 text-sm font-semibold">Clicks</th>
                                    <th className="text-center py-2 px-3 text-sm font-semibold">Favorieten</th>
                                    <th className="text-center py-2 px-3 text-sm font-semibold">Status</th>
                                    <th className="text-right py-2 px-3 text-sm font-semibold">Actie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.allTools?.map(tool => (
                                    <tr key={tool.id} className="border-b border-theme/50 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-8 rounded-md bg-cover bg-center bg-gray-200 dark:bg-gray-700 shrink-0"
                                                    style={tool.imageUrl ? { backgroundImage: `url('${tool.imageUrl}')` } : {}}
                                                />
                                                <span className="font-medium truncate">{tool.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-3 font-semibold text-purple-500">
                                            {tool.clickCount || 0}
                                        </td>
                                        <td className="text-center py-3 px-3 font-semibold text-red-500">
                                            {tool.favoriteCount || 0}
                                        </td>
                                        <td className="text-center py-3 px-3">
                                            {tool.isActive !== false ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                    Actief
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                    Inactief
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-right py-3 px-3">
                                            <Link
                                                to={`/admin/tool/${tool.id}`}
                                                className="text-[#2860E0] hover:underline text-sm"
                                            >
                                                Bewerken
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
