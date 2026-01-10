/**
 * AppCreditsOverview Component
 * 
 * Displays an overview of all apps and their credit usage.
 * Used in the Admin Credits page.
 */

import { useState, useEffect } from 'react';
import { APP_CREDITS_CONFIG, getAllAppIds } from '../config/appCredits';

export default function AppCreditsOverview() {
    const [selectedApp, setSelectedApp] = useState(null);
    const appsWithCredits = getAllAppIds().filter(id => APP_CREDITS_CONFIG[id]?.hasCredits);

    return (
        <div className="space-y-6">
            {/* App Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAllAppIds().map(appId => {
                    const config = APP_CREDITS_CONFIG[appId];
                    const isSelected = selectedApp === appId;

                    return (
                        <button
                            key={appId}
                            onClick={() => setSelectedApp(isSelected ? null : appId)}
                            className={`p-4 rounded-xl border transition-all text-left
                                ${isSelected
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                }
                                ${!config.hasCredits ? 'opacity-60' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{config.appName}</h3>
                                {config.hasCredits ? (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                                        Credits actief
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-500/10 text-gray-500 rounded-full">
                                        Geen credits
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-secondary">{config.description}</p>
                            {config.hasCredits && (
                                <div className="mt-3 flex items-center gap-4 text-sm">
                                    <span className="text-primary font-medium">
                                        {config.monthlyLimit} {config.creditUnitPlural}/maand
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Info when no app selected */}
            {!selectedApp && (
                <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">info</span>
                    <p className="text-secondary">
                        Selecteer een app hierboven om creditgegevens te bekijken
                    </p>
                </div>
            )}

            {/* Selected App Details */}
            {selectedApp && APP_CREDITS_CONFIG[selectedApp]?.hasCredits && (
                <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined">monitoring</span>
                        {APP_CREDITS_CONFIG[selectedApp].appName} - Credit Overzicht
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Monthly Limit Card */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                            <div className="text-sm text-secondary mb-1">Maandelijks Limiet</div>
                            <div className="text-2xl font-bold text-primary">
                                {APP_CREDITS_CONFIG[selectedApp].monthlyLimit}
                            </div>
                            <div className="text-xs text-secondary">
                                {APP_CREDITS_CONFIG[selectedApp].creditUnitPlural}
                            </div>
                        </div>

                        {/* Credit Unit Card */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                            <div className="text-sm text-secondary mb-1">Credit Eenheid</div>
                            <div className="text-2xl font-bold">
                                1 {APP_CREDITS_CONFIG[selectedApp].creditUnit}
                            </div>
                            <div className="text-xs text-secondary">
                                per actie
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                            <div className="text-sm text-secondary mb-1">Status</div>
                            <div className="text-2xl font-bold text-green-500">
                                Actief
                            </div>
                            <div className="text-xs text-secondary">
                                Maandelijkse reset
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">info</span>
                        <p className="text-sm">
                            Credits worden automatisch gereset aan het begin van elke maand.
                            Je kunt individuele gebruikercredits bekijken in het Gebruikers beheer.
                        </p>
                    </div>
                </div>
            )}

            {/* No Credits App Selected */}
            {selectedApp && !APP_CREDITS_CONFIG[selectedApp]?.hasCredits && (
                <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">credit_card_off</span>
                    <p className="text-secondary">
                        {APP_CREDITS_CONFIG[selectedApp]?.appName} gebruikt geen credit systeem.
                    </p>
                </div>
            )}
        </div>
    );
}
