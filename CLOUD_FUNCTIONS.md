# Cloud Functions - CANONICAL SPECIFICATION
# DaCapo Tools v1.0
# Status: CANON (Normatief)

---

## SUPERVISOR POLICY (ABSOLUTE)

All role-sensitive functions MUST:
1. Require authentication
2. Enforce supervisor checks via custom claims: `context.auth.token.supervisor === true`
3. Reject any non-supervisor attempting role assignment, credit modification, or governance actions

---

## REQUIRED CLOUD FUNCTIONS

### 1. initAppUser

**Purpose:** Initialize a user for a specific app on first use.

```typescript
// functions/src/initAppUser.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const initAppUser = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { appId } = data;
    const uid = context.auth.uid;

    if (!appId) {
      throw new functions.https.HttpsError('invalid-argument', 'appId is required');
    }

    const db = admin.firestore();
    const appUserRef = db.doc(`apps/${appId}/users/${uid}`);
    const appUserSnap = await appUserRef.get();

    if (appUserSnap.exists) {
      // Already initialized
      return { success: true, initialized: false, data: appUserSnap.data() };
    }

    // Get app config for default credits
    const appRef = db.doc(`apps/${appId}`);
    const appSnap = await appRef.get();
    const appConfig = appSnap.exists ? appSnap.data() : {};

    // Initialize user for app
    const userData = {
      role: 'user', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add credits if app uses credit system
    if (appConfig?.hasCredits) {
      userData.credits = appConfig.monthlyLimit || 0;
      userData.totalUsedThisMonth = 0;
      userData.lastResetAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await appUserRef.set(userData);

    return { success: true, initialized: true, data: userData };
  });
```

---

### 2. consumeCredits

**Purpose:** Deduct credits after a successful app action.

```typescript
// functions/src/consumeCredits.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const consumeCredits = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { appId, amount, action } = data;
    const uid = context.auth.uid;

    if (!appId || typeof amount !== 'number' || amount <= 0) {
      throw new functions.https.HttpsError('invalid-argument', 'appId and positive amount required');
    }

    const db = admin.firestore();
    
    return db.runTransaction(async (transaction) => {
      const appUserRef = db.doc(`apps/${appId}/users/${uid}`);
      const appUserSnap = await transaction.get(appUserRef);

      if (!appUserSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User not initialized for this app');
      }

      const userData = appUserSnap.data();
      const currentCredits = userData?.credits || 0;

      if (currentCredits < amount) {
        throw new functions.https.HttpsError('resource-exhausted', 'Insufficient credits');
      }

      // Deduct credits
      const newCredits = currentCredits - amount;
      const newTotalUsed = (userData?.totalUsedThisMonth || 0) + amount;

      transaction.update(appUserRef, {
        credits: newCredits,
        totalUsedThisMonth: newTotalUsed
      });

      // Create ledger entry
      const ledgerRef = db.collection(`apps/${appId}/creditLedger`).doc();
      transaction.set(ledgerRef, {
        uid,
        delta: -amount,
        reason: action || 'consumption',
        source: 'consumption',
        creditsAfter: newCredits,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        creditsRemaining: newCredits,
        totalUsedThisMonth: newTotalUsed
      };
    });
  });
```

---

### 3. adminAdjustCredits (SUPERVISOR ONLY)

**Purpose:** Allow supervisor to adjust a user's credits.

```typescript
// functions/src/adminAdjustCredits.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const adminAdjustCredits = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // CANONICAL: Supervisor check via custom claims ONLY
    if (context.auth.token.supervisor !== true) {
      throw new functions.https.HttpsError('permission-denied', 'Supervisor access required');
    }

    const { appId, targetUid, delta, reason } = data;

    if (!appId || !targetUid || typeof delta !== 'number') {
      throw new functions.https.HttpsError('invalid-argument', 'appId, targetUid, and delta required');
    }

    const db = admin.firestore();
    const supervisorUid = context.auth.uid;

    return db.runTransaction(async (transaction) => {
      const appUserRef = db.doc(`apps/${appId}/users/${targetUid}`);
      const appUserSnap = await transaction.get(appUserRef);

      if (!appUserSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Target user not found for this app');
      }

      const userData = appUserSnap.data();
      const currentCredits = userData?.credits || 0;
      const newCredits = Math.max(0, currentCredits + delta);

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
        adjustedBy: supervisorUid,
        creditsBefore: currentCredits,
        creditsAfter: newCredits,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        creditsBefore: currentCredits,
        creditsAfter: newCredits
      };
    });
  });
```

---

### 4. assignAppRole (SUPERVISOR ONLY)

**Purpose:** Allow supervisor to assign roles to users for specific apps.

```typescript
// functions/src/assignAppRole.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const assignAppRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // CANONICAL: Supervisor check via custom claims ONLY
    if (context.auth.token.supervisor !== true) {
      throw new functions.https.HttpsError('permission-denied', 'Supervisor access required');
    }

    const { appId, targetUid, role } = data;
    const validRoles = ['user', 'administrator'];

    if (!appId || !targetUid || !validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        `appId, targetUid, and valid role (${validRoles.join(', ')}) required`
      );
    }

    const db = admin.firestore();
    const appUserRef = db.doc(`apps/${appId}/users/${targetUid}`);
    const appUserSnap = await appUserRef.get();

    if (!appUserSnap.exists) {
      // Initialize user if not exists
      await appUserRef.set({
        role,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await appUserRef.update({ role });
    }

    return { success: true, appId, targetUid, role };
  });
```

---

### 5. setSupervisorClaim (ADMIN SDK ONLY)

**Purpose:** Set supervisor custom claim. This should only be run once during initial setup or via a secure admin script.

```typescript
// functions/src/admin/setSupervisorClaim.ts
// NOTE: This is NOT a callable function - run via Firebase Admin SDK only

import * as admin from 'firebase-admin';

/**
 * Set supervisor custom claim for a user
 * Run this once during initial setup for the project owner
 * 
 * Usage (in Firebase Admin SDK script):
 * await setSupervisorClaim('uid-of-project-owner');
 */
export async function setSupervisorClaim(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, { supervisor: true });
  console.log(`Supervisor claim set for user: ${uid}`);
}

/**
 * Remove supervisor claim (should almost never be used)
 */
export async function removeSupervisorClaim(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, { supervisor: false });
  console.log(`Supervisor claim removed for user: ${uid}`);
}
```

---

### 6. monthlyCreditsReset (Scheduled)

**Purpose:** Reset credits for all users at the start of each month.

```typescript
// functions/src/monthlyCreditsReset.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const monthlyCreditsReset = functions
  .region('europe-west1')
  .pubsub.schedule('0 0 1 * *') // First day of each month at midnight
  .timeZone('Europe/Amsterdam')
  .onRun(async () => {
    const db = admin.firestore();
    
    // Get all apps with credits
    const appsSnap = await db.collection('apps')
      .where('hasCredits', '==', true)
      .get();

    let totalReset = 0;

    for (const appDoc of appsSnap.docs) {
      const appId = appDoc.id;
      const appConfig = appDoc.data();
      const monthlyLimit = appConfig.monthlyLimit || 0;

      // Get all users for this app
      const usersSnap = await db.collection(`apps/${appId}/users`).get();

      const batch = db.batch();
      let batchCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userRef = userDoc.ref;
        batch.update(userRef, {
          credits: monthlyLimit,
          totalUsedThisMonth: 0,
          lastResetAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create ledger entry
        const ledgerRef = db.collection(`apps/${appId}/creditLedger`).doc();
        batch.set(ledgerRef, {
          uid: userDoc.id,
          delta: monthlyLimit - (userDoc.data().credits || 0),
          reason: 'monthly_reset',
          source: 'system',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        batchCount++;
        totalReset++;

        // Commit batch every 400 operations (Firestore limit is 500)
        if (batchCount >= 200) {
          await batch.commit();
          batchCount = 0;
        }
      }

      // Commit remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }
    }

    console.log(`Monthly credit reset complete. ${totalReset} users reset.`);
    return null;
  });
```

---

## FUNCTION EXPORT (index.ts)

```typescript
// functions/src/index.ts
import * as admin from 'firebase-admin';

admin.initializeApp();

export { initAppUser } from './initAppUser';
export { consumeCredits } from './consumeCredits';
export { adminAdjustCredits } from './adminAdjustCredits';
export { assignAppRole } from './assignAppRole';
export { monthlyCreditsReset } from './monthlyCreditsReset';
```

---

## DEPLOYMENT

```bash
cd functions
npm run build
firebase deploy --only functions
```

---

## SETUP: INITIAL SUPERVISOR CLAIM

Run this script once to set the supervisor claim for the project owner:

```javascript
// scripts/setSupervisor.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const SUPERVISOR_UID = 'YOUR_SUPERVISOR_UID_HERE';

async function main() {
  await admin.auth().setCustomUserClaims(SUPERVISOR_UID, { supervisor: true });
  console.log('Supervisor claim set successfully');
  
  // Verify
  const user = await admin.auth().getUser(SUPERVISOR_UID);
  console.log('Custom claims:', user.customClaims);
}

main().catch(console.error);
```

---

**EINDE CLOUD FUNCTIONS CANON**
