import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { isExternalTool } from '../config/toolLabels';

export default function FavoritesTray({ tools }) {
    const { userData } = useAuth();
    const sortedFavorites = useMemo(() => {
        if (!userData?.favorites) return [];
        return tools.filter(t => userData.favorites.includes(t.id));
    }, [tools, userData?.favorites]);

    if (sortedFavorites.length === 0) return null;

    return (
        <section className="mt-6 px-4">
            <h2 className="text-xl font-bold tracking-tight mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                Mijn favorieten
            </h2>
            <div className="flex overflow-x-auto no-scrollbar pb-4 gap-3 snap-x snap-mandatory">
                {sortedFavorites.map((tool) => (
                    <FavoriteTile key={tool.id} tool={tool} />
                ))}
            </div>
        </section>
    );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * DESIGN-FROZEN COMPONENT — FavoriteTile
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * This component is DESIGN-FROZEN as of 2026-01-04.
 * No visual changes may be made unless a critical bug is found.
 * 
 * LOCKED DIMENSIONS:
 * - Total height: 200px (12.5rem) [Range: 192-208px]
 * - Image area: 68% (~136px)
 * - Info area: 32% (~64px)
 * - Border radius: 16px
 * 
 * LOCKED STYLING:
 * - Image: object-fit cover, center-cropped, no overlays
 * - Info: subtle green tint (#14B8A6), 8px/12px padding
 * - Typography: 0.95rem, weight 600, line-height 1.25, max 2 lines
 * - Hyphenation: Dutch rules (nl-NL), automatic hyphenation
 * - No truncation, no ellipsis
 * 
 * ════════════════════════════════════════════════════════════════════════════
 */
function FavoriteTile({ tool }) {
    const navigate = useNavigate();
    const { trackToolClick } = useTools();
    const { user } = useAuth();

    const isExternal = isExternalTool(tool.labels);
    const toolUrl = tool.externalUrl || tool.url || tool.internalRoute;

    const handleClick = async () => {
        // Track click (fire and forget to not delay navigation)
        if (tool.id) {
            const userId = user?.uid || 'anonymous';
            trackToolClick(tool.id, userId).catch(console.error);
        }

        if (isExternal) {
            // External: Open in new tab
            if (toolUrl) {
                window.open(toolUrl, '_blank', 'noopener,noreferrer');
            }
        } else {
            // Internal: Navigate via router
            if (toolUrl) {
                navigate(toolUrl);
            }
        }
    };

    return (
        <button
            onClick={handleClick}
            className="snap-start shrink-0 w-36 h-[200px] rounded-2xl flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-card group"
        >
            {/* Image Area — LOCKED: ~68% height */}
            <div className="h-[68%] w-full bg-[var(--bg-surface)] overflow-hidden">
                {tool.imageUrl ? (
                    <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-surface-hover)]">
                        <span className="material-symbols-outlined text-4xl text-secondary">
                            {tool.icon || 'apps'}
                        </span>
                    </div>
                )}
            </div>

            {/* Info Area — LOCKED: ~32% height, green tint */}
            <div className="h-[32%] w-full bg-[#14B8A6]/10 dark:bg-[#14B8A6]/20 flex items-center justify-center py-2 px-3">
                <p
                    lang="nl-NL"
                    className="text-[0.95rem] font-semibold text-primary leading-[1.25] text-center line-clamp-2 hyphens-auto"
                    style={{ wordBreak: 'break-word' }}
                >
                    {tool.name}
                </p>
            </div>
        </button>
    );
}
