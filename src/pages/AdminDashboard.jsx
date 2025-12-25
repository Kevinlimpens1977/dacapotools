import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useLabels } from '../hooks/useLabels';

export default function AdminDashboard() {
    const { user, isAdmin } = useAuth();
    const { tools, deleteTool } = useTools();
    const { labels } = useLabels();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-500">block</span>
                    <h1 className="text-2xl font-bold mt-4">Geen toegang</h1>
                    <p className="text-secondary mt-2">Je hebt geen admin rechten.</p>
                    <Link to="/" className="text-[#2860E0] hover:underline mt-4 inline-block">
                        Terug naar dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const handleDelete = async (toolId) => {
        await deleteTool(toolId);
        setDeleteConfirm(null);
    };

    const getLabelName = (labelId) => {
        const label = labels.find(l => l.id === labelId);
        return label?.name || labelId;
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-theme">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-lg font-bold">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/admin/stats"
                            className="px-4 py-2 rounded-lg border border-theme hover:bg-gray-500/10 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">analytics</span>
                            Statistieken
                        </Link>
                        <Link
                            to="/admin/labels"
                            className="px-4 py-2 rounded-lg border border-theme hover:bg-gray-500/10 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">label</span>
                            Labels
                        </Link>
                        <Link
                            to="/admin/tool/new"
                            className="px-4 py-2 rounded-lg bg-[#2860E0] text-white hover:bg-[#1C4DAB] transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Nieuwe Tool
                        </Link>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4">
                <div className="bg-card rounded-lg border border-theme p-4">
                    <p className="text-secondary text-sm">Totaal Tools</p>
                    <p className="text-3xl font-bold mt-1">{tools.length}</p>
                </div>
                <div className="bg-card rounded-lg border border-theme p-4">
                    <p className="text-secondary text-sm">Labels</p>
                    <p className="text-3xl font-bold mt-1">{labels.length}</p>
                </div>
                <div className="bg-card rounded-lg border border-theme p-4">
                    <p className="text-secondary text-sm">Totaal Likes</p>
                    <p className="text-3xl font-bold mt-1">
                        {tools.reduce((sum, t) => sum + (t.favoriteCount || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Tools Table */}
            <div className="p-4">
                <div className="bg-card rounded-lg border border-theme overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-theme">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold">Tool</th>
                                <th className="text-left px-4 py-3 font-semibold">Labels</th>
                                <th className="text-center px-4 py-3 font-semibold">
                                    <span className="material-symbols-outlined text-xl">favorite</span>
                                </th>
                                <th className="text-right px-4 py-3 font-semibold">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tools.map((tool) => (
                                <tr key={tool.id} className="border-b border-theme last:border-0 hover:bg-gray-500/5">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-10 rounded-md bg-cover bg-center border border-theme bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"
                                                style={tool.imageUrl ? { backgroundImage: `url('${tool.imageUrl}')` } : {}}
                                            >
                                                {!tool.imageUrl && (
                                                    <span className="material-symbols-outlined text-gray-400">apps</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{tool.name}</p>
                                                <p className="text-sm text-secondary truncate max-w-xs">{tool.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {tool.labels?.map(labelId => (
                                                <span
                                                    key={labelId}
                                                    className="px-2 py-0.5 bg-[#2860E0]/10 text-[#2860E0] text-xs rounded-full"
                                                >
                                                    {getLabelName(labelId)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-red-500 text-sm filled">favorite</span>
                                            {tool.favoriteCount || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/tool/${tool.id}`}
                                                className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
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
                                                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
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
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {tools.length === 0 && (
                        <div className="text-center py-12 text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                            <p>Nog geen tools toegevoegd</p>
                            <Link
                                to="/admin/tool/new"
                                className="mt-2 text-[#2860E0] hover:underline inline-block"
                            >
                                Voeg je eerste tool toe
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
