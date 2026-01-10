import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// 🔴 VERPLICHT: initialiseer Admin SDK


const db = admin.firestore();

interface GetCreditsData {
    appId: string;
}

/**
 * getCredits
 * Read-only helper to get current credits for a user's app.
 * Does NOT write to ledger.
 */
export const getCredits = onCall(
    { region: 'europe-west1' },
    async (request) => {
        // Auth check
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Authentication required');
        }

        const uid = request.auth.uid;
        const { appId } = request.data as GetCreditsData;

        if (!appId || typeof appId !== 'string') {
            throw new HttpsError('invalid-argument', 'appId is required');
        }

        const appUserRef = db.doc(`apps/${appId}/users/${uid}`);
        const appUserSnap = await appUserRef.get();

        if (!appUserSnap.exists) {
            return {
                success: true,
                exists: false,
                data: null
            };
        }

        const data = appUserSnap.data() ?? {};

        return {
            success: true,
            exists: true,
            data: {
                credits: data.credits ?? 0,
                totalUsedThisMonth: data.totalUsedThisMonth ?? 0,
                lastResetAt: data.lastResetAt ?? null,
                role: data.role ?? 'user'
            }
        };
    }
);
