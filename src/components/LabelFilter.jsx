export default function LabelFilter({ labels, selectedLabels, onToggleLabel }) {
    return (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
            {/* "All" Button */}
            <button
                onClick={() => onToggleLabel(null)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-3 pr-4 shadow-sm transition-all ${selectedLabels.length === 0
                    ? 'btn-primary'
                    : 'btn-secondary hover:bg-[var(--bg-surface-hover)]'
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
                            ? 'btn-primary'
                            : 'btn-secondary hover:bg-[var(--bg-surface-hover)]'
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
