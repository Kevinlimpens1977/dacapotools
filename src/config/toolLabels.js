/**
 * Tool Labels Configuration
 * 
 * Predefined labels for tool classification.
 * Labels array is the SINGLE SOURCE OF TRUTH for tool classification.
 * 
 * Rules:
 * - Every tool MUST have exactly ONE primary functional label
 * - A tool MAY optionally have the "extern" label
 * - Max total labels per tool: 2
 * - "extern" can NEVER exist as the only label
 */

/**
 * Primary functional labels (exactly ONE required per tool)
 */
export const PRIMARY_LABELS = [
    { id: 'lesgeven', name: 'Lesgeven', icon: 'school', color: '#2860E0' },
    { id: 'toetsing', name: 'Toetsing', icon: 'quiz', color: '#22C55E' },
    { id: 'leerlingbegeleiding', name: 'Leerlingbegeleiding', icon: 'support', color: '#A855F7' },
    { id: 'administratie', name: 'Administratie', icon: 'folder', color: '#F97316' },
    { id: 'planning', name: 'Planning', icon: 'calendar_month', color: '#14B8A6' },
    { id: 'communicatie', name: 'PR en communicatie', icon: 'chat', color: '#EC4899' },
    { id: 'ai-automatisering', name: 'AI & Automatisering', icon: 'smart_toy', color: '#6366F1' },
    { id: 'overig', name: 'Overig', icon: 'more_horiz', color: '#6B7280' }
];

/**
 * Secondary label for external tools
 */
export const EXTERN_LABEL = {
    id: 'extern',
    name: 'Extern',
    icon: 'open_in_new',
    color: '#EF4444'
};

/**
 * All labels combined for lookup
 */
export const ALL_LABELS = [...PRIMARY_LABELS, EXTERN_LABEL];

/**
 * Get label info by ID
 * @param {string} labelId 
 * @returns {Object|undefined}
 */
export function getLabelById(labelId) {
    return ALL_LABELS.find(l => l.id === labelId);
}

/**
 * Check if a tool is external based on its labels
 * @param {string[]} labels - Tool's labels array
 * @returns {boolean}
 */
export function isExternalTool(labels) {
    return labels?.includes('extern') || false;
}

/**
 * Get the primary label from a tool's labels array
 * @param {string[]} labels - Tool's labels array
 * @returns {string|null} - Primary label ID or null
 */
export function getPrimaryLabel(labels) {
    if (!labels || labels.length === 0) return null;
    return labels.find(id => id !== 'extern') || null;
}

/**
 * Get primary label info object
 * @param {string[]} labels - Tool's labels array
 * @returns {Object|null}
 */
export function getPrimaryLabelInfo(labels) {
    const primaryId = getPrimaryLabel(labels);
    return primaryId ? getLabelById(primaryId) : null;
}

/**
 * Validate labels array for a tool
 * @param {string[]} labels - Labels to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLabels(labels) {
    if (!labels || labels.length === 0) {
        return { valid: false, error: 'Een primair label is verplicht' };
    }

    const primaryLabel = getPrimaryLabel(labels);
    if (!primaryLabel) {
        return { valid: false, error: 'Een primair label is verplicht (niet alleen Extern)' };
    }

    // Check primary label is valid
    const validPrimaryIds = PRIMARY_LABELS.map(l => l.id);
    if (!validPrimaryIds.includes(primaryLabel)) {
        return { valid: false, error: 'Ongeldig primair label' };
    }

    // Max 2 labels
    if (labels.length > 2) {
        return { valid: false, error: 'Maximaal 2 labels toegestaan' };
    }

    // If 2 labels, one must be extern
    if (labels.length === 2 && !labels.includes('extern')) {
        return { valid: false, error: 'Alleen primair label + Extern toegestaan' };
    }

    return { valid: true };
}
