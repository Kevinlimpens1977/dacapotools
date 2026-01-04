import { useRef } from 'react';

export default function FilterBar({
    labels,
    selectedLabels,
    onToggleLabel,
    searchQuery,
    onSearchChange
}) {
    const scrollContainerRef = useRef(null);

    const handleClear = () => onToggleLabel(null);
    const hasActiveFilters = selectedLabels.length > 0;

    return (
        <div className="sticky top-[56px] z-40 w-full bg-[var(--bg-app)]/95 backdrop-blur-md border-t-2 border-t-[#2860E0] border-b border-b-theme transition-all duration-200 supports-[backdrop-filter]:bg-[var(--bg-app)]/80">
            <div className="flex items-center h-11 px-4 gap-2">

                {/* FILTER OP Label */}
                <div className="shrink-0 h-7 px-2.5 flex items-center justify-center rounded bg-[var(--bg-surface)] border border-theme text-[10px] font-bold text-secondary uppercase tracking-wide">
                    Filter op
                </div>

                {/* DIVIDER */}
                <div className="h-4 w-px bg-[var(--border-default)] shrink-0 opacity-40" />

                {/* Search - Always Open */}
                <div className="flex items-center w-40 shrink-0">
                    <div className="relative w-full">
                        <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Zoeken..."
                            className="w-full h-7 text-xs pl-8 pr-2.5 bg-[var(--bg-surface)] border border-theme rounded-full focus:ring-1 focus:ring-[var(--primary)] outline-none text-secondary placeholder:text-secondary/50"
                        />
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="h-4 w-px bg-[var(--border-default)] shrink-0 opacity-40" />

                {/* Scrollable Labels + Sort + Trash */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
                >
                    {labels.map((label) => {
                        const isSelected = selectedLabels.includes(label.id);
                        return (
                            <button
                                key={label.id}
                                onClick={() => onToggleLabel(label.id)}
                                className={`shrink-0 h-7 px-2.5 flex items-center gap-1 rounded-full text-[11px] font-medium transition-all select-none ${isSelected
                                    ? 'text-white shadow-sm'
                                    : 'bg-transparent text-secondary hover:bg-[var(--bg-surface-hover)]'
                                    }`}
                                style={isSelected ? { backgroundColor: label.color } : {}}
                            >
                                {label.icon && (
                                    <span
                                        className="material-symbols-outlined text-[14px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        {label.icon}
                                    </span>
                                )}
                                <span className="whitespace-nowrap">{label.name}</span>
                            </button>
                        );
                    })}

                    {/* Sort Button - inline with labels */}
                    <button
                        className="shrink-0 size-7 flex items-center justify-center rounded-full text-secondary hover:bg-[var(--bg-surface-hover)] transition-colors"
                        title="Sorteren"
                    >
                        <span className="material-symbols-outlined text-[18px]">sort</span>
                    </button>

                    {/* Clear Button (Trash) - inline with labels */}
                    <button
                        onClick={hasActiveFilters ? handleClear : undefined}
                        className={`shrink-0 size-7 flex items-center justify-center rounded-full transition-colors ${hasActiveFilters
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer'
                            : 'text-secondary cursor-default'
                            }`}
                        title={hasActiveFilters ? "Wis alle filters" : "Geen actieve filters"}
                        disabled={!hasActiveFilters}
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
