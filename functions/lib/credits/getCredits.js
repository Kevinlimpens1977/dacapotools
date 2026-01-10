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
exports.getCredits = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
// 🔴 VERPLICHT: initialiseer Admin SDK
const db = admin.firestore();
/**
 * getCredits
 * Read-only helper to get current credits for a user's app.
 * Does NOT write to ledger.
 */
exports.getCredits = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    var _a, _b, _c, _d, _e;
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
    const appUserSnap = await appUserRef.get();
    if (!appUserSnap.exists) {
        return {
            success: true,
            exists: false,
            data: null
        };
    }
    const data = (_a = appUserSnap.data()) !== null && _a !== void 0 ? _a : {};
    return {
        success: true,
        exists: true,
        data: {
            credits: (_b = data.credits) !== null && _b !== void 0 ? _b : 0,
            totalUsedThisMonth: (_c = data.totalUsedThisMonth) !== null && _c !== void 0 ? _c : 0,
            lastResetAt: (_d = data.lastResetAt) !== null && _d !== void 0 ? _d : null,
            role: (_e = data.role) !== null && _e !== void 0 ? _e : 'user'
        }
    };
});
//# sourceMappingURL=getCredits.js.map