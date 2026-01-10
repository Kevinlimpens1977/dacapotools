"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAdjustCredits = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const db = admin.firestore();
/**
 * adminAdjustCredits
 * Supervisor-only function to adjust a user's credits.
 * Writes ledger entry.
 */
exports.adminAdjustCredits = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required');
    }
    // Supervisor check via custom claims ONLY
    if (request.auth.token.supervisor !== true) {
        throw new https_1.HttpsError('permission-denied', 'Supervisor access required');
    }
    const supervisorUid = request.auth.uid;
    const { appId, targetUid, delta, reason } = request.data;
    if (!appId || typeof appId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'appId is required');
    }
    if (!targetUid || typeof targetUid !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'targetUid is required');
    }
    if (typeof delta !== 'number') {
        throw new https_1.HttpsError('invalid-argument', 'delta must be a number');
    }
    const appUserRef = db.doc(`apps/${appId}/users/${targetUid}`);
    return db.runTransaction(async (transaction) => {
        var _a;
        const appUserSnap = await transaction.get(appUserRef);
        if (!appUserSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Target user not found for this app');
        }
        const userData = appUserSnap.data();
        const currentCredits = (_a = userData.credits) !== null && _a !== void 0 ? _a : 0;
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
});
//# sourceMappingURL=adminAdjustCredits.js.map