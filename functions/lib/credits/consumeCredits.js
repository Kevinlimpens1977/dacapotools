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
exports.consumeCredits = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const db = admin.firestore();
/**
 * consumeCredits
 * Deduct credits after a successful app action.
 * Writes ledger entry.
 */
exports.consumeCredits = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required');
    }
    const uid = request.auth.uid;
    const { appId, amount, reason } = request.data;
    if (!appId || typeof appId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'appId is required');
    }
    if (typeof amount !== 'number' || amount <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'amount must be a positive number');
    }
    const appUserRef = db.doc(`apps/${appId}/users/${uid}`);
    return db.runTransaction(async (transaction) => {
        var _a, _b;
        const appUserSnap = await transaction.get(appUserRef);
        if (!appUserSnap.exists) {
            throw new https_1.HttpsError('not-found', 'User not initialized for this app');
        }
        const userData = appUserSnap.data();
        const currentCredits = (_a = userData.credits) !== null && _a !== void 0 ? _a : 0;
        if (currentCredits < amount) {
            throw new https_1.HttpsError('resource-exhausted', 'Insufficient credits');
        }
        const newCredits = currentCredits - amount;
        const newTotalUsed = ((_b = userData.totalUsedThisMonth) !== null && _b !== void 0 ? _b : 0) + amount;
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
});
//# sourceMappingURL=consumeCredits.js.map