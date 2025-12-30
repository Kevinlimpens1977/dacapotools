/**
 * AdminCredits Page
 * 
 * Credit management page for the admin dashboard.
 * Shows per-app credit usage overview.
 * Supervisors can modify user credits and limits.
 */

import { useAuth } from '../../context/AuthContext';
import AppCreditsOverview from '../../components/AppCreditsOverview';

export default function AdminCredits() {
    const { isSupervisor } = useAuth();

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Credits</h2>
                    <p className="text-secondary mt-1">
                        {isSupervisor
                            ? 'Beheer credits en limieten per gebruiker'
                            : 'Bekijk credit gebruik per app en gebruiker'}
                    </p>
                </div>
                {/* Role indicator */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isSupervisor
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                        {isSupervisor ? 'edit' : 'visibility'}
                    </span>
                    {isSupervisor ? 'Volledig beheer' : 'Alleen-lezen'}
                </div>
            </div>

            {/* Credits Overview */}
            <AppCreditsOverview />

            {/* Info for admins */}
            {!isSupervisor && (
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">info</span>
                    <p className="text-sm">
                        Als admin heb je alleen-lezen toegang. Neem contact op met een supervisor voor het wijzigen van credits.
                    </p>
                </div>
            )}
        </div>
    );
}
