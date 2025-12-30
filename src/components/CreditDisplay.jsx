/**
 * CreditDisplay Component
 * 
 * Displays remaining credits for an app with visual indicators.
 * Shows: remaining / limit, reset date, and low credit warnings.
 */

import { useCredits } from '../hooks/useCredits';
import { getAppConfig } from '../config/appCredits';

/**
 * Display credits for a specific app
 * @param {object} props
 * @param {string} props.appId - App ID to show credits for
 * @param {boolean} props.compact - Show compact version (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export default function CreditDisplay({ appId, compact = false, className = '' }) {
    const {
        creditsRemaining,
        monthlyLimit,
        creditUnit,
        creditUnitPlural,
        nextResetFormatted,
        isLowCredits,
        hasNoCredits,
        loading,
        error
    } = useCredits(appId);

    const appConfig = getAppConfig(appId);

    if (!appConfig) {
        return null;
    }

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-red-500 text-sm ${className}`}>
                <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                Fout bij laden credits
            </div>
        );
    }

    // Determine status color
    const getStatusColor = () => {
        if (hasNoCredits) return 'text-red-500';
        if (isLowCredits) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getStatusBg = () => {
        if (hasNoCredits) return 'bg-red-500/10';
        if (isLowCredits) return 'bg-yellow-500/10';
        return 'bg-green-500/10';
    };

    // Compact version for headers/toolbars
    if (compact) {
        return (
            <div className={`flex items-center gap-1.5 ${className}`}>
                <span className={`material-symbols-outlined text-lg ${getStatusColor()}`}>
                    {hasNoCredits ? 'error' : isLowCredits ? 'warning' : 'check_circle'}
                </span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {creditsRemaining}
                </span>
                <span className="text-xs text-secondary">
                    {creditUnitPlural}
                </span>
            </div>
        );
    }

    // Full version with all details
    return (
        <div className={`rounded-lg border border-theme p-4 ${getStatusBg()} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{appConfig.appName}</h3>
                <span className={`material-symbols-outlined ${getStatusColor()}`}>
                    {hasNoCredits ? 'error' : isLowCredits ? 'warning' : 'check_circle'}
                </span>
            </div>

            {/* Credits display */}
            <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-2xl font-bold ${getStatusColor()}`}>
                    {creditsRemaining}
                </span>
                <span className="text-secondary text-sm">
                    / {monthlyLimit} {creditUnitPlural}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full transition-all duration-300 ${hasNoCredits ? 'bg-red-500' :
                            isLowCredits ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                    style={{ width: `${Math.min(100, (creditsRemaining / monthlyLimit) * 100)}%` }}
                />
            </div>

            {/* Reset info */}
            <p className="text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Reset op {nextResetFormatted}
            </p>

            {/* Warning messages */}
            {hasNoCredits && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    Geen credits meer beschikbaar
                </p>
            )}
            {isLowCredits && !hasNoCredits && (
                <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Bijna geen credits meer
                </p>
            )}
        </div>
    );
}
