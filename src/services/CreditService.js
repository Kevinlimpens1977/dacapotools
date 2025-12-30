/**
 * Credit Service
 * 
 * Handles all credit-related operations for per-app credit systems.
 * Uses Firestore structure: users/{uid}/apps/{appId}
 * 
 * Credits are deducted ONLY on successful app actions,
 * NOT on clicking/opening tools.
 */

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getAppConfig, getDefaultCreditsData } from '../config/appCredits';

/**
 * Get the Firestore reference for a user's app credits
 */
function getCreditsRef(uid, appId) {
    return doc(db, 'users', uid, 'apps', appId);
}

/**
 * Check if a new month has started since the last reset
 */
function isNewMonth(lastResetAt) {
    if (!lastResetAt) return true;

    const now = new Date();
    const lastReset = lastResetAt instanceof Timestamp
        ? lastResetAt.toDate()
        : new Date(lastResetAt);

    return (
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()
    );
}

/**
 * Initialize credits for a user's app on first use
 */
export async function initializeCredits(uid, appId) {
    const config = getAppConfig(appId);
    if (!config) {
        throw new Error(`Unknown app: ${appId}`);
    }

    const creditsRef = getCreditsRef(uid, appId);
    const creditsSnap = await getDoc(creditsRef);

    if (creditsSnap.exists()) {
        return creditsSnap.data();
    }

    const defaultData = getDefaultCreditsData(appId);
    await setDoc(creditsRef, defaultData);

    console.log(`[CreditService] Initialized credits for user ${uid}, app ${appId}`);
    return defaultData;
}

/**
 * Get current credits for a user's app
 * Automatically initializes if not exists and checks for monthly reset
 */
export async function getCredits(uid, appId) {
    const creditsRef = getCreditsRef(uid, appId);
    let creditsSnap = await getDoc(creditsRef);

    if (!creditsSnap.exists()) {
        return await initializeCredits(uid, appId);
    }

    let creditsData = creditsSnap.data();

    if (isNewMonth(creditsData.lastResetAt)) {
        creditsData = await resetMonthlyCredits(uid, appId);
    }

    return creditsData;
}

/**
 * Reset credits to monthly limit (called when new month detected)
 */
export async function resetMonthlyCredits(uid, appId) {
    const config = getAppConfig(appId);
    if (!config) {
        throw new Error(`Unknown app: ${appId}`);
    }

    const creditsRef = getCreditsRef(uid, appId);
    const creditsSnap = await getDoc(creditsRef);

    if (!creditsSnap.exists()) {
        return await initializeCredits(uid, appId);
    }

    const currentData = creditsSnap.data();
    const updatedData = {
        creditsRemaining: currentData.monthlyLimit || config.monthlyLimit,
        totalUsedThisMonth: 0,
        lastResetAt: new Date()
    };

    await updateDoc(creditsRef, updatedData);

    console.log(`[CreditService] Monthly reset for user ${uid}, app ${appId}`);
    return { ...currentData, ...updatedData };
}

/**
 * Deduct credits from a user's app
 * Should be called ONLY after a successful app action
 */
export async function deductCredits(uid, appId, amount = 1) {
    const creditsData = await getCredits(uid, appId);

    if (creditsData.creditsRemaining < amount) {
        return {
            success: false,
            creditsRemaining: creditsData.creditsRemaining,
            message: 'Onvoldoende credits'
        };
    }

    const creditsRef = getCreditsRef(uid, appId);
    const updatedData = {
        creditsRemaining: creditsData.creditsRemaining - amount,
        totalUsedThisMonth: (creditsData.totalUsedThisMonth || 0) + amount
    };

    await updateDoc(creditsRef, updatedData);

    console.log(`[CreditService] Deducted ${amount} credit(s) for user ${uid}, app ${appId}. Remaining: ${updatedData.creditsRemaining}`);

    return {
        success: true,
        creditsRemaining: updatedData.creditsRemaining,
        totalUsedThisMonth: updatedData.totalUsedThisMonth
    };
}

/**
 * Check if user has enough credits before performing an action
 * Does NOT deduct - use deductCredits() after successful action
 */
export async function checkCredits(uid, appId, amount = 1) {
    const creditsData = await getCredits(uid, appId);
    return {
        hasCredits: creditsData.creditsRemaining >= amount,
        creditsRemaining: creditsData.creditsRemaining
    };
}

/**
 * Modify credits for a user's app (supervisor only)
 */
export async function modifyCredits(uid, appId, updates) {
    const creditsRef = getCreditsRef(uid, appId);
    const creditsSnap = await getDoc(creditsRef);

    if (!creditsSnap.exists()) {
        await initializeCredits(uid, appId);
    }

    const validUpdates = {};
    if (typeof updates.creditsRemaining === 'number') {
        validUpdates.creditsRemaining = Math.max(0, updates.creditsRemaining);
    }
    if (typeof updates.monthlyLimit === 'number') {
        validUpdates.monthlyLimit = Math.max(1, updates.monthlyLimit);
    }

    if (Object.keys(validUpdates).length > 0) {
        await updateDoc(creditsRef, validUpdates);
        console.log(`[CreditService] Modified credits for user ${uid}, app ${appId}:`, validUpdates);
    }

    const updatedSnap = await getDoc(creditsRef);
    return updatedSnap.data();
}

/**
 * Get all users' credits for a specific app (admin/supervisor view)
 */
export async function getAllUsersCredits(appId) {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    const results = [];

    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        const userData = userDoc.data();

        const creditsRef = getCreditsRef(uid, appId);
        const creditsSnap = await getDoc(creditsRef);

        if (creditsSnap.exists()) {
            results.push({
                uid,
                email: userData.email,
                displayName: userData.displayName,
                ...creditsSnap.data()
            });
        }
    }

    return results;
}

/**
 * Get all apps credits for a specific user
 */
export async function getUserAllAppsCredits(uid) {
    const appsRef = collection(db, 'users', uid, 'apps');
    const appsSnap = await getDocs(appsRef);

    const results = {};
    appsSnap.forEach(doc => {
        results[doc.id] = doc.data();
    });

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
