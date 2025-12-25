import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Hook for handling image uploads to Firebase Storage
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
     * Handle paste event to upload image from clipboard
     * @param {ClipboardEvent} event 
     * @param {string} folder 
     * @returns {Promise<string|null>}
     */
    const handlePaste = async (event, folder = 'tools') => {
        const items = event.clipboardData?.items;
        if (!items) return null;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    return await uploadImage(file, folder);
                }
            }
        }
        return null;
    };

    return {
        uploadImage,
        deleteImage,
        handlePaste,
        uploading,
        progress,
        error
    };
}
