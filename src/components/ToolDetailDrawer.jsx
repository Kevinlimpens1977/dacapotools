import { useEffect, useRef } from 'react';
import { getPrimaryLabelInfo, isExternalTool } from '../config/toolLabels';

// Lightweight Markdown Parser
function renderMarkdown(text) {
    if (!text) return null;

    // Helper to parse inline styles (bold, italic)
    const parseInline = (line) => {
        let parts = [line];

        // Bold: **text**
        parts = parts.flatMap(part => {
            if (typeof part !== 'string') return part;
            return part.split(/(\*\*.*?\*\*)/g).map((sub, i) => {
                if (sub.startsWith('**') && sub.endsWith('**')) {
                    return <strong key={`b-${i}`} className="font-bold text-primary">{sub.slice(2, -2)}</strong>;
                }
                return sub;
            });
        });

        // Italic: *text*
        parts = parts.flatMap(part => {
            if (typeof part !== 'string') return part;
            return part.split(/(\*.*?\*)/g).map((sub, i) => {
                if (sub.startsWith('*') && sub.endsWith('*')) {
                    return <em key={`i-${i}`} className="italic">{sub.slice(1, -1)}</em>;
                }
                return sub;
            });
        });

        return parts;
    };

    const lines = text.split('\n');
    const result = [];
    let listBuffer = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // List Item
        if (trimmed.startsWith('- ')) {
            listBuffer.push(
                <li key={`li-${index}`} className="pl-1">
                    {parseInline(trimmed.slice(2))}
                </li>
            );
        } else {
            // Flush list buffer if we hit a non-list item
            if (listBuffer.length > 0) {
                result.push(
                    <ul key={`ul-${index}`} className="list-disc list-outside mb-4 ml-6 space-y-1 marker:text-theme">
                        {listBuffer}
                    </ul>
                );
                listBuffer = [];
            }

            // Heading 3
            if (trimmed.startsWith('### ')) {
                result.push(
                    <h3 key={index} className="text-lg font-bold mt-6 mb-3 text-primary">
                        {parseInline(trimmed.slice(4))}
                    </h3>
                );
            }
            // Empty Line (Spacer)
            else if (trimmed === '') {
                result.push(<div key={index} className="h-4" />);
            }
            // Paragraph
            else {
                result.push(
                    <p key={index} className="mb-2 leading-relaxed">
                        {parseInline(line)}
                    </p>
                );
            }
        }
    });

    // Flush remaining list items
    if (listBuffer.length > 0) {
        result.push(
            <ul key="ul-end" className="list-disc list-outside mb-4 ml-6 space-y-1 marker:text-theme">
                {listBuffer}
            </ul>
        );
    }

    return result;
}

/**
 * ToolDetailDrawer (Modal Variant)
 * Displays tool details in a centered modal popup with backdrop blur.
 */
export default function ToolDetailDrawer({ tool, onClose }) {
    const modalRef = useRef(null);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (tool) {
            window.addEventListener('keydown', handleEsc);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [tool, onClose]);

    // Focus management
    useEffect(() => {
        if (tool && modalRef.current) {
            modalRef.current.focus();
        }
    }, [tool]);

    if (!tool) return null;

    const primaryLabel = getPrimaryLabelInfo(tool.labels);
    const isExternal = isExternalTool(tool.labels);
    const toolUrl = tool.externalUrl || tool.url || tool.internalRoute;

    const handleOpenTool = () => {
        if (toolUrl) {
            window.open(toolUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-theme focus:outline-none animate-in zoom-in-95 fade-in duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex="-1"
            >
                {/* Header Image */}
                <div className="relative w-full aspect-[16/9] shrink-0 bg-[var(--bg-surface-hover)]">
                    {tool.imageUrl ? (
                        <img
                            src={tool.imageUrl}
                            alt={tool.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-muted">apps</span>
                        </div>
                    )}

                    {/* Close Button (Overlay) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                        aria-label="Sluiten"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* Labels */}
                    <div className="flex items-center gap-2 mb-4">
                        {primaryLabel && (
                            <span
                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-white font-medium"
                                style={{ backgroundColor: primaryLabel.color }}
                            >
                                <span className="material-symbols-outlined text-[10px]">{primaryLabel.icon}</span>
                                {primaryLabel.name}
                            </span>
                        )}
                        {isExternal && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--bg-surface-hover)] text-secondary font-medium border border-theme">
                                <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                Extern
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold mb-4 text-primary">
                        {tool.name}
                    </h2>

                    {/* Description */}
                    <div className="prose dark:prose-invert max-w-none text-secondary">
                        {renderMarkdown(tool.description || tool.shortDescription || "Geen beschrijving beschikbaar.")}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-theme bg-card/50 backdrop-blur-sm mt-auto">
                    <button
                        onClick={handleOpenTool}
                        className="w-full py-3.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 group"
                    >
                        <span>Open tool</span>
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                            {isExternal ? 'open_in_new' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
