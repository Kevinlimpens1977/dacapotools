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
exports.initAppUser = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const db = admin.firestore();
/**
 * initAppUser
 * Initialize a user for a specific app on first use.
 * Creates /apps/{appId}/users/{uid} with default values.
 */
exports.initAppUser = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required');
    }
    const uid = request.auth.uid;
    const { appId } = request.data;
    if (!appId || typeof appId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'appId is required');
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
        const userData = {
            role: 'user',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Add credits if app uses credit system
        if (appConfig === null || appConfig === void 0 ? void 0 : appConfig.hasCredits) {
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
});
//# sourceMappingURL=initAppUser.js.map