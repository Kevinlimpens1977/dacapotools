import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

interface SetAppRoleData {
    appId: string;
    targetUid: string;
    role: 'user' | 'administrator';
}

/**
 * setAppRole
 * Supervisor-only function to set a user's role for a specific app.
 */
export const setAppRole = onCall(
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

        const { appId, targetUid, role } = request.data as SetAppRoleData;

        if (!appId || typeof appId !== 'string') {
            throw new HttpsError('invalid-argument', 'appId is required');
        }

        if (!targetUid || typeof targetUid !== 'string') {
            throw new HttpsError('invalid-argument', 'targetUid is required');
        }

        const validRoles = ['user', 'administrator'];
        if (!role || !validRoles.includes(role)) {
            throw new HttpsError('invalid-argument', `role must be one of: ${validRoles.join(', ')}`);
        }

        const appUserRef = db.doc(`apps/${appId}/users/${targetUid}`);

        return db.runTransaction(async (transaction) => {
            const appUserSnap = await transaction.get(appUserRef);

            if (!appUserSnap.exists) {
                // Create user doc if not exists
                transaction.set(appUserRef, {
                    role,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                transaction.update(appUserRef, { role });
            }

            return {
                success: true,
                appId,
                targetUid,
                role
            };
        });
    }
);
