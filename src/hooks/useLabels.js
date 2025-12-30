import { ALL_LABELS } from '../config/toolLabels';

export function useLabels() {
    // Return static labels from config
    // We used to fetch from Firestore, but now labels are predefined and hardcoded
    const labels = ALL_LABELS;

    const addLabel = async () => {
        console.warn('Labels are now read-only');
    };

    const updateLabel = async () => {
        console.warn('Labels are now read-only');
    };

    const deleteLabel = async () => {
        console.warn('Labels are now read-only');
    };

    return {
        labels,
        loading: false,
        error: null,
        addLabel,
        updateLabel,
        deleteLabel
    };
}
