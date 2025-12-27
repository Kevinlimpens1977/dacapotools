import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useLabels } from '../hooks/useLabels';
import { useImageUpload } from '../hooks/useImageUpload';
import ToolCardPreview from '../components/ToolCardPreview';
import ImageCropper from '../components/ImageCropper';

/**
 * AdminToolForm - Enhanced tool creation/editing form with live preview
 * Supports file upload, drag & drop, clipboard paste, and URL paste for images
 */
export default function AdminToolForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { addTool, updateTool } = useTools();
    const { labels } = useLabels();
    const { uploadToolImage, uploadFromUrl, uploading, progress, error: uploadError } = useImageUpload();
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const isEditMode = id && id !== 'new';

    // Form state with new fields
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        shortDescription: '',
        fullDescription: '',
        link: '',
        imageUrl: '',
        labels: [],
        tags: [],
        status: 'draft',
        isActive: true
    });

    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');

    // Image cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [pendingImageUrl, setPendingImageUrl] = useState(null);

    // Auto-generate slug from name
    const generateSlug = useCallback((name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }, []);

    // Update slug when name changes (only if slug hasn't been manually edited)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    useEffect(() => {
        if (!slugManuallyEdited && formData.name) {
            setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
        }
    }, [formData.name, slugManuallyEdited, generateSlug]);

    // Load existing tool data
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
                            slug: data.slug || generateSlug(data.name || ''),
                            shortDescription: data.shortDescription || data.description || '',
                            fullDescription: data.fullDescription || '',
                            link: data.link || '',
                            imageUrl: data.imageUrl || '',
                            labels: data.labels || [],
                            tags: data.tags || [],
                            status: data.status || 'draft',
                            isActive: data.isActive !== false
                        });
                        setSlugManuallyEdited(true); // Don't auto-update slug for existing tools
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
    }, [id, isEditMode, generateSlug]);

    // Validate form and update warnings
    useEffect(() => {
        const newWarnings = [];

        if (formData.fullDescription.length > 600) {
            newWarnings.push(`Volledige beschrijving is ${formData.fullDescription.length} tekens (aanbevolen: max 600)`);
        }

        setWarnings(newWarnings);
    }, [formData.fullDescription]);

    // Handle paste for image upload (clipboard paste) - now shows cropper
    useEffect(() => {
        const handlePaste = (e) => {
            if (!formData.slug) return;
            if (showCropper) return; // Don't intercept if cropper is open

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        setError(null);
                        const localUrl = URL.createObjectURL(file);
                        setPendingImageUrl(localUrl);
                        setShowCropper(true);
                    }
                    break;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [formData.slug, showCropper]);

    // Access check
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

    // Form handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSlugChange = (e) => {
        setSlugManuallyEdited(true);
        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleLabelToggle = (labelId) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.includes(labelId)
                ? prev.labels.filter(id => id !== labelId)
                : [...prev.labels, labelId]
        }));
    };

    // Tag handlers
    const handleAddTag = () => {
        if (newTag.trim() && formData.tags.length < 6) {
            const tag = newTag.trim();
            if (!formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            }
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    // Image upload handlers - now with cropping step

    // Helper to open cropper with an image
    const openCropperWithFile = (file) => {
        const localUrl = URL.createObjectURL(file);
        setPendingImageUrl(localUrl);
        setShowCropper(true);
    };

    const openCropperWithUrl = (url) => {
        setPendingImageUrl(url);
        setShowCropper(true);
    };

    // Handle cropped image from ImageCropper
    const handleCroppedImage = async (croppedFile) => {
        setShowCropper(false);
        if (pendingImageUrl && pendingImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(pendingImageUrl);
        }
        setPendingImageUrl(null);

        if (!formData.slug) {
            setError('Vul eerst een tool naam in om de slug te genereren');
            return;
        }

        try {
            setError(null);
            const url = await uploadToolImage(croppedFile, formData.slug);
            setFormData(prev => ({ ...prev, imageUrl: url }));
        } catch (err) {
            setError('Fout bij uploaden afbeelding: ' + err.message);
        }
    };

    const handleCropperCancel = () => {
        setShowCropper(false);
        if (pendingImageUrl && pendingImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(pendingImageUrl);
        }
        setPendingImageUrl(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && formData.slug) {
            setError(null);
            openCropperWithFile(file);
        } else if (!formData.slug) {
            setError('Vul eerst een tool naam in om de slug te genereren');
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (!formData.slug) {
            setError('Vul eerst een tool naam in om de slug te genereren');
            return;
        }

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setError(null);
            openCropperWithFile(file);
        }
    };

    const handleImageUrlUpload = () => {
        if (!imageUrlInput.trim()) return;
        if (!formData.slug) {
            setError('Vul eerst een tool naam in om de slug te genereren');
            return;
        }

        setError(null);
        // For URL, we just open it in the cropper directly
        openCropperWithUrl(imageUrlInput.trim());
        setImageUrlInput('');
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    // Validation
    const validateForm = (isPublishing = false) => {
        const errors = [];

        if (!formData.name.trim()) {
            errors.push('Tool naam is verplicht');
        }

        if (!formData.slug.trim()) {
            errors.push('Tool slug is verplicht');
        }

        if (!formData.shortDescription.trim()) {
            errors.push('Korte beschrijving is verplicht');
        }

        if (!formData.link.trim()) {
            errors.push('Tool link is verplicht');
        } else {
            try {
                new URL(formData.link);
            } catch {
                errors.push('Tool link moet een geldige URL zijn');
            }
        }

        // Publishing-specific validation
        if (isPublishing) {
            if (!formData.imageUrl) {
                errors.push('Een afbeelding is verplicht om te publiceren');
            }

            if (!formData.fullDescription || formData.fullDescription.length < 100) {
                errors.push('Volledige beschrijving moet minimaal 100 tekens bevatten om te publiceren');
            }
        }

        return errors;
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const isPublishing = formData.status === 'published';
        const validationErrors = validateForm(isPublishing);

        if (validationErrors.length > 0) {
            setError(validationErrors.join('. '));
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Prepare data with backwards compatibility
            const toolData = {
                ...formData,
                description: formData.shortDescription, // Keep for backwards compatibility
            };

            if (isEditMode) {
                await updateTool(id, toolData);
            } else {
                await addTool(toolData);
            }
            navigate('/admin');
        } catch (err) {
            setError('Fout bij opslaan tool');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Loading state
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
            {/* Image Cropper Modal */}
            {showCropper && pendingImageUrl && (
                <ImageCropper
                    imageUrl={pendingImageUrl}
                    onCrop={handleCroppedImage}
                    onCancel={handleCropperCancel}
                    aspectRatio={16 / 9}
                />
            )}
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

            {/* Main Content - Form + Preview */}
            <div className="max-w-6xl mx-auto p-4 pb-32 flex flex-col lg:flex-row gap-6">
                {/* Form Column */}
                <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                    {/* Error Display */}
                    {(error || uploadError) && (
                        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                            {error || uploadError}
                        </div>
                    )}

                    {/* Warnings Display */}
                    {warnings.length > 0 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg text-yellow-600">
                            {warnings.map((warning, i) => (
                                <p key={i}>{warning}</p>
                            ))}
                        </div>
                    )}

                    {/* Tool Details */}
                    <section className="bg-card rounded-xl border border-theme p-5">
                        <h2 className="text-lg font-bold mb-4">Tool Details</h2>

                        <div className="space-y-4">
                            {/* Name */}
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
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label htmlFor="slug" className="block text-sm font-semibold mb-2">
                                    Tool Slug * <span className="text-secondary font-normal">(auto-gegenereerd, bewerkbaar)</span>
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleSlugChange}
                                    required
                                    placeholder="canvas-lms"
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow font-mono text-sm"
                                />
                            </div>

                            {/* Short Description */}
                            <div>
                                <label htmlFor="shortDescription" className="block text-sm font-semibold mb-2">
                                    Korte Beschrijving * <span className="text-secondary font-normal">(voor toolkaart)</span>
                                </label>
                                <textarea
                                    id="shortDescription"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    placeholder="Korte beschrijving die op de toolkaart verschijnt..."
                                    className="w-full px-4 py-3 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow resize-y"
                                />
                                <p className="text-xs text-secondary mt-1">
                                    {formData.shortDescription.length} tekens
                                </p>
                            </div>

                            {/* Full Description */}
                            <div>
                                <label htmlFor="fullDescription" className="block text-sm font-semibold mb-2">
                                    Volledige Beschrijving <span className="text-secondary font-normal">(voor hover/scroll, min. 100 tekens voor publicatie)</span>
                                </label>
                                <textarea
                                    id="fullDescription"
                                    name="fullDescription"
                                    value={formData.fullDescription}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Uitgebreide beschrijving die verschijnt bij hover over de kaart..."
                                    className="w-full px-4 py-3 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow resize-y"
                                />
                                <p className={`text-xs mt-1 ${formData.fullDescription.length < 100 ? 'text-yellow-600' : formData.fullDescription.length > 600 ? 'text-yellow-600' : 'text-secondary'}`}>
                                    {formData.fullDescription.length} tekens
                                    {formData.fullDescription.length < 100 && ' (minimaal 100 voor publicatie)'}
                                    {formData.fullDescription.length > 600 && ' (aanbevolen: max 600)'}
                                </p>
                            </div>

                            {/* Link */}
                            <div>
                                <label htmlFor="link" className="block text-sm font-semibold mb-2">
                                    Tool Link (App URL) *
                                </label>
                                <input
                                    type="url"
                                    id="link"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://..."
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Tool Image */}
                    <section className="bg-card rounded-xl border border-theme p-5">
                        <h2 className="text-lg font-bold mb-4">Tool Afbeelding</h2>

                        <div className="space-y-4">
                            {/* Current Image Preview */}
                            {formData.imageUrl && (
                                <div className="flex items-start gap-4">
                                    <div
                                        className="size-24 rounded-lg border border-theme overflow-hidden bg-gray-100 dark:bg-gray-700"
                                        style={{
                                            backgroundImage: `url('${formData.imageUrl}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            Afbeelding geüpload
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="mt-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                            Verwijderen
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="bg-[#2860E0]/10 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Uploaden... {progress}%</p>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#2860E0] transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Drag & Drop Zone */}
                            <div
                                ref={dropZoneRef}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging
                                    ? 'border-[#2860E0] bg-[#2860E0]/10'
                                    : 'border-theme hover:border-[#2860E0]/50 hover:bg-gray-500/5'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-4xl mb-2 ${isDragging ? 'text-[#2860E0]' : 'text-secondary'}`}>
                                    cloud_upload
                                </span>
                                <p className="text-sm font-medium">
                                    {isDragging ? 'Laat los om te uploaden' : 'Sleep een afbeelding hierheen'}
                                </p>
                                <p className="text-xs text-secondary mt-1">
                                    of klik om een bestand te selecteren
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* URL Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Of plak een afbeelding URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={imageUrlInput}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        placeholder="https://example.com/image.png"
                                        className="flex-1 h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleImageUrlUpload}
                                        disabled={!imageUrlInput.trim() || uploading}
                                        className="h-12 px-4 bg-[#2860E0] text-white rounded-lg font-medium hover:bg-[#1C4DAB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Ophalen
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-secondary">
                                💡 Tip: Je kunt ook een afbeelding direct plakken (Ctrl+V) vanuit je klembord
                            </p>
                        </div>
                    </section>

                    {/* Tags */}
                    <section className="bg-card rounded-xl border border-theme p-5">
                        <h2 className="text-lg font-bold mb-4">Tags <span className="text-secondary font-normal">(max 6)</span></h2>

                        {/* Current Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2860E0]/10 text-[#2860E0] text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Add Tag */}
                        {formData.tags.length < 6 && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Nieuwe tag..."
                                    className="flex-1 h-10 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    disabled={!newTag.trim()}
                                    className="h-10 px-4 bg-gray-100 dark:bg-gray-700 border border-theme rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Labels */}
                    <section className="bg-card rounded-xl border border-theme p-5">
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

                    {/* Status */}
                    <section className="bg-card rounded-xl border border-theme p-5">
                        <h2 className="text-lg font-bold mb-4">Publicatie Status</h2>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${formData.status === 'draft'
                                    ? 'border-yellow-500 bg-yellow-500/10'
                                    : 'border-theme hover:border-yellow-500/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`size-3 rounded-full ${formData.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                                    <span className="font-semibold">Concept</span>
                                </div>
                                <p className="text-xs text-secondary">Niet zichtbaar op dashboard</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${formData.status === 'published'
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-theme hover:border-green-500/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`size-3 rounded-full ${formData.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="font-semibold">Gepubliceerd</span>
                                </div>
                                <p className="text-xs text-secondary">Zichtbaar voor iedereen</p>
                            </button>
                        </div>
                    </section>

                    {/* Active Toggle (Legacy) */}
                    <section className="bg-card rounded-xl border border-theme p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">Tool Actief</h2>
                                <p className="text-sm text-secondary">
                                    Inactieve tools worden niet getoond, zelfs niet als gepubliceerd
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
                </form>

                {/* Preview Column */}
                <div className="lg:w-80 lg:sticky lg:top-20 lg:self-start">
                    <ToolCardPreview tool={formData} />
                </div>
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-md border-t border-theme">
                <div className="max-w-6xl mx-auto flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="flex-1 h-14 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || uploading}
                        className="flex-[2] h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Opslaan...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                {isEditMode ? 'Wijzigingen Opslaan' : 'Tool Toevoegen'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
