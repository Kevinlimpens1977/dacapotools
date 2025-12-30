/**
 * AdminTools Page
 * 
 * Tools management page for the admin dashboard.
 * Shows all tools with status, labels, and actions.
 * Role-aware: edit actions hidden for admin (read-only).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import { useLabels } from '../../hooks/useLabels';

export default function AdminTools() {
    const { isSupervisor } = useAuth();
    const { tools, deleteTool, loading } = useTools();
    const { labels } = useLabels();
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filter, setFilter] = useState('all'); // all, published, draft, inactive

    const handleDelete = async (toolId) => {
        await deleteTool(toolId);
        setDeleteConfirm(null);
    };

    const getLabelName = (labelId) => {
        const label = labels.find(l => l.id === labelId);
        return label?.name || labelId;
    };

    const getLabelColor = (labelId) => {
        const label = labels.find(l => l.id === labelId);
        return label?.color || '#2860E0';
    };

    // Filter tools
    const filteredTools = tools.filter(tool => {
        if (filter === 'all') return true;
        if (filter === 'published') return tool.status === 'published';
        if (filter === 'draft') return tool.status === 'draft' || !tool.status;
        if (filter === 'inactive') return tool.isActive === false;
        return true;
    });

    // Stats
    const stats = {
        all: tools.length,
        published: tools.filter(t => t.status === 'published').length,
        draft: tools.filter(t => t.status === 'draft' || !t.status).length,
        inactive: tools.filter(t => t.isActive === false).length
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

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tools</h2>
                    <p className="text-secondary mt-1">
                        Beheer alle tools in het platform
                    </p>
                </div>
                {isSupervisor && (
                    <Link
                        to="/admin/tools/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Nieuwe Tool
                    </Link>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-theme pb-4">
                {[
                    { key: 'all', label: 'Alles', count: stats.all },
                    { key: 'published', label: 'Gepubliceerd', count: stats.published },
                    { key: 'draft', label: 'Concept', count: stats.draft },
                    { key: 'inactive', label: 'Inactief', count: stats.inactive }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab.key
                            ? 'bg-[#2860E0] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key
                            ? 'bg-white/20'
                            : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tools Table */}
            <div className="bg-card rounded-xl border border-theme overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-theme">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Tool</th>
                            <th className="text-left px-4 py-3 font-semibold">Status</th>
                            <th className="text-left px-4 py-3 font-semibold">Labels</th>
                            <th className="text-center px-4 py-3 font-semibold">Clicks</th>
                            <th className="text-center px-4 py-3 font-semibold">
                                <span className="material-symbols-outlined text-lg">favorite</span>
                            </th>
                            {isSupervisor && (
                                <th className="text-right px-4 py-3 font-semibold">Acties</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTools.length === 0 ? (
                            <tr>
                                <td colSpan={isSupervisor ? 6 : 5} className="px-4 py-12 text-center text-secondary">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                                    <p>Geen tools gevonden</p>
                                </td>
                            </tr>
                        ) : (
                            filteredTools.map((tool) => (
                                <tr key={tool.id} className="border-b border-theme last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-12 rounded-lg bg-cover bg-center border border-theme bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
                                                style={tool.imageUrl ? { backgroundImage: `url('${tool.imageUrl}')` } : {}}
                                            >
                                                {!tool.imageUrl && (
                                                    <span className="material-symbols-outlined text-gray-400">apps</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{tool.name}</p>
                                                <p className="text-sm text-secondary truncate max-w-xs">
                                                    {tool.shortDescription || tool.description}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tool.status === 'published'
                                            ? 'bg-green-500/10 text-green-600'
                                            : tool.isActive === false
                                                ? 'bg-gray-500/10 text-gray-600'
                                                : 'bg-yellow-500/10 text-yellow-600'
                                            }`}>
                                            <span className={`size-2 rounded-full ${tool.status === 'published'
                                                ? 'bg-green-500'
                                                : tool.isActive === false
                                                    ? 'bg-gray-500'
                                                    : 'bg-yellow-500'
                                                }`} />
                                            {tool.status === 'published'
                                                ? 'Gepubliceerd'
                                                : tool.isActive === false
                                                    ? 'Inactief'
                                                    : 'Concept'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {tool.labels?.slice(0, 3).map(labelId => (
                                                <span
                                                    key={labelId}
                                                    className="px-2 py-0.5 text-xs rounded-full"
                                                    style={{
                                                        backgroundColor: `${getLabelColor(labelId)}20`,
                                                        color: getLabelColor(labelId)
                                                    }}
                                                >
                                                    {getLabelName(labelId)}
                                                </span>
                                            ))}
                                            {tool.labels?.length > 3 && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                                    +{tool.labels.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-secondary">
                                        {tool.clickCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 text-secondary">
                                            <span className="material-symbols-outlined text-red-500 text-sm filled">favorite</span>
                                            {tool.favoriteCount || 0}
                                        </span>
                                    </td>
                                    {isSupervisor && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to={`/admin/tools/${tool.id}`}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Bewerken"
                                                >
                                                    <span className="material-symbols-outlined">edit</span>
                                                </Link>
                                                {deleteConfirm === tool.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(tool.id)}
                                                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                            title="Bevestig verwijderen"
                                                        >
                                                            <span className="material-symbols-outlined">check</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                            title="Annuleren"
                                                        >
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(tool.id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                                        title="Verwijderen"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
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
