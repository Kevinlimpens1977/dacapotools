import { useState, useRef } from 'react';

/**
 * ToolCardPreview - Live preview component for the Admin Tool Creator
 * Matches the public ToolCard appearance with scroll-on-hover for full description
 */
export default function ToolCardPreview({ tool }) {
    const [isHovering, setIsHovering] = useState(false);
    const descriptionRef = useRef(null);

    // Use provided tool data with fallbacks for preview
    const name = tool?.name || 'Tool Name';
    const shortDescription = tool?.shortDescription || tool?.description || 'Short description...';
    const fullDescription = tool?.fullDescription || shortDescription;
    const imageUrl = tool?.imageUrl || '';
    const tags = tool?.tags || [];

    return (
        <div className="bg-card rounded-xl border border-theme overflow-hidden shadow-lg">
            {/* Preview Label */}
            <div className="bg-[#2860E0]/10 px-3 py-1.5 border-b border-theme">
                <span className="text-xs font-semibold text-[#2860E0] uppercase tracking-wide">
                    Live Preview
                </span>
            </div>

            {/* Card Preview */}
            <div
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group bg-card p-3 flex items-center justify-between gap-3 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Tool Image */}
                    <div
                        className="size-10 rounded-md bg-cover bg-center shrink-0 border border-theme bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                        style={imageUrl ? { backgroundImage: `url('${imageUrl}')` } : {}}
                    >
                        {!imageUrl && (
                            <span className="material-symbols-outlined text-gray-400">apps</span>
                        )}
                    </div>

                    {/* Tool Info */}
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base truncate">{name}</h3>

                        {/* Description with scroll-on-hover */}
                        <div
                            ref={descriptionRef}
                            className={`text-xs text-secondary overflow-hidden transition-all duration-300 ${isHovering
                                    ? 'max-h-24 overflow-y-auto'
                                    : 'max-h-5 truncate'
                                }`}
                        >
                            <p className={isHovering ? 'whitespace-pre-wrap' : 'truncate'}>
                                {isHovering ? fullDescription : shortDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Favorite Button (visual only) */}
                <button
                    className="shrink-0 p-1 rounded-full text-secondary hover:text-red-500 hover:bg-gray-500/10 transition-colors"
                    onClick={(e) => e.preventDefault()}
                >
                    <span className="material-symbols-outlined text-xl">favorite</span>
                </button>
            </div>

            {/* Tags Preview */}
            {tags.length > 0 && (
                <div className="px-3 pb-3 flex flex-wrap gap-1">
                    {tags.slice(0, 6).map((tag, index) => (
                        <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded-full bg-[#2860E0]/10 text-[#2860E0]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Status Indicator */}
            <div className="px-3 pb-3">
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${tool?.status === 'published'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                    <span className={`size-2 rounded-full ${tool?.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                    {tool?.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                </div>
            </div>

            {/* Hover Instruction */}
            <div className="px-3 pb-3 text-xs text-secondary italic">
                Hover over de kaart om de volledige beschrijving te zien
            </div>
        </div>
    );
}
