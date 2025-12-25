import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLabels } from '../hooks/useLabels';
import { useTools } from '../hooks/useTools';

// Common Material icons for labels
const ICON_OPTIONS = [
    'school', 'work', 'folder', 'groups', 'mail', 'chat', 'video_call',
    'calendar_month', 'assignment', 'description', 'settings', 'build',
    'analytics', 'admin_panel_settings', 'manage_accounts', 'support',
    'security', 'cloud', 'devices', 'computer', 'phone_android'
];

// Predefined color palette for labels
const COLOR_OPTIONS = [
    { name: 'Blauw', value: '#2860E0', bg: 'bg-blue-500' },
    { name: 'Groen', value: '#22C55E', bg: 'bg-green-500' },
    { name: 'Rood', value: '#EF4444', bg: 'bg-red-500' },
    { name: 'Oranje', value: '#F97316', bg: 'bg-orange-500' },
    { name: 'Paars', value: '#A855F7', bg: 'bg-purple-500' },
    { name: 'Roze', value: '#EC4899', bg: 'bg-pink-500' },
    { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500' },
    { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
    { name: 'Amber', value: '#F59E0B', bg: 'bg-amber-500' },
    { name: 'Cyaan', value: '#06B6D4', bg: 'bg-cyan-500' },
];

export default function AdminLabels() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { labels, addLabel, updateLabel, deleteLabel } = useLabels();
    const { tools } = useTools();

    // Count how many tools use each label
    const labelUsage = useMemo(() => {
        const usage = {};
        labels.forEach(label => {
            usage[label.id] = tools.filter(tool =>
                tool.labels?.includes(label.id)
            ).length;
        });
        return usage;
    }, [labels, tools]);

    const [editingId, setEditingId] = useState(null);
    const [newLabel, setNewLabel] = useState({ name: '', icon: 'label', color: '#2860E0' });
    const [editData, setEditData] = useState({ name: '', icon: '', color: '' });
    const [showIconPicker, setShowIconPicker] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(null);

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

    const handleAddLabel = async (e) => {
        e.preventDefault();
        if (!newLabel.name.trim()) return;

        await addLabel(newLabel);
        setNewLabel({ name: '', icon: 'label', color: '#2860E0' });
    };

    const handleStartEdit = (label) => {
        setEditingId(label.id);
        setEditData({
            name: label.name,
            icon: label.icon || 'label',
            color: label.color || '#2860E0'
        });
    };

    const handleSaveEdit = async () => {
        if (!editData.name.trim()) return;

        await updateLabel(editingId, editData);
        setEditingId(null);
        setShowColorPicker(null);
        setShowIconPicker(null);
    };

    const handleDelete = async (labelId) => {
        const usageCount = labelUsage[labelId] || 0;
        if (usageCount > 0) {
            alert(`Dit label wordt gebruikt door ${usageCount} tool(s) en kan niet worden verwijderd.`);
            return;
        }
        if (confirm('Weet je zeker dat je dit label wilt verwijderen?')) {
            await deleteLabel(labelId);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-theme">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold">Labels Beheren</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4">
                {/* Add New Label */}
                <section className="bg-card rounded-xl border border-theme p-5 mb-6">
                    <h2 className="text-lg font-bold mb-4">Nieuw Label Toevoegen</h2>

                    <form onSubmit={handleAddLabel} className="flex gap-3 flex-wrap">
                        {/* Icon Picker */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowIconPicker(showIconPicker === 'new' ? null : 'new');
                                    setShowColorPicker(null);
                                }}
                                className="size-12 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                style={{ color: newLabel.color }}
                            >
                                <span className="material-symbols-outlined">{newLabel.icon}</span>
                            </button>

                            {showIconPicker === 'new' && (
                                <div className="absolute top-14 left-0 z-10 bg-card border border-theme rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 w-64">
                                    {ICON_OPTIONS.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => {
                                                setNewLabel(prev => ({ ...prev, icon }));
                                                setShowIconPicker(null);
                                            }}
                                            className={`size-10 rounded-lg flex items-center justify-center hover:bg-gray-500/10 transition-colors ${newLabel.icon === icon ? 'ring-2 ring-offset-2' : ''}`}
                                            style={newLabel.icon === icon ? { backgroundColor: newLabel.color, color: 'white' } : {}}
                                        >
                                            <span className="material-symbols-outlined">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Color Picker */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowColorPicker(showColorPicker === 'new' ? null : 'new');
                                    setShowIconPicker(null);
                                }}
                                className="size-12 rounded-lg border-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ borderColor: newLabel.color, color: newLabel.color }}
                            >
                                <span className="material-symbols-outlined">palette</span>
                            </button>

                            {showColorPicker === 'new' && (
                                <div className="absolute top-14 left-0 z-10 bg-card border border-theme rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 w-56">
                                    {COLOR_OPTIONS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => {
                                                setNewLabel(prev => ({ ...prev, color: color.value }));
                                                setShowColorPicker(null);
                                            }}
                                            className={`size-9 rounded-full transition-transform hover:scale-110 ${newLabel.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <input
                            type="text"
                            value={newLabel.name}
                            onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Label naam..."
                            className="flex-1 h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow min-w-[150px]"
                        />

                        <button
                            type="submit"
                            className="px-6 h-12 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] transition-colors flex items-center gap-2 font-semibold"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Toevoegen
                        </button>
                    </form>
                </section>

                {/* Existing Labels */}
                <section className="bg-card rounded-xl border border-theme overflow-hidden">
                    <div className="px-5 py-3 border-b border-theme">
                        <h2 className="font-bold">Bestaande Labels ({labels.length})</h2>
                    </div>

                    <div className="divide-y divide-[var(--border-light)] dark:divide-[var(--border-dark)]">
                        {labels.map(label => (
                            <div key={label.id} className="p-4 flex items-center gap-3">
                                {editingId === label.id ? (
                                    // Edit mode
                                    <>
                                        {/* Icon Picker */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowIconPicker(showIconPicker === label.id ? null : label.id);
                                                    setShowColorPicker(null);
                                                }}
                                                className="size-10 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                                                style={{ color: editData.color }}
                                            >
                                                <span className="material-symbols-outlined">{editData.icon}</span>
                                            </button>

                                            {showIconPicker === label.id && (
                                                <div className="absolute top-12 left-0 z-10 bg-card border border-theme rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 w-64">
                                                    {ICON_OPTIONS.map(icon => (
                                                        <button
                                                            key={icon}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditData(prev => ({ ...prev, icon }));
                                                                setShowIconPicker(null);
                                                            }}
                                                            className={`size-10 rounded-lg flex items-center justify-center hover:bg-gray-500/10 transition-colors ${editData.icon === icon ? 'ring-2' : ''}`}
                                                            style={editData.icon === icon ? { backgroundColor: editData.color, color: 'white' } : {}}
                                                        >
                                                            <span className="material-symbols-outlined">{icon}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Color Picker */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowColorPicker(showColorPicker === label.id ? null : label.id);
                                                    setShowIconPicker(null);
                                                }}
                                                className="size-10 rounded-lg border-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                                                style={{ borderColor: editData.color, color: editData.color }}
                                            >
                                                <span className="material-symbols-outlined text-sm">palette</span>
                                            </button>

                                            {showColorPicker === label.id && (
                                                <div className="absolute top-12 left-0 z-10 bg-card border border-theme rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 w-56">
                                                    {COLOR_OPTIONS.map(color => (
                                                        <button
                                                            key={color.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditData(prev => ({ ...prev, color: color.value }));
                                                                setShowColorPicker(null);
                                                            }}
                                                            className={`size-9 rounded-full transition-transform hover:scale-110 ${editData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                                            style={{ backgroundColor: color.value }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                            className="flex-1 h-10 px-3 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700"
                                        />

                                        <button
                                            onClick={handleSaveEdit}
                                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">check</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setShowColorPicker(null);
                                                setShowIconPicker(null);
                                            }}
                                            className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </>
                                ) : (
                                    // View mode
                                    <>
                                        <div
                                            className="size-10 rounded-lg flex items-center justify-center text-white"
                                            style={{ backgroundColor: label.color || '#2860E0' }}
                                        >
                                            <span className="material-symbols-outlined">{label.icon || 'label'}</span>
                                        </div>

                                        <div className="flex-1">
                                            <span className="font-medium">{label.name}</span>
                                            <span className="text-xs text-secondary ml-2">
                                                ({labelUsage[label.id] || 0} tools)
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleStartEdit(label)}
                                            className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(label.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {labels.length === 0 && (
                        <div className="text-center py-12 text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2 block">label_off</span>
                            <p>Nog geen labels aangemaakt</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
