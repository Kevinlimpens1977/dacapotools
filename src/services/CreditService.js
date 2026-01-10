/**
 * Credit Service - CANONICAL IMPLEMENTATION
 * DaCapo Tools v1.0
 * 
 * CANONICAL RULES:
 * - Credits are per-app: /apps/{appId}/users/{uid}
 * - All mutations go through Cloud Functions
 * - Frontend is READ-ONLY
 * - Ledger is immutable and maintained by Cloud Functions
 */

import { doc, getDoc, collection, getDocs, onSnapshot, collectionGroup } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import { getAppConfig, getDefaultCreditsData } from '../config/appCredits';

// Cloud Function references
const initAppUserFn = httpsCallable(functions, 'initAppUser');
const consumeCreditsFn = httpsCallable(functions, 'consumeCredits');
const adminAdjustCreditsFn = httpsCallable(functions, 'adminAdjustCredits');

/**
 * Get the Firestore reference for a user's app credits (CANONICAL location)
 */
function getCreditsRef(appId, uid) {
    return doc(db, 'apps', appId, 'users', uid);
}

/**
 * Get the legacy Firestore reference (for migration period)
 */
function getLegacyCreditsRef(uid, appId) {
    return doc(db, 'users', uid, 'apps', appId);
}

/**
 * Initialize credits for a user's app on first use
 * Uses Cloud Function for canonical write
 */
export async function initializeCredits(uid, appId) {
    const config = getAppConfig(appId);
    if (!config) {
        throw new Error(`Unknown app: ${appId}`);
    }

    try {
        const result = await initAppUserFn({ appId });
        console.log(`[CreditService] Initialized credits for user ${uid}, app ${appId}`);
        return result.data;
    } catch (error) {
        console.error('[CreditService] Error initializing credits:', error);
        throw error;
    }
}

/**
 * Get current credits for a user's app (READ-ONLY)
 * Checks canonical location first, then legacy location
 */
export async function getCredits(uid, appId) {
    const config = getAppConfig(appId);
    if (!config || !config.hasCredits) {
        return null;
    }

    // Try canonical location first
    const creditsRef = getCreditsRef(appId, uid);
    let creditsSnap = await getDoc(creditsRef);

    if (creditsSnap.exists()) {
        return creditsSnap.data();
    }

    // Fallback to legacy location during migration
    const legacyRef = getLegacyCreditsRef(uid, appId);
    const legacySnap = await getDoc(legacyRef);

    if (legacySnap.exists()) {
        console.log(`[CreditService] Found credits in legacy location for ${uid}/${appId}`);
        return legacySnap.data();
    }

    // Not initialized - caller should call initializeCredits
    return null;
}

/**
 * Deduct credits from a user's app via Cloud Function
 * Should be called ONLY after a successful app action
 * 
 * @param {string} uid - User ID
 * @param {string} appId - App ID
 * @param {number} amount - Amount to deduct (default: 1)
 * @param {string} action - Description of the action
 */
export async function deductCredits(uid, appId, amount = 1, action = 'consumption') {
    try {
        const result = await consumeCreditsFn({ appId, amount, action });
        console.log(`[CreditService] Deducted ${amount} credit(s) for user ${uid}, app ${appId}. Remaining: ${result.data.creditsRemaining}`);
        return result.data;
    } catch (error) {
        console.error('[CreditService] Error deducting credits:', error);

        // Handle specific error codes
        if (error.code === 'functions/resource-exhausted') {
            return {
                success: false,
                creditsRemaining: 0,
                message: 'Onvoldoende credits'
            };
        }

        throw error;
    }
}

/**
 * Check if user has enough credits before performing an action (READ-ONLY)
 * Does NOT deduct - use deductCredits() after successful action
 */
export async function checkCredits(uid, appId, amount = 1) {
    const creditsData = await getCredits(uid, appId);

    if (!creditsData) {
        return {
            hasCredits: false,
            creditsRemaining: 0,
            needsInitialization: true
        };
    }

    const remaining = creditsData.credits ?? creditsData.creditsRemaining ?? 0;

    return {
        hasCredits: remaining >= amount,
        creditsRemaining: remaining
    };
}

/**
 * Modify credits for a user's app (SUPERVISOR ONLY)
 * Uses Cloud Function for canonical write
 */
export async function modifyCredits(uid, appId, delta, reason = 'admin_adjustment') {
    try {
        const result = await adminAdjustCreditsFn({
            appId,
            targetUid: uid,
            delta,
            reason
        });
        console.log(`[CreditService] Modified credits for user ${uid}, app ${appId}:`, result.data);
        return result.data;
    } catch (error) {
        console.error('[CreditService] Error modifying credits:', error);

        if (error.code === 'functions/permission-denied') {
            throw new Error('Supervisor toegang vereist');
        }

        throw error;
    }
}

/**
 * Subscribe to ALL users' credits for ALL apps (real-time) - CANONICAL location
 * Returns a list of standardized credit objects with 'uid' and 'appId' injected
 */
export function subscribeToAllAppCredits(callback) {
    // Subscribe to canonical location
    const appsQuery = collectionGroup(db, 'users');

    return onSnapshot(appsQuery, (snapshot) => {
        const results = [];
        snapshot.forEach((docSnap) => {
            // Check if this is an app user document (path: apps/{appId}/users/{uid})
            const pathParts = docSnap.ref.path.split('/');
            if (pathParts.length === 4 && pathParts[0] === 'apps' && pathParts[2] === 'users') {
                const appId = pathParts[1];
                const uid = pathParts[3];

                results.push({
                    uid,
                    appId,
                    ...docSnap.data()
                });
            }
        });
        callback(results);
    }, (error) => {
        console.error('Error in subscribeToAllAppCredits:', error);
        callback([]);
    });
}

/**
 * Get all users' credits for a specific app (admin view) - READ-ONLY
 */
export async function getAllUsersCredits(appId) {
    const results = [];

    // Try canonical location
    const appUsersRef = collection(db, 'apps', appId, 'users');
    const appUsersSnap = await getDocs(appUsersRef);

    for (const userDoc of appUsersSnap.docs) {
        const uid = userDoc.id;
        const creditsData = userDoc.data();

        // Get user identity from /users collection
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        results.push({
            uid,
            email: userData.email,
            displayName: userData.displayName,
            ...creditsData
        });
    }

    return results;
}

/**
 * Get all apps credits for a specific user - READ-ONLY
 */
export async function getUserAllAppsCredits(uid) {
    const results = {};

    // Get all apps
    const appsRef = collection(db, 'apps');
    const appsSnap = await getDocs(appsRef);

    for (const appDoc of appsSnap.docs) {
        const appId = appDoc.id;
        const userCreditsRef = doc(db, 'apps', appId, 'users', uid);
        const creditsSnap = await getDoc(userCreditsRef);

        if (creditsSnap.exists()) {
            results[appId] = creditsSnap.data();
        }
    }

    return results;
}

/**
 * Get next reset date (first day of next month)
 */
export function getNextResetDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * Format reset date for display
 */
export function formatResetDate(date) {
    const options = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('nl-NL', options);
}
