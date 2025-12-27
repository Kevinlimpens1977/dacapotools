import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useLabels } from '../hooks/useLabels';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import LabelFilter from '../components/LabelFilter';
import ToolCard from '../components/ToolCard';
import FavoritesTray from '../components/FavoritesTray';

export default function Dashboard() {
    const { user, userData } = useAuth();
    const { activeTools, loading: toolsLoading } = useTools();
    const { labels, loading: labelsLoading } = useLabels();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    const handleToggleLabel = (labelId) => {
        if (labelId === null) {
            // "All" selected - clear filters
            setSelectedLabels([]);
        } else {
            setSelectedLabels(prev =>
                prev.includes(labelId)
                    ? prev.filter(id => id !== labelId)
                    : [...prev, labelId]
            );
        }
    };

    const filteredTools = useMemo(() => {
        // First filter to only published tools (or tools without status for backwards compatibility)
        const publishedTools = activeTools.filter(tool =>
            tool.status === 'published' || !tool.status
        );

        return publishedTools.filter(tool => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = tool.name?.toLowerCase().includes(query);
                const matchesDesc = tool.description?.toLowerCase().includes(query);
                const matchesShortDesc = tool.shortDescription?.toLowerCase().includes(query);
                if (!matchesName && !matchesDesc && !matchesShortDesc) return false;
            }

            // Label filter
            if (selectedLabels.length > 0) {
                const hasMatchingLabel = tool.labels?.some(label =>
                    selectedLabels.includes(label)
                );
                if (!hasMatchingLabel) return false;
            }

            return true;
        });
    }, [activeTools, searchQuery, selectedLabels]);

    const isLoading = toolsLoading || labelsLoading;

    return (
        <div className="min-h-screen flex flex-col">
            <Header onSearchClick={() => setShowSearch(prev => !prev)} />

            <main className="flex-1 w-full pb-8">
                {/* Search Bar (toggled) */}
                {showSearch && (
                    <div className="px-4 pt-4">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Zoek op naam of beschrijving..."
                        />
                    </div>
                )}

                {/* Favorites Section (only when logged in) */}
                {user && userData?.favorites?.length > 0 && (
                    <FavoritesTray tools={activeTools} />
                )}

                {/* All Tools Section */}
                <section className="mt-4">
                    <div className="px-4 mb-3 flex justify-between items-center">
                        <h2 className="text-xl font-bold tracking-tight">Alle Tools</h2>
                        <div className="flex gap-2">
                            <button className="flex items-center justify-center size-9 rounded-full bg-card border border-theme hover:bg-gray-500/10 transition-colors">
                                <span className="material-symbols-outlined text-xl">sort</span>
                            </button>
                            <button
                                onClick={() => setShowSearch(prev => !prev)}
                                className={`flex items-center justify-center size-9 rounded-full border transition-colors ${showSearch
                                    ? 'bg-[#2860E0] text-white border-[#2860E0]'
                                    : 'bg-card border-theme hover:bg-gray-500/10'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">filter_alt</span>
                            </button>
                        </div>
                    </div>

                    {/* Label Filters */}
                    <div className="px-4 pb-4">
                        <LabelFilter
                            labels={labels}
                            selectedLabels={selectedLabels}
                            onToggleLabel={handleToggleLabel}
                        />
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pb-24">
                        {isLoading ? (
                            // Loading skeleton - now as cards
                            [...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-card rounded-xl border border-theme overflow-hidden animate-pulse"
                                >
                                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700" />
                                    <div className="p-4">
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-full" />
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                    </div>
                                </div>
                            ))
                        ) : filteredTools.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-secondary">
                                <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                                <p>Geen tools gevonden</p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-2 text-[#2860E0] hover:underline"
                                    >
                                        Wis zoekopdracht
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredTools.map(tool => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
