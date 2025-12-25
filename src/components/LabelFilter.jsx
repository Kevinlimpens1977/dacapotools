export default function LabelFilter({ labels, selectedLabels, onToggleLabel }) {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* "All" Button */}
            <button
                onClick={() => onToggleLabel(null)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-3 pr-4 shadow-sm transition-all ${selectedLabels.length === 0
                        ? 'bg-[#2860E0] text-white'
                        : 'bg-card text-inherit border border-theme hover:bg-gray-500/10'
                    }`}
            >
                <span className="material-symbols-outlined text-lg">apps</span>
                <span className="text-sm font-semibold">Alles</span>
            </button>

            {/* Label Buttons */}
            {labels.map((label) => {
                const isSelected = selectedLabels.includes(label.id);
                return (
                    <button
                        key={label.id}
                        onClick={() => onToggleLabel(label.id)}
                        className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-3 pr-4 shadow-sm transition-all ${isSelected
                                ? 'bg-[#2860E0] text-white'
                                : 'bg-card text-inherit border border-theme hover:bg-gray-500/10'
                            }`}
                    >
                        {label.icon && (
                            <span className="material-symbols-outlined text-lg">{label.icon}</span>
                        )}
                        <span className="text-sm font-medium">{label.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
