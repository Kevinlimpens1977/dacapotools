/**
 * useCredits Hook - CANONICAL IMPLEMENTATION
 * DaCapo Tools v1.0
 * 
 * React hook for managing per-app credits.
 * Provides credit data, loading state, and deduction functions.
 * 
 * CANONICAL RULES:
 * - Credits are per-app: /apps/{appId}/users/{uid}
 * - All mutations via Cloud Functions
 * - Frontend is READ-ONLY (except for triggering Cloud Functions)
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getCredits,
    deductCredits as deductCreditsService,
    checkCredits as checkCreditsService,
    initializeCredits,
    getNextResetDate,
    formatResetDate
} from '../services/CreditService';
import { getAppConfig } from '../config/appCredits';

/**
 * Hook for managing credits for a specific app
 * @param {string} appId - The app ID to get credits for
 * @returns {object} Credits state and functions
 */
export function useCredits(appId) {
    const { user } = useAuth();
    const [credits, setCredits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const appConfig = getAppConfig(appId);

    // Fetch credits on mount and when user/appId changes
    const fetchCredits = useCallback(async () => {
        if (!user?.uid || !appId) {
            setCredits(null);
            setLoading(false);
            return;
        }

        // Skip if app doesn't use credits
        if (!appConfig?.hasCredits) {
            setCredits(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            let creditsData = await getCredits(user.uid, appId);

            // Initialize if not exists
            if (!creditsData) {
                try {
                    const initResult = await initializeCredits(user.uid, appId);
                    creditsData = initResult.data || initResult;
                } catch (initError) {
                    console.error('[useCredits] Error initializing credits:', initError);
                    // Return default structure
                    creditsData = {
                        credits: appConfig.monthlyLimit || 0,
                        totalUsedThisMonth: 0
                    };
                }
            }

            setCredits(creditsData);
        } catch (err) {
            console.error('[useCredits] Error fetching credits:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, appId, appConfig]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    /**
     * Check if user has enough credits before an action
     * Does NOT deduct credits - use deductCredits after success
     * @param {number} amount - Amount needed (default: 1)
     * @returns {Promise<boolean>}
     */
    const hasEnoughCredits = useCallback(async (amount = 1) => {
        if (!user?.uid || !appId) return false;
        if (!appConfig?.hasCredits) return true; // App doesn't use credits

        try {
            const result = await checkCreditsService(user.uid, appId, amount);
            return result.hasCredits;
        } catch (err) {
            console.error('[useCredits] Error checking credits:', err);
            return false;
        }
    }, [user?.uid, appId, appConfig]);

    /**
     * Deduct credits after a successful app action
     * Uses Cloud Function - should be called ONLY after the action succeeds
     * @param {number} amount - Amount to deduct (default: 1)
     * @param {string} action - Description of the action
     * @returns {Promise<{success: boolean, creditsRemaining?: number, message?: string}>}
     */
    const deductCredits = useCallback(async (amount = 1, action = 'consumption') => {
        if (!user?.uid || !appId) {
            return { success: false, message: 'Niet ingelogd' };
        }

        if (!appConfig?.hasCredits) {
            return { success: true, message: 'App gebruikt geen credits' };
        }

        try {
            const result = await deductCreditsService(user.uid, appId, amount, action);

            if (result.success) {
                // Update local state
                setCredits(prev => ({
                    ...prev,
                    credits: result.creditsRemaining,
                    creditsRemaining: result.creditsRemaining, // Legacy field
                    totalUsedThisMonth: result.totalUsedThisMonth
                }));
            }

            return result;
        } catch (err) {
            console.error('[useCredits] Error deducting credits:', err);
            return { success: false, message: err.message };
        }
    }, [user?.uid, appId, appConfig]);

    /**
     * Refresh credits from Firestore
     */
    const refreshCredits = useCallback(() => {
        return fetchCredits();
    }, [fetchCredits]);

    // Computed values - support both canonical and legacy field names
    const creditsRemaining = credits?.credits ?? credits?.creditsRemaining ?? 0;
    const monthlyLimit = credits?.monthlyLimit ?? appConfig?.monthlyLimit ?? 0;
    const totalUsedThisMonth = credits?.totalUsedThisMonth ?? 0;
    const creditUnit = appConfig?.creditUnit ?? 'credit';
    const creditUnitPlural = appConfig?.creditUnitPlural ?? 'credits';
    const nextResetDate = getNextResetDate();
    const nextResetFormatted = formatResetDate(nextResetDate);

    // Credit status helpers
    const isLowCredits = creditsRemaining > 0 && creditsRemaining <= monthlyLimit * 0.1;
    const hasNoCredits = creditsRemaining <= 0;

    return {
        // State
        credits,
        loading,
        error,

        // Computed values
        creditsRemaining,
        monthlyLimit,
        totalUsedThisMonth,
        creditUnit,
        creditUnitPlural,
        nextResetDate,
        nextResetFormatted,

        // Status helpers
        isLowCredits,
        hasNoCredits,

        // Functions
        hasEnoughCredits,
        deductCredits,
        refreshCredits
    };
}

export default useCredits;
