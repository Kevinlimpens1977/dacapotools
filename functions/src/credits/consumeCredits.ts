import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

interface ConsumeCreditsData {
    appId: string;
    amount: number;
    reason?: string;
}

/**
 * consumeCredits
 * Deduct credits after a successful app action.
 * Writes ledger entry.
 */
export const consumeCredits = onCall(
    { region: 'europe-west1' },
    async (request) => {
        // Auth check
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Authentication required');
        }

        const uid = request.auth.uid;
        const { appId, amount, reason } = request.data as ConsumeCreditsData;

        if (!appId || typeof appId !== 'string') {
            throw new HttpsError('invalid-argument', 'appId is required');
        }

        if (typeof amount !== 'number' || amount <= 0) {
            throw new HttpsError('invalid-argument', 'amount must be a positive number');
        }

        const appUserRef = db.doc(`apps/${appId}/users/${uid}`);

        return db.runTransaction(async (transaction) => {
            const appUserSnap = await transaction.get(appUserRef);

            if (!appUserSnap.exists) {
                throw new HttpsError('not-found', 'User not initialized for this app');
            }

            const userData = appUserSnap.data()!;
            const currentCredits = userData.credits ?? 0;

            if (currentCredits < amount) {
                throw new HttpsError('resource-exhausted', 'Insufficient credits');
            }

            const newCredits = currentCredits - amount;
            const newTotalUsed = (userData.totalUsedThisMonth ?? 0) + amount;

            // Update user credits
            transaction.update(appUserRef, {
                credits: newCredits,
                totalUsedThisMonth: newTotalUsed
            });

            // Create ledger entry
            const ledgerRef = db.collection(`apps/${appId}/creditLedger`).doc();
            transaction.set(ledgerRef, {
                uid,
                delta: -amount,
                reason: reason || 'consumption',
                source: 'consumption',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                creditsRemaining: newCredits,
                totalUsedThisMonth: newTotalUsed
            };
        });
    }
);
