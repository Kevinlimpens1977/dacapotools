/**
 * AdminToolForm Page
 * 
 * Tool create/edit form for admin dashboard.
 * Uses predefined labels with validation.
 * 
 * Label Rules:
 * - Exactly ONE primary functional label required
 * - Optional "Extern" secondary label
 * - If Extern: externalUrl required, opens in new tab
 * - If not Extern: internalRoute required, opens internally
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTools } from '../../hooks/useTools';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageCropper from '../../components/ImageCropper';
import {
    PRIMARY_LABELS,
    EXTERN_LABEL,
    getPrimaryLabel,
    isExternalTool,
    validateLabels
} from '../../config/toolLabels';
import ToolCardPreview from '../../components/ToolCardPreview';

export default function AdminToolForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSupervisor } = useAuth();
    const { addTool, updateTool } = useTools();
    const { uploadToolImage, uploadImage } = useImageUpload();

    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        labels: [],
        url: '',
        externalUrl: '',
        internalRoute: '',
        imageUrl: '',
        status: 'draft',
        isActive: true
    });
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Image handling
    const [showCropper, setShowCropper] = useState(false);
    const [cropImage, setCropImage] = useState(null);
    const fileInputRef = useRef(null);

    // Derived state from labels
    const selectedPrimaryLabel = getPrimaryLabel(formData.labels);
    const isExternal = isExternalTool(formData.labels);

    // No edit access for non-supervisors
    if (!isSupervisor) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-yellow-500">warning</span>
                    <h2 className="text-xl font-bold mt-4">Alleen-lezen toegang</h2>
                    <p className="text-secondary mt-2">
                        Je hebt geen rechten om tools te bewerken.
                    </p>
                    <button
                        onClick={() => navigate('/admin/tools')}
                        className="mt-4 px-4 py-2 bg-[#2860E0] text-white rounded-lg"
                    >
                        Terug naar Tools
                    </button>
                </div>
            </div>
        );
    }

    // Load existing tool data
    useEffect(() => {
        if (isEditing && id) {
            const loadTool = async () => {
                try {
                    const toolRef = doc(db, 'tools', id);
                    const toolSnap = await getDoc(toolRef);

                    if (toolSnap.exists()) {
                        const data = toolSnap.data();
                        setFormData({
                            name: data.name || '',
                            description: data.description || '',
                            shortDescription: data.shortDescription || '',
                            labels: data.labels || [],
                            url: data.url || data.externalUrl || '',
                            externalUrl: data.url || data.externalUrl || '',
                            internalRoute: data.internalRoute || '',
                            imageUrl: data.imageUrl || '',
                            status: data.status || 'draft',
                            isActive: data.isActive !== false
                        });
                    }
                } catch (err) {
                    console.error('Error loading tool:', err);
                    setError('Fout bij laden van tool');
                } finally {
                    setLoading(false);
                }
            };
            loadTool();
        }
    }, [id, isEditing]);

    // Handle primary label selection
    const handlePrimaryLabelChange = (labelId) => {
        setFormData(prev => {
            const hasExtern = prev.labels.includes('extern');
            const newLabels = hasExtern ? [labelId, 'extern'] : [labelId];
            return { ...prev, labels: newLabels };
        });
    };



    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate name
        if (!formData.name.trim()) {
            setError('Naam is verplicht');
            return;
        }

        // Validate labels
        const labelValidation = validateLabels(formData.labels);
        if (!labelValidation.valid) {
            setError(labelValidation.error);
            return;
        }

        // Validate URL
        if (!formData.url && !formData.externalUrl) {
            setError('Website URL is verplicht');
            return;
        }

        try {
            setSaving(true);

            // Prepare data for saving
            const saveData = {
                ...formData,
                url: formData.url || formData.externalUrl, // Ensure url is set
                internalRoute: null // Explicitly clear internalRoute
            };

            if (isEditing) {
                await updateTool(id, saveData);
            } else {
                await addTool(saveData);
            }

            navigate('/admin/tools');
        } catch (err) {
            console.error('Error saving tool:', err);
            setError('Fout bij opslaan');
        } finally {
            setSaving(false);
        }
    };

    // Handle image file selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setCropImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle cropped image
    const handleCroppedImage = async (croppedFile) => {
        try {
            // Use generic uploadImage to ensure unique filename and rules compliance
            const url = await uploadImage(croppedFile, 'tool-images');
            setFormData(prev => ({ ...prev, imageUrl: url }));
            setShowCropper(false);
            setCropImage(null);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Fout bij uploaden afbeelding: ' + (err.message || 'Onbekende fout'));
        }
    };

    // Handle paste event
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = () => {
                        setCropImage(reader.result);
                        setShowCropper(true);
                    };
                    reader.readAsDataURL(blob);
                    e.preventDefault(); // Prevent default paste behavior if we handled an image
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

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
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold">
                    {isEditing ? 'Tool Bewerken' : 'Nieuwe Tool'}
                </h2>
                <p className="text-secondary mt-1">
                    {isEditing ? 'Bewerk de tool gegevens' : 'Voeg een nieuwe tool toe aan het platform'}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column - Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-card rounded-xl border border-theme p-5 space-y-4">
                            <h3 className="font-semibold">Basis Informatie</h3>

                            <div>
                                <label className="block text-sm font-medium mb-2">Naam *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-50 dark:bg-gray-800"
                                    placeholder="Tool naam..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Korte Beschrijving</label>
                                <input
                                    type="text"
                                    value={formData.shortDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-50 dark:bg-gray-800"
                                    placeholder="Korte beschrijving (max 100 karakters)..."
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Beschrijving</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full h-32 px-4 py-3 rounded-lg border border-theme bg-gray-50 dark:bg-gray-800 resize-none"
                                    placeholder="Uitgebreide beschrijving..."
                                />
                                <div className="text-xs text-secondary space-y-1">
                                    <p className="font-medium">Opmaak ondersteuning:</p>
                                    <ul className="list-disc list-inside space-y-0.5 opacity-80">
                                        <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">- lijsten</code> (gebruik liggend streepje)</li>
                                        <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">**vetgedrukt**</code></li>
                                        <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">*cursief*</code></li>
                                        <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">### Koptekst</code></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="bg-card rounded-xl border border-theme p-5 space-y-4">
                            <h3 className="font-semibold">Classificatie *</h3>
                            <p className="text-sm text-secondary">
                                Kies exact één primair label. Markeer als "Extern" indien de tool buiten DaCapoTools opent.
                            </p>

                            {/* Primary Label Selection */}
                            <div>
                                <p className="text-sm font-medium mb-3">Primair Label</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {PRIMARY_LABELS.map(label => (
                                        <button
                                            key={label.id}
                                            type="button"
                                            onClick={() => handlePrimaryLabelChange(label.id)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${selectedPrimaryLabel === label.id
                                                ? 'border-transparent text-white'
                                                : 'border-theme bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            style={selectedPrimaryLabel === label.id ? { backgroundColor: label.color } : {}}
                                        >
                                            <span className="material-symbols-outlined text-xl">{label.icon}</span>
                                            <span className="text-sm font-medium truncate">{label.name}</span>
                                        </button>
                                    ))}
                                </div>
                                {!selectedPrimaryLabel && (
                                    <p className="text-xs text-red-500 mt-2">Selecteer een primair label</p>
                                )}
                            </div>

                            {/* Extern Toggle Removed - All tools are external/web based now */}
                        </div>

                        {/* Website URL Configuration */}
                        <div className="bg-card rounded-xl border border-theme p-5 space-y-4">
                            <h3 className="font-semibold">
                                Website Link
                            </h3>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Website URL
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.url || formData.externalUrl || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            url: val,
                                            externalUrl: val, // Keep in sync for now
                                            internalRoute: '' // Clear legacy
                                        }));
                                    }}
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-50 dark:bg-gray-800"
                                    placeholder="https://example.com"
                                    required
                                />
                                <p className="text-xs text-secondary mt-2">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">open_in_new</span>
                                    Link opent altijd in een nieuw tabblad.
                                </p>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-card rounded-xl border border-theme p-5 space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                Afbeelding
                                <span className="text-xs font-normal text-secondary px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    Ctrl+V ondersteund
                                </span>
                            </h3>

                            <div className="flex items-start gap-4">
                                <div
                                    className="size-24 rounded-lg border-2 border-dashed border-theme flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden cursor-pointer shrink-0 transition-colors hover:border-[#2860E0]"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Klik om te uploaden of plak een afbeelding"
                                >
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-gray-400">add_photo_alternate</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 border border-theme rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mb-2"
                                    >
                                        Kies Afbeelding
                                    </button>
                                    <p className="text-xs text-secondary">
                                        Sleep een afbeelding hierheen, <span className="text-[#2860E0] font-medium">plak vanaf klembord (Ctrl+V)</span>, of klik om te kiezen.
                                    </p>
                                    <p className="text-xs text-secondary mt-1">
                                        PNG, JPG of GIF. Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-card rounded-xl border border-theme p-5 space-y-4">
                            <h3 className="font-semibold">Status</h3>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="draft"
                                        checked={formData.status === 'draft'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="text-[#2860E0]"
                                    />
                                    <span>Concept</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="published"
                                        checked={formData.status === 'published'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="text-[#2860E0]"
                                    />
                                    <span>Gepubliceerd</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/tools')}
                                className="px-6 py-3 border border-theme rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Annuleren
                            </button>

                            <button
                                type="submit"
                                disabled={saving || !selectedPrimaryLabel}
                                className="px-6 py-3 bg-[#2860E0] text-white rounded-lg hover:bg-[#1C4DAB] disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                        Opslaan...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        {isEditing ? 'Opslaan' : 'Aanmaken'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column - Live Preview */}
                <div className="lg:col-span-1">
                    <div className="sticky top-20">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">visibility</span>
                            Live Preview
                        </h3>

                        <div className="space-y-4">
                            <ToolCardPreview tool={formData} />

                            <div className="p-4 bg-blue-500/10 rounded-lg text-sm text-blue-600 dark:text-blue-400">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    Tip
                                </p>
                                <p>
                                    Deze preview toont hoe de kaart er exact uit zal zien voor gebruikers. De beschrijving scrolt wanneer de gebruiker eroverheen muist.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && cropImage && (
                <ImageCropper
                    imageUrl={cropImage}
                    onCrop={handleCroppedImage}
                    onCancel={() => {
                        setShowCropper(false);
                        setCropImage(null);
                    }}
                />
            )}
        </div>
    );
}
