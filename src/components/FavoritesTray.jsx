import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';

export default function FavoritesTray({ tools }) {
    const { userData } = useAuth();

    const favoriteTools = tools.filter(tool =>
        userData?.favorites?.includes(tool.id)
    );

    if (favoriteTools.length === 0) return null;

    return (
        <section className="mt-6 px-4">
            <h2 className="text-xl font-bold tracking-tight mb-3">Jouw favorieten</h2>
            <div className="flex overflow-x-auto no-scrollbar pb-4 gap-3 snap-x snap-mandatory">
                {favoriteTools.map((tool) => (
                    <FavoriteTile key={tool.id} tool={tool} />
                ))}
            </div>
        </section>
    );
}

function FavoriteTile({ tool }) {
    const handleClick = () => {
        if (tool.link) {
            window.open(tool.link, '_blank', 'noopener,noreferrer');
        }
    };

    // Get icon color based on tool name or labels
    const getIconColor = () => {
        const colors = [
            'text-blue-600',
            'text-purple-600',
            'text-green-600',
            'text-orange-600',
            'text-pink-600',
            'text-cyan-600'
        ];
        const index = tool.name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <button
            onClick={handleClick}
            className="snap-start shrink-0 size-20 rounded-xl bg-card shadow-sm border border-theme flex flex-col items-center justify-center p-2 text-center hover:shadow-md transition-all duration-300"
        >
            {tool.imageUrl ? (
                <div
                    className="size-10 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url('${tool.imageUrl}')` }}
                />
            ) : (
                <span className={`material-symbols-outlined text-3xl ${getIconColor()}`}>
                    {tool.icon || 'apps'}
                </span>
            )}
            <p className="text-sm font-medium mt-1 text-secondary truncate w-full px-1">
                {tool.name}
            </p>
        </button>
    );
}
