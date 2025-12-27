import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';

export default function ToolCard({ tool }) {
    const { user, isFavorite, toggleFavorite } = useAuth();
    const { updateFavoriteCount, trackToolClick } = useTools();
    const descriptionRef = useRef(null);
    const containerRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [scrollDistance, setScrollDistance] = useState(0);

    const favorite = isFavorite(tool.id);

    // Calculate scroll distance - comparing text height to container height
    useEffect(() => {
        const calculateScroll = () => {
            if (descriptionRef.current && containerRef.current) {
                const textHeight = descriptionRef.current.scrollHeight;
                const containerHeight = containerRef.current.clientHeight;
                const overflow = textHeight - containerHeight;
                setScrollDistance(Math.max(0, overflow));
            }
        };

        // Calculate after a short delay to ensure DOM is ready
        const timer = setTimeout(calculateScroll, 100);

        // Recalculate on resize
        window.addEventListener('resize', calculateScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateScroll);
        };
    }, [tool.shortDescription, tool.description]);

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return; // Must be logged in

        await toggleFavorite(tool.id);
        await updateFavoriteCount(tool.id, favorite ? -1 : 1);
    };

    const handleToolClick = async () => {
        if (tool.link) {
            // Track the click before opening
            const userId = user?.uid || 'anonymous';
            await trackToolClick(tool.id, userId);

            // Open the tool in a new tab
            window.open(tool.link, '_blank', 'noopener,noreferrer');
        }
    };

    const descriptionText = tool.shortDescription || tool.description || 'Geen beschrijving beschikbaar';

    return (
        <div
            className="group bg-card rounded-xl shadow-sm border border-theme overflow-hidden hover:shadow-lg hover:border-[#2860E0]/50 transition-all duration-300 cursor-pointer flex flex-col"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Tool Image - Fixed aspect ratio with object-fit cover */}
            <div className="w-full aspect-[16/9] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                {tool.imageUrl ? (
                    <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-gray-400">apps</span>
                    </div>
                )}

                {/* Favorite Button - Top Right Corner */}
                {user && (
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm transition-all ${favorite
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                        aria-label={favorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
                    >
                        <span
                            className="material-symbols-outlined text-xl"
                            style={favorite ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                            favorite
                        </span>
                    </button>
                )}
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{tool.name}</h3>

                {/* Description with hover scroll */}
                <div
                    ref={containerRef}
                    className="h-[3.75rem] overflow-hidden mb-4 flex-1"
                    style={{ maxHeight: '3.75rem' }} // Fixed height for 3 lines
                >
                    <p
                        ref={descriptionRef}
                        className="text-sm text-secondary transition-transform ease-linear"
                        style={{
                            transform: isHovering && scrollDistance > 0
                                ? `translateY(-${scrollDistance}px)`
                                : 'translateY(0)',
                            transitionDuration: isHovering ? `${Math.max(2, scrollDistance * 30)}ms` : '300ms'
                        }}
                    >
                        {descriptionText}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleToolClick}
                    className="w-full py-2.5 px-4 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    Openen
                </button>
            </div>
        </div>
    );
}


