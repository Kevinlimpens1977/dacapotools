import { useState, useRef, useCallback } from 'react';

/**
 * ImageCropper - Fixed aspect ratio crop frame for tool images
 * Allows admin to drag image behind a fixed frame to select visible area
 * Aspect ratio matches the tool tile image display (16:9)
 */
export default function ImageCropper({ imageUrl, onCrop, onCancel, aspectRatio = 16 / 9 }) {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);

    // Frame dimensions (fixed)
    const frameWidth = 320;
    const frameHeight = frameWidth / aspectRatio;

    // Handle image load to calculate initial positioning
    const handleImageLoad = useCallback((e) => {
        const img = e.target;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Calculate scale to fit image so it covers the frame
        const scaleX = frameWidth / naturalWidth;
        const scaleY = frameHeight / naturalHeight;
        const newScale = Math.max(scaleX, scaleY);

        setScale(newScale);
        setImageSize({ width: naturalWidth, height: naturalHeight });

        // Center the image
        const scaledWidth = naturalWidth * newScale;
        const scaledHeight = naturalHeight * newScale;
        setPosition({
            x: (frameWidth - scaledWidth) / 2,
            y: (frameHeight - scaledHeight) / 2
        });
    }, [frameWidth, frameHeight]);

    // Mouse/touch handlers for dragging
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const scaledWidth = imageSize.width * scale;
        const scaledHeight = imageSize.height * scale;

        // Calculate bounds
        const minX = Math.min(0, frameWidth - scaledWidth);
        const maxX = Math.max(0, frameWidth - scaledWidth);
        const minY = Math.min(0, frameHeight - scaledHeight);
        const maxY = Math.max(0, frameHeight - scaledHeight);

        const newX = Math.max(minX, Math.min(maxX, e.clientX - dragStart.x));
        const newY = Math.max(minY, Math.min(maxY, e.clientY - dragStart.y));

        setPosition({ x: newX, y: newY });
    }, [isDragging, dragStart, imageSize, scale, frameWidth, frameHeight]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Crop the image using canvas
    const handleCrop = async () => {
        if (!imageRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');

        // Calculate source coordinates (in original image pixels)
        const sourceX = -position.x / scale;
        const sourceY = -position.y / scale;
        const sourceWidth = frameWidth / scale;
        const sourceHeight = frameHeight / scale;

        // Draw cropped area
        ctx.drawImage(
            imageRef.current,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, frameWidth, frameHeight
        );

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (blob) {
                // Create a File from the blob for upload
                const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
                onCrop(file);
            }
        }, 'image/png', 0.9);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-card rounded-xl border border-theme p-6 max-w-lg w-full">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">crop</span>
                    Afbeelding Positioneren
                </h3>

                <p className="text-sm text-secondary mb-4">
                    Sleep de afbeelding om het zichtbare gedeelte te kiezen.
                </p>

                {/* Crop Area */}
                <div
                    ref={containerRef}
                    className="relative mx-auto overflow-hidden rounded-lg border-2 border-dashed border-[#2860E0] bg-gray-100 dark:bg-gray-800"
                    style={{ width: frameWidth, height: frameHeight }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Crop preview"
                        className="absolute cursor-move select-none"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'top left',
                            maxWidth: 'none'
                        }}
                        onLoad={handleImageLoad}
                        onMouseDown={handleMouseDown}
                        draggable={false}
                        crossOrigin="anonymous"
                    />

                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#2860E0] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#2860E0] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#2860E0] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#2860E0] pointer-events-none" />
                </div>

                <p className="text-xs text-secondary text-center mt-2">
                    16:9 formaat • {frameWidth} × {Math.round(frameHeight)} pixels
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleCrop}
                        className="flex-1 py-3 px-4 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">check</span>
                        Toepassen
                    </button>
                </div>
            </div>
        </div>
    );
}
