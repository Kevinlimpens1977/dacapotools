export default function SearchBar({ value, onChange, placeholder = "Zoek tools..." }) {
    return (
        <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                search
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-theme bg-card text-inherit placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[#2860E0] focus:border-transparent transition-shadow"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-inherit transition-colors"
                    aria-label="Wis zoekopdracht"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            )}
        </div>
    );
}
