import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';

export default function ToolCard({ tool }) {
    const { user, isFavorite, toggleFavorite } = useAuth();
    const { updateFavoriteCount, trackToolClick } = useTools();

    const favorite = isFavorite(tool.id);

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

    return (
        <div
            onClick={handleToolClick}
            className="group bg-card rounded-lg shadow-sm border border-theme p-3 flex items-center justify-between gap-3 hover:shadow-md hover:border-[#2860E0]/50 transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Tool Image */}
                <div
                    className="size-10 rounded-md bg-cover bg-center shrink-0 border border-theme bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    style={tool.imageUrl ? { backgroundImage: `url('${tool.imageUrl}')` } : {}}
                >
                    {!tool.imageUrl && (
                        <span className="material-symbols-outlined text-gray-400">apps</span>
                    )}
                </div>

                {/* Tool Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">{tool.name}</h3>
                    <p className="text-xs text-secondary truncate">
                        {tool.description}
                    </p>
                </div>
            </div>

            {/* Favorite Button */}
            {user && (
                <button
                    onClick={handleFavoriteClick}
                    className={`shrink-0 p-1 rounded-full transition-colors ${favorite
                        ? 'text-red-500'
                        : 'text-secondary hover:text-red-500 hover:bg-gray-500/10'
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
    );
}
