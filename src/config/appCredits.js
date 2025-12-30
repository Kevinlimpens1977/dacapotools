/**
 * App Credits Configuration
 * 
 * Defines credit settings for each app in the DaCapo Toolbox.
 * Each app has its own monthly limit and credit unit.
 * 
 * NOTE: Credits are deducted ONLY on successful app actions
 * (e.g., image generation, text translation), NOT on clicking/opening tools.
 */

export const APP_CREDITS_CONFIG = {
    'paco': {
        appId: 'paco',
        appName: 'Paco Generator',
        monthlyLimit: 50,
        creditUnit: 'afbeelding',
        creditUnitPlural: 'afbeeldingen',
        description: 'Genereer afbeeldingen met AI'
    },
    'translate': {
        appId: 'translate',
        appName: 'Vertaler',
        monthlyLimit: 1000,
        creditUnit: 'woord',
        creditUnitPlural: 'woorden',
        description: 'Vertaal teksten naar andere talen'
    }
};

/**
 * Get config for a specific app
 * @param {string} appId 
 * @returns {object|null}
 */
export function getAppConfig(appId) {
    return APP_CREDITS_CONFIG[appId] || null;
}

/**
 * Get all app IDs
 * @returns {string[]}
 */
export function getAllAppIds() {
    return Object.keys(APP_CREDITS_CONFIG);
}

/**
 * Get default credits data for initializing a new user's app
 * @param {string} appId 
 * @returns {object|null}
 */
export function getDefaultCreditsData(appId) {
    const config = getAppConfig(appId);
    if (!config) return null;

    return {
        creditsRemaining: config.monthlyLimit,
        monthlyLimit: config.monthlyLimit,
        totalUsedThisMonth: 0,
        lastResetAt: new Date(),
        createdAt: new Date()
    };
}
