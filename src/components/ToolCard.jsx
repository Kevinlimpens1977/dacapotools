import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { getPrimaryLabelInfo, isExternalTool } from '../config/toolLabels';

export default function ToolCard({ tool, onSelect }) {
    const navigate = useNavigate();
    const { user, isFavorite, toggleFavorite } = useAuth();
    const { updateFavoriteCount, trackToolClick } = useTools();
    const descriptionRef = useRef(null);
    const containerRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [scrollDistance, setScrollDistance] = useState(0);

    const favorite = isFavorite(tool.id);
    const primaryLabel = getPrimaryLabelInfo(tool.labels);
    const isExternal = isExternalTool(tool.labels);

    // Calculate scroll distance - comparing text height to container height
    useEffect(() => {
        const calculateScroll = () => {
            if (descriptionRef.current && containerRef.current) {
                const textHeight = descriptionRef.current.scrollHeight;
                const containerHeight = containerRef.current.clientHeight;
                const overflow = textHeight - containerHeight;
                console.log('ToolCard Scroll Check:', { name: tool.name, textHeight, containerHeight, overflow });
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
        // Track the click
        const userId = user?.uid || 'anonymous';
        await trackToolClick(tool.id, userId);

        // Notify parent to open drawer
        if (onSelect) {
            onSelect(tool);
        }
    };

    const descriptionText = tool.description || tool.shortDescription || 'Geen beschrijving beschikbaar';

    return (
        <div
            className="group bg-card rounded-xl shadow-sm border border-theme overflow-hidden hover:shadow-lg hover:border-[#2860E0]/50 transition-all duration-300 cursor-pointer flex flex-col"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleToolClick}
        >
            {/* Tool Image - Fixed aspect ratio with object-fit cover */}
            <div className="w-full aspect-[16/9] relative overflow-hidden bg-[var(--bg-surface-hover)]">
                {tool.imageUrl ? (
                    <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-muted">apps</span>
                    </div>
                )}

                {/* External Indicator */}
                {isExternal && (
                    <div className="absolute top-2 left-2 size-8 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-white" title="Opent in een nieuw tabblad">
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </div>
                )}

                {/* Favorite Button - Top Right Corner */}
                {user && (
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-2 right-2 p-2 rounded-full bg-[var(--bg-surface)] shadow-sm transition-all ${favorite
                            ? 'text-red-500'
                            : 'text-muted hover:text-red-500'
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
                <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors text-primary">
                    {tool.name}
                </h3>

                {/* Description with hover scroll */}
                <div
                    ref={containerRef}
                    className="h-[3.75rem] overflow-hidden mb-4"
                >
                    <p
                        ref={descriptionRef}
                        className="text-sm text-secondary transition-transform ease-linear will-change-transform group-hover:translate-y-[var(--scroll-offset)]"
                        style={{
                            '--scroll-offset': `-${scrollDistance}px`,
                            transitionDuration: `${Math.max(2, scrollDistance * 30)}ms`
                        }}
                    >
                        {descriptionText}
                    </p>
                </div>

                {/* Footer: Labels & Action */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-theme">
                    {/* Primary Label Badge */}
                    {primaryLabel ? (
                        <span
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-white font-medium"
                            style={{ backgroundColor: primaryLabel.color }}
                        >
                            <span className="material-symbols-outlined text-[10px]">{primaryLabel.icon}</span>
                            {primaryLabel.name}
                        </span>
                    ) : (
                        <span></span>
                    )}

                    <span className={`material-symbols-outlined text-[#2860E0] transform transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`}>
                        {/* Icon now indicates interaction (drawer) - can keep arrow as "Go/More" */}
                        {isExternal ? 'open_in_new' : 'arrow_forward'}
                    </span>
                </div>
            </div>
        </div>
    );
}


