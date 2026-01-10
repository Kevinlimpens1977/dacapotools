import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';


const db = admin.firestore();

interface InitAppUserData {
    appId: string;
}

/**
 * initAppUser
 * Initialize a user for a specific app on first use.
 * Creates /apps/{appId}/users/{uid} with default values.
 */
export const initAppUser = onCall(
    { region: 'europe-west1' },
    async (request) => {
        // Auth check
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Authentication required');
        }

        const uid = request.auth.uid;
        const { appId } = request.data as InitAppUserData;

        if (!appId || typeof appId !== 'string') {
            throw new HttpsError('invalid-argument', 'appId is required');
        }

        const appUserRef = db.doc(`apps/${appId}/users/${uid}`);

        return db.runTransaction(async (transaction) => {
            const appUserSnap = await transaction.get(appUserRef);

            if (appUserSnap.exists) {
                // Already initialized
                return {
                    success: true,
                    initialized: false,
                    data: appUserSnap.data()
                };
            }

            // Get app config for default credits
            const appRef = db.doc(`apps/${appId}`);
            const appSnap = await transaction.get(appRef);
            const appConfig = appSnap.exists ? appSnap.data() : {};

            // Initialize user for app
            const userData: Record<string, unknown> = {
                role: 'user',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            // Add credits if app uses credit system
            if (appConfig?.hasCredits) {
                userData.credits = appConfig.monthlyLimit || 0;
                userData.totalUsedThisMonth = 0;
                userData.lastResetAt = admin.firestore.FieldValue.serverTimestamp();
            }

            transaction.set(appUserRef, userData);

            return {
                success: true,
                initialized: true,
                data: userData
            };
        });
    }
);
