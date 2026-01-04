import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ImageCropper - Pan and Zoom image behind a fixed aspect ratio frame
 * 
 * Features:
 * - Fixed 16:9 crop frame centered in the view
 * - Image retains aspect ratio and can be panned (dragged) and zoomed
 * - Output is always 1280x720 (HD 16:9)
 */
export default function ImageCropper({ imageUrl, onCrop, onCancel }) {
    const containerRef = useRef(null);
    const imageRef = useRef(null);

    // State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [processing, setProcessing] = useState(false);

    // Limits / Configuration
    const TARGET_WIDTH = 1280;
    const TARGET_HEIGHT = 720;
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3;

    // Visual crop frame size (in CSS pixels) - displayed to user
    // We'll calculate this dynamically or fix it to a reasonable size
    const [viewportSize] = useState({ width: 480, height: 270 });

    // Initialize: Load image and center it with "cover" style initially
    const handleImageLoad = (e) => {
        const img = e.target;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Calculate Center Offset
        // We want the center of the image to be at the center of the container.
        if (containerRef.current) {
            const container = containerRef.current.getBoundingClientRect();

            // Let's calculate an initial scale that fits the image within the container nicely (contain)
            // but allow zooming out/in.

            // Actually, let's start with a scale that ensures the crop frame is filled if possible (cover logic for the frame)
            const coverScale = Math.max(
                viewportSize.width / naturalWidth,
                viewportSize.height / naturalHeight
            );

            // Ensure it covers at least the frame, but don't blow it up too huge if image is massive
            const initialScale = coverScale;

            setScale(initialScale);

            setPosition({
                x: (container.width - naturalWidth * initialScale) / 2,
                y: (container.height - naturalHeight * initialScale) / 2
            });
        }
    };

    // Drag Logic
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(MIN_SCALE, scale + delta), MAX_SCALE);

        // Enhance: Zoom towards mouse center would be better, but simple center zoom is ok for now.
        // Or if we just scale, it zooms relative to top-left (0,0) of the image's untransformed space effectively?
        // No, transform origin is top-left.
        // To fix jumpiness on zoom, we normally adjust position too.
        // For this iteration, simple scale. User can drag to correct.
        setScale(newScale);
    };

    // Crop Logic
    const handleCrop = async () => {
        if (!imageRef.current || !containerRef.current || processing) return;

        try {
            setProcessing(true);
            const canvas = document.createElement('canvas');
            canvas.width = TARGET_WIDTH;
            canvas.height = TARGET_HEIGHT;
            const ctx = canvas.getContext('2d');

            // 1. Get exact visual positions from the DOM
            // This bypasses any confusion about transforms, scale origins, or CSS math.
            const imageRect = imageRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            // 2. Calculate where the "Hole" is on the screen
            // The hole is centered in the container with viewportSize dimensions
            const holeRect = {
                left: containerRect.left + (containerRect.width - viewportSize.width) / 2,
                top: containerRect.top + (containerRect.height - viewportSize.height) / 2,
                width: viewportSize.width,
                height: viewportSize.height
            };

            // 3. Calculate ratio between "Natural Image" and "On-Screen Image"
            // If image is natural 1000px but shown as 500px, ratio is 2 (1 screen pixel = 2 image pixels)
            const naturalWidth = imageRef.current.naturalWidth;
            const naturalHeight = imageRef.current.naturalHeight;
            const ratioX = naturalWidth / imageRect.width;
            const ratioY = naturalHeight / imageRect.height;

            // 4. Calculate coordinates relative to the Image
            // (Hole Left - Image Left) * Ratio
            const cropX = (holeRect.left - imageRect.left) * ratioX;
            const cropY = (holeRect.top - imageRect.top) * ratioY;
            const cropWidth = holeRect.width * ratioX;
            const cropHeight = holeRect.height * ratioY;

            // Draw to canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Use the calculated source coordinates
            ctx.drawImage(
                imageRef.current,
                cropX, cropY, cropWidth, cropHeight, // Source (from original image)
                0, 0, TARGET_WIDTH, TARGET_HEIGHT    // Destination (canvas)
            );

            // Convert to blob properly wrapped in promise
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));

            if (blob) {
                // Use a generic valid filename (timestamp will be added by upload logic)
                const file = new File([blob], "tool_header.jpg", { type: "image/jpeg" });
                await onCrop(file); // Await parent upload logic
            }
        } catch (error) {
            console.error("Crop/Save error:", error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="flex flex-col w-full max-w-4xl h-[80vh] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-neutral-800 border-b border-white/5 z-20">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined">crop_free</span>
                            Afbeelding Bijsnijden
                        </h3>
                        <p className="text-secondary text-xs">
                            Sleep en zoom om de ideale uitsnede te maken.
                        </p>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Workspace */}
                <div
                    ref={containerRef}
                    className="flex-1 relative overflow-hidden cursor-move bg-[#0a0a0a] touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    {/* Render Image Layer */}
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Target"
                        className="absolute max-w-none pointer-events-none select-none will-change-transform"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'top left'
                        }}
                        onLoad={handleImageLoad}
                    />

                    {/* Overlay Layer (The Mask) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                        <div
                            style={{
                                width: viewportSize.width,
                                height: viewportSize.height,
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' // Huge shadow to dim outside
                            }}
                            className="border-2 border-white/80 shadow-2xl relative box-content"
                        >
                            {/* Grid of Thirds */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                                <div className="border-r border-b border-white"></div>
                                <div className="border-r border-b border-white"></div>
                                <div className="border-b border-white"></div>
                                <div className="border-r border-b border-white"></div>
                                <div className="border-r border-b border-white"></div>
                                <div className="border-b border-white"></div>
                                <div className="border-r border-white"></div>
                                <div className="border-r border-white"></div>
                                <div></div>
                            </div>

                            {/* Dimensions Label */}
                            <div className="absolute -bottom-8 left-0 right-0 text-center text-white/50 text-xs font-mono">
                                16:9 Output
                            </div>
                        </div>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-800/90 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 z-20 shadow-lg">
                        <button
                            className="p-1 text-white hover:text-blue-400 transition-colors"
                            onClick={() => setScale(s => Math.max(MIN_SCALE, s - 0.1))}
                            title="Uitzoomen"
                        >
                            <span className="material-symbols-outlined text-lg">remove</span>
                        </button>

                        <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100}%` }}
                            />
                        </div>

                        <button
                            className="p-1 text-white hover:text-blue-400 transition-colors"
                            onClick={() => setScale(s => Math.min(MAX_SCALE, s + 0.1))}
                            title="Inzoomen"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>

                        <span className="text-xs font-mono text-white/70 w-8 text-right">
                            {Math.round(scale * 100)}%
                        </span>
                    </div>

                </div>

                {/* Footer buttons */}
                <div className="p-4 bg-neutral-800 border-t border-white/5 flex justify-end gap-3 z-20">
                    <button
                        onClick={onCancel}
                        disabled={processing}
                        className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleCrop}
                        disabled={processing}
                        className={`
                            px-6 py-2 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2
                            ${processing
                                ? 'bg-[#2860E0]/50 text-white/70 cursor-wait'
                                : 'bg-[#2860E0] hover:bg-[#1C4DAB] text-white shadow-blue-500/20'
                            }
                        `}
                    >
                        {processing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                Opslaan...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">crop</span>
                                Opslaan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
