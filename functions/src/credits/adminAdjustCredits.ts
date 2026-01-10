import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

interface AdminAdjustCreditsData {
    appId: string;
    targetUid: string;
    delta: number;
    reason?: string;
}

/**
 * adminAdjustCredits
 * Supervisor-only function to adjust a user's credits.
 * Writes ledger entry.
 */
export const adminAdjustCredits = onCall(
    { region: 'europe-west1' },
    async (request) => {
        // Auth check
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Authentication required');
        }

        // Supervisor check via custom claims ONLY
        if (request.auth.token.supervisor !== true) {
            throw new HttpsError('permission-denied', 'Supervisor access required');
        }

        const supervisorUid = request.auth.uid;
        const { appId, targetUid, delta, reason } = request.data as AdminAdjustCreditsData;

        if (!appId || typeof appId !== 'string') {
            throw new HttpsError('invalid-argument', 'appId is required');
        }

        if (!targetUid || typeof targetUid !== 'string') {
            throw new HttpsError('invalid-argument', 'targetUid is required');
        }

        if (typeof delta !== 'number') {
            throw new HttpsError('invalid-argument', 'delta must be a number');
        }

        const appUserRef = db.doc(`apps/${appId}/users/${targetUid}`);

        return db.runTransaction(async (transaction) => {
            const appUserSnap = await transaction.get(appUserRef);

            if (!appUserSnap.exists) {
                throw new HttpsError('not-found', 'Target user not found for this app');
            }

            const userData = appUserSnap.data()!;
            const currentCredits = userData.credits ?? 0;
            const newCredits = Math.max(0, currentCredits + delta);

            // Update user credits
            transaction.update(appUserRef, {
                credits: newCredits
            });

            // Create ledger entry
            const ledgerRef = db.collection(`apps/${appId}/creditLedger`).doc();
            transaction.set(ledgerRef, {
                uid: targetUid,
                delta,
                reason: reason || 'admin_adjustment',
                source: 'admin',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                creditsBefore: currentCredits,
                creditsAfter: newCredits,
                adjustedBy: supervisorUid
            };
        });
    }
);
