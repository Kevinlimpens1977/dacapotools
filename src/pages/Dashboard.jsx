import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useLabels } from '../hooks/useLabels';
import Header from '../components/Header';
import ToolCard from '../components/ToolCard';
import FavoritesTray from '../components/FavoritesTray';
import ToolDetailDrawer from '../components/ToolDetailDrawer';

export default function Dashboard() {
    const { user, userData } = useAuth();
    const { activeTools, loading: toolsLoading } = useTools();
    const { labels, loading: labelsLoading } = useLabels();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [selectedTool, setSelectedTool] = useState(null);

    const handleToggleLabel = (labelId) => {
        if (labelId === null) {
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
        const publishedTools = activeTools.filter(tool =>
            tool.status === 'published' || !tool.status
        );

        return publishedTools.filter(tool => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = tool.name?.toLowerCase().includes(query);
                const matchesDesc = tool.description?.toLowerCase().includes(query);
                const matchesShortDesc = tool.shortDescription?.toLowerCase().includes(query);
                if (!matchesName && !matchesDesc && !matchesShortDesc) return false;
            }

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
            <Header
                labels={labels}
                selectedLabels={selectedLabels}
                onToggleLabel={handleToggleLabel}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="flex-1 w-full pb-8">
                {/* Favorites Section (only when logged in) */}
                {user && userData?.favorites?.length > 0 && (
                    <FavoritesTray
                        tools={activeTools}
                        onSelect={setSelectedTool}
                    />
                )}

                {/* All Tools Section */}
                <section className="mt-4">
                    <div className="px-4 mb-3 flex justify-between items-center">
                        <h2 className="text-xl font-bold tracking-tight">Alle Tools</h2>
                        {/* Sort button could go here or in filter bar. 
                            Moved to FilterBar as per plan, so keeping this clean. */}
                    </div>

                    {/* Tools Grid - Compact Layout (30% smaller) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3 sm:gap-4 px-4 pb-24">
                        {isLoading ? (
                            // Loading skeleton - now as cards
                            [...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-card rounded-lg border border-theme overflow-hidden animate-pulse"
                                >
                                    <div className="w-full h-20 bg-gray-200 dark:bg-gray-700" />
                                    <div className="p-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-full" />
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
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
                                <ToolCard
                                    key={tool.id}
                                    tool={tool}
                                    onSelect={setSelectedTool}
                                />
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Tool Detail Drawer */}
            <ToolDetailDrawer
                tool={selectedTool}
                onClose={() => setSelectedTool(null)}
            />
        </div>
    );
}
