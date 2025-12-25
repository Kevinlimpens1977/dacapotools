import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useLabels } from '../hooks/useLabels';
import { useImageUpload } from '../hooks/useImageUpload';

export default function AdminToolForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { addTool, updateTool } = useTools();
    const { labels } = useLabels();
    const { uploadImage, uploading, progress } = useImageUpload();
    const fileInputRef = useRef(null);

    const isEditMode = id && id !== 'new';

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        link: '',
        imageUrl: '',
        labels: [],
        isActive: true
    });
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchTool = async () => {
                try {
                    const toolRef = doc(db, 'tools', id);
                    const toolSnap = await getDoc(toolRef);
                    if (toolSnap.exists()) {
                        const data = toolSnap.data();
                        setFormData({
                            name: data.name || '',
                            description: data.description || '',
                            link: data.link || '',
                            imageUrl: data.imageUrl || '',
                            labels: data.labels || [],
                            isActive: data.isActive !== false
                        });
                    } else {
                        setError('Tool niet gevonden');
                    }
                } catch (err) {
                    setError('Fout bij ophalen tool');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTool();
        }
    }, [id, isEditMode]);

    // Handle paste for image upload
    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        try {
                            const url = await uploadImage(file, 'tools');
                            setFormData(prev => ({ ...prev, imageUrl: url }));
                        } catch (err) {
                            setError('Fout bij uploaden afbeelding');
                        }
                    }
                    break;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [uploadImage]);

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLabelToggle = (labelId) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.includes(labelId)
                ? prev.labels.filter(id => id !== labelId)
                : [...prev.labels, labelId]
        }));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setError(null);
                const url = await uploadImage(file, 'tools');
                setFormData(prev => ({ ...prev, imageUrl: url }));
            } catch (err) {
                setError('Fout bij uploaden afbeelding: ' + err.message);
            }
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                await updateTool(id, formData);
            } else {
                await addTool(formData);
            }
            navigate('/admin');
        } catch (err) {
            setError('Fout bij opslaan tool');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h1 className="text-lg font-bold">
                            {isEditMode ? 'Tool Bewerken' : 'Nieuwe Tool Toevoegen'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 pb-32">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                {/* Tool Details */}
                <section className="bg-card rounded-xl border border-theme p-5 mb-4">
                    <h2 className="text-lg font-bold mb-4">Tool Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold mb-2">
                                Naam van Tool *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="bijv. Canvas LMS"
                                className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold mb-2">
                                Beschrijving *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="Voer hier een beschrijving van de tool in..."
                                className="w-full px-4 py-3 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow resize-y"
                            />
                        </div>

                        <div>
                            <label htmlFor="link" className="block text-sm font-semibold mb-2">
                                Tool Link *
                            </label>
                            <input
                                type="url"
                                id="link"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                required
                                placeholder="https://..."
                                className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>
                </section>

                {/* Tool Image */}
                <section className="bg-card rounded-xl border border-theme p-5 mb-4">
                    <h2 className="text-lg font-bold mb-4">Tool Afbeelding</h2>

                    <div className="flex items-start gap-4">
                        <div
                            className="size-20 rounded-lg border-2 border-dashed border-theme flex items-center justify-center bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0"
                            style={formData.imageUrl ? {
                                backgroundImage: `url('${formData.imageUrl}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderStyle: 'solid'
                            } : {}}
                        >
                            {!formData.imageUrl && (
                                <span className="material-symbols-outlined text-4xl text-gray-400">broken_image</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-12 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-semibold border border-theme disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                        Uploaden... {progress}%
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">upload</span>
                                        Upload Afbeelding
                                    </>
                                )}
                            </button>

                            {formData.imageUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="w-full h-10 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Afbeelding verwijderen
                                </button>
                            )}

                            <p className="text-xs text-secondary">
                                Of plak een afbeelding met Ctrl+V. Max 5MB.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Labels */}
                <section className="bg-card rounded-xl border border-theme p-5 mb-4">
                    <h2 className="text-lg font-bold mb-4">Labels</h2>

                    <div className="flex flex-wrap gap-2">
                        {labels.map(label => {
                            const isSelected = formData.labels.includes(label.id);
                            const labelColor = label.color || '#2860E0';
                            return (
                                <button
                                    key={label.id}
                                    type="button"
                                    onClick={() => handleLabelToggle(label.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${isSelected
                                        ? 'text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    style={isSelected ? { backgroundColor: labelColor } : { borderColor: labelColor, borderWidth: '2px', color: labelColor }}
                                >
                                    {label.icon && (
                                        <span className="material-symbols-outlined text-lg">{label.icon}</span>
                                    )}
                                    <span className="text-sm font-medium">{label.name}</span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {labels.length === 0 && (
                        <p className="text-secondary">
                            Nog geen labels. <Link to="/admin/labels" className="text-[#2860E0] hover:underline">Voeg labels toe</Link>
                        </p>
                    )}
                </section>

                {/* Active Toggle */}
                <section className="bg-card rounded-xl border border-theme p-5 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Tool Actief</h2>
                            <p className="text-sm text-secondary">
                                Inactieve tools worden niet getoond op het dashboard
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2860E0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </section>

                {/* Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-md max-w-2xl mx-auto">
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Opslaan...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                {isEditMode ? 'Wijzigingen Opslaan' : 'Tool Toevoegen aan Dashboard'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
