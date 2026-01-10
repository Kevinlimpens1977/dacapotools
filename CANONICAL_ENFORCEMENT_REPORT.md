# CANONICAL ENFORCEMENT REPORT
# DaCapo Tools v1.0
# Date: 2026-01-09

---

## A. IMPLEMENTED CHANGES

### Security Rules

1. **Updated `FIRESTORE_RULES.md`**
   - Replaced all supervisor checks with: `request.auth.token.supervisor == true`
   - Credits are NOT writable client-side (all mutations via Cloud Functions)
   - creditLedger is immutable (no client writes)
   - App user documents (`/apps/{appId}/users/{uid}`) are read-only client-side
   - Legacy location (`/users/{uid}/apps/{appId}`) set to read-only during migration

2. **Helper Functions Updated**
   ```javascript
   function isSupervisor() {
       return isAuthenticated() && request.auth.token.supervisor == true;
   }
   ```

### Cloud Functions

1. **Created `CLOUD_FUNCTIONS.md`** with full specification for:
   - `initAppUser(appId, uid)` - Initialize user for app
   - `consumeCredits(appId, uid, amount, action)` - Deduct credits after action
   - `adminAdjustCredits(appId, uid, delta, reason)` - SUPERVISOR ONLY
   - `assignAppRole(appId, targetUid, role)` - SUPERVISOR ONLY
   - `monthlyCreditsReset` - Scheduled monthly reset

2. **Supervisor Check in All Functions**
   ```javascript
   if (context.auth.token.supervisor !== true) {
       throw new functions.https.HttpsError('permission-denied', 'Supervisor access required');
   }
   ```

3. **Supervisor Claim Setup Script** provided for initial setup

### Role Resolution Logic

1. **Updated `src/config/roles.js`**
   - Removed all Firestore-based supervisor resolution
   - Removed email-based fallback for supervisor
   - Supervisor determined EXCLUSIVELY via custom claims
   - Added `ALLOWED_EMAIL_DOMAIN = '@stichtinglvo.nl'`
   - Added `isAllowedEmail()` function

2. **Updated `src/context/AuthContext.jsx`**
   - Added `getIdTokenResult()` to fetch custom claims
   - `isSupervisor` now derived from `customClaims?.supervisor === true`
   - Removed `userData?.role` from supervisor resolution
   - User documents no longer contain `role` field
   - Added email domain validation for registration
   - Added `getAppRole(appId)` for per-app role checking
   - Added `refreshClaims()` for refreshing after role changes

3. **Updated `src/firebase.js`**
   - Added Cloud Functions initialization
   - Removed `ADMIN_EMAIL` constant

4. **Updated `src/services/CreditService.js`**
   - All mutations now via Cloud Functions
   - Frontend is READ-ONLY
   - Added canonical data location support (`/apps/{appId}/users/{uid}`)
   - Legacy location fallback during migration

5. **Updated `src/hooks/useCredits.js`**
   - Works with updated CreditService
   - Auto-initializes via Cloud Function

6. **Updated `src/components/LoginModal.jsx`**
   - Email domain validation for `@stichtinglvo.nl`
   - Visual feedback for invalid email domains

7. **Updated `dacapo-canonical-reference.md`**
   - Section E.4: Supervisor role via custom claims only
   - Section I.1: Security rules with custom claims

---

## B. BLOCKERS

### 1. Cloud Functions Not Deployed

**Status:** BLOCKED  
**Reason:** Cloud Functions code is specified in `CLOUD_FUNCTIONS.md` but actual deployment requires:
- Access to `functions/` directory (outside current workspace)
- Running `firebase deploy --only functions`

**Manual Step Required:**
1. Create Cloud Functions in `functions/src/` directory
2. Copy code from `CLOUD_FUNCTIONS.md`
3. Deploy with Firebase CLI

### 2. Supervisor Custom Claim Not Set

**Status:** BLOCKED  
**Reason:** Firebase Custom Claims must be set via Firebase Admin SDK, which cannot be executed from frontend.

**Manual Step Required:**
1. Run the setup script provided in `CLOUD_FUNCTIONS.md`:
```javascript
const admin = require('firebase-admin');
admin.initializeApp();
await admin.auth().setCustomUserClaims('YOUR_UID', { supervisor: true });
```

### 3. Security Rules Not Deployed

**Status:** BLOCKED  
**Reason:** Security rules must be deployed to Firebase Console.

**Manual Step Required:**
1. Copy rules from `FIRESTORE_RULES.md`
2. Deploy via Firebase Console or `firebase deploy --only firestore:rules`

### 4. Data Migration Required

**Status:** BLOCKED  
**Reason:** Existing data in legacy location (`/users/{uid}/apps/{appId}`) must be migrated.

**Manual Step Required:**
1. Create migration script to move data to `/apps/{appId}/users/{uid}`
2. Remove `role` field from `/users/{uid}` documents
3. Run migration via Cloud Function or Admin script

### 5. Apps Collection Not Initialized

**Status:** BLOCKED  
**Reason:** `/apps/{appId}` collection must be created with app configurations.

**Manual Step Required:**
1. Create documents in `/apps/` for each app (paco, translate, nieuwsbrief, gastenregistratie)
2. Copy configuration from `APP_CREDITS_CONFIG`

---

## C. FINAL STATUS

❌ **Project is NON-CONFORM**

**Reasons:**

1. **Cloud Functions not deployed** - All credit mutations and role assignments require Cloud Functions which are specified but not deployed
2. **Supervisor custom claim not set** - The project owner's UID needs the `supervisor: true` custom claim
3. **Security rules not deployed** - Updated rules with custom claims check not yet active in Firebase
4. **Data not migrated** - Legacy data structure still in use
5. **Apps collection not initialized** - Canonical data location not yet populated

**To achieve CONFORM status:**

1. Set supervisor custom claim for project owner UID
2. Deploy Cloud Functions from `CLOUD_FUNCTIONS.md`
3. Deploy Security Rules from `FIRESTORE_RULES.md`
4. Create `/apps/{appId}` documents
5. Run data migration from legacy to canonical location
6. Test all flows end-to-end

---

**END REPORT**
