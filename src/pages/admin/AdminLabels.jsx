/**
 * AdminLabels Page
 * 
 * Read-only display of predefined labels.
 * Labels are fixed and cannot be edited by admins.
 */

import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import {
    PRIMARY_LABELS,
    EXTERN_LABEL,
    ALL_LABELS
} from '../../config/toolLabels';

export default function AdminLabels() {
    const { isSupervisor } = useAuth();
    const { tools } = useTools();

    // Count how many tools use each label
    const labelUsage = useMemo(() => {
        const usage = {};
        ALL_LABELS.forEach(label => {
            usage[label.id] = tools.filter(tool =>
                tool.labels?.includes(label.id)
            ).length;
        });
        return usage;
    }, [tools]);

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Labels & Metadata</h2>
                <p className="text-secondary mt-1">
                    Voorgedefineerde labels voor tool classificatie
                </p>
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined mt-0.5">info</span>
                <div className="text-sm">
                    <p className="font-medium">Labels zijn vooraf gedefinieerd</p>
                    <p className="mt-1 opacity-80">
                        Elke tool moet exact één primair label hebben. Het label "Extern" kan optioneel
                        worden toegevoegd voor tools die buiten DaCapoTools openen.
                    </p>
                </div>
            </div>

            {/* Primary Labels */}
            <section className="bg-card rounded-xl border border-theme overflow-hidden">
                <div className="px-5 py-3 border-b border-theme flex items-center justify-between">
                    <h3 className="font-semibold">Primaire Labels</h3>
                    <span className="text-sm text-secondary">{PRIMARY_LABELS.length} labels</span>
                </div>

                <div className="divide-y divide-[var(--border-light)] dark:divide-[var(--border-dark)]">
                    {PRIMARY_LABELS.map(label => (
                        <div key={label.id} className="p-4 flex items-center gap-3">
                            <div
                                className="size-10 rounded-lg flex items-center justify-center text-white shrink-0"
                                style={{ backgroundColor: label.color }}
                            >
                                <span className="material-symbols-outlined">{label.icon}</span>
                            </div>

                            <div className="flex-1">
                                <span className="font-medium">{label.name}</span>
                                <span className="text-xs text-secondary ml-2">
                                    ({labelUsage[label.id] || 0} tools)
                                </span>
                            </div>

                            <span className="text-xs font-mono bg-[var(--bg-surface-hover)] text-primary px-2 py-1 rounded">
                                {label.id}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Secondary Label */}
            <section className="bg-card rounded-xl border border-theme overflow-hidden">
                <div className="px-5 py-3 border-b border-theme">
                    <h3 className="font-semibold">Secundair Label</h3>
                </div>

                <div className="p-4 flex items-center gap-3">
                    <div
                        className="size-10 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: EXTERN_LABEL.color }}
                    >
                        <span className="material-symbols-outlined">{EXTERN_LABEL.icon}</span>
                    </div>

                    <div className="flex-1">
                        <span className="font-medium">{EXTERN_LABEL.name}</span>
                        <span className="text-xs text-secondary ml-2">
                            ({labelUsage[EXTERN_LABEL.id] || 0} tools)
                        </span>
                        <p className="text-sm text-secondary mt-1">
                            Markeert tools die in een nieuw tabblad openen
                        </p>
                    </div>

                    <span className="text-xs font-mono bg-[var(--bg-surface-hover)] text-primary px-2 py-1 rounded">
                        {EXTERN_LABEL.id}
                    </span>
                </div>
            </section>

            {/* Label Rules */}
            <section className="bg-card rounded-xl border border-theme p-5">
                <h3 className="font-semibold mb-4">Regels</h3>
                <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                        Elke tool heeft exact één primair label
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                        "Extern" is optioneel en kan alleen samen met een primair label
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                        Maximaal 2 labels per tool
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                        "Extern" kan niet als enige label worden toegekend
                    </li>
                </ul>
            </section>
        </div>
    );
}
