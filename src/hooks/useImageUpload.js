import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Hook for handling image uploads to Firebase Storage
 * Supports file upload, clipboard paste, URL fetch, and slug-based storage paths
 */
export function useImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    /**
     * Upload an image file to Firebase Storage
     * @param {File} file - The file to upload
     * @param {string} folder - The folder path in storage (e.g., 'tools')
     * @returns {Promise<string>} - The download URL of the uploaded file
     */
    const uploadImage = async (file, folder = 'tools') => {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size must be less than 5MB');
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Create unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `${folder}/${timestamp}_${safeName}`;

            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setProgress(Math.round(progressPercent));
                    },
                    (err) => {
                        console.error('Upload error:', err);
                        setError(err.message);
                        setUploading(false);
                        reject(err);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        setProgress(100);
                        console.log('[Storage] Image uploaded:', downloadURL);
                        resolve(downloadURL);
                    }
                );
            });
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message);
            setUploading(false);
            throw err;
        }
    };

    /**
     * Upload an image file to a specific path (for tool images with slug)
     * Overwrites existing file at the same path
     * @param {File|Blob} file - The file to upload
     * @param {string} slug - The tool slug for the storage path
     * @returns {Promise<string>} - The download URL of the uploaded file
     */
    const uploadToolImage = async (file, slug) => {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!slug) {
            throw new Error('Tool slug is required');
        }

        // Validate file type
        const isImage = file.type?.startsWith('image/') || file instanceof Blob;
        if (!isImage) {
            throw new Error('File must be an image');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size must be less than 5MB');
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Use slug-based path: /tool-images/{slug}/header.png
            const fileName = `tool-images/${slug}/header.png`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setProgress(Math.round(progressPercent));
                    },
                    (err) => {
                        console.error('Upload error:', err);
                        setError(err.message);
                        setUploading(false);
                        reject(err);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        setProgress(100);
                        console.log('[Storage] Tool image uploaded:', downloadURL);
                        resolve(downloadURL);
                    }
                );
            });
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message);
            setUploading(false);
            throw err;
        }
    };

    /**
     * Fetch an image from a URL and upload it to Firebase Storage
     * @param {string} imageUrl - The URL of the image to fetch
     * @param {string} slug - The tool slug for the storage path
     * @returns {Promise<string>} - The Firebase download URL
     */
    const uploadFromUrl = async (imageUrl, slug) => {
        if (!imageUrl) {
            throw new Error('No URL provided');
        }

        if (!slug) {
            throw new Error('Tool slug is required');
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Fetch the image from the URL
            setProgress(10);
            const response = await fetch(imageUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType?.startsWith('image/')) {
                throw new Error('URL does not point to an image');
            }

            setProgress(30);
            const blob = await response.blob();

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (blob.size > maxSize) {
                throw new Error('Image size must be less than 5MB');
            }

            setProgress(50);

            // Upload to Firebase Storage with slug-based path
            const fileName = `tool-images/${slug}/header.png`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Scale progress from 50-100% for the upload portion
                        const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
                        setProgress(Math.round(50 + uploadProgress));
                    },
                    (err) => {
                        console.error('Upload error:', err);
                        setError(err.message);
                        setUploading(false);
                        reject(err);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        setProgress(100);
                        console.log('[Storage] Image from URL uploaded:', downloadURL);
                        resolve(downloadURL);
                    }
                );
            });
        } catch (err) {
            console.error('Upload from URL error:', err);
            setError(err.message);
            setUploading(false);
            throw err;
        }
    };

    /**
     * Delete an image from Firebase Storage
     * @param {string} imageUrl - The download URL of the image to delete
     */
    const deleteImage = async (imageUrl) => {
        if (!imageUrl) return;

        try {
            // Extract the path from the URL
            const storageRef = ref(storage, imageUrl);
            await deleteObject(storageRef);
            console.log('[Storage] Image deleted');
        } catch (err) {
            // If file doesn't exist, that's okay
            if (err.code !== 'storage/object-not-found') {
                console.error('Delete error:', err);
                throw err;
            }
        }
    };

    /**
     * Delete a tool image by slug
     * @param {string} slug - The tool slug
     */
    const deleteToolImage = async (slug) => {
        if (!slug) return;

        try {
            const fileName = `tool-images/${slug}/header.png`;
            const storageRef = ref(storage, fileName);
            await deleteObject(storageRef);
            console.log('[Storage] Tool image deleted');
        } catch (err) {
            // If file doesn't exist, that's okay
            if (err.code !== 'storage/object-not-found') {
                console.error('Delete error:', err);
                throw err;
            }
        }
    };

    /**
     * Handle paste event to upload image from clipboard
     * @param {ClipboardEvent} event 
     * @param {string} slug - The tool slug for storage path
     * @returns {Promise<string|null>}
     */
    const handlePaste = async (event, slug) => {
        const items = event.clipboardData?.items;
        if (!items) return null;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file && slug) {
                    return await uploadToolImage(file, slug);
                } else if (file) {
                    return await uploadImage(file, 'tools');
                }
            }
        }
        return null;
    };

    /**
     * Check if a string is a valid image URL
     * @param {string} url 
     * @returns {boolean}
     */
    const isValidImageUrl = (url) => {
        if (!url) return false;
        try {
            new URL(url);
            // Check for common image extensions or data URLs
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
            const lowercaseUrl = url.toLowerCase();
            return imageExtensions.some(ext => lowercaseUrl.includes(ext)) || 
                   url.startsWith('data:image/') ||
                   url.includes('googleusercontent.com') ||
                   url.includes('firebasestorage.googleapis.com');
        } catch {
            return false;
        }
    };

    return {
        uploadImage,
        uploadToolImage,
        uploadFromUrl,
        deleteImage,
        deleteToolImage,
        handlePaste,
        isValidImageUrl,
        uploading,
        progress,
        error
    };
}
