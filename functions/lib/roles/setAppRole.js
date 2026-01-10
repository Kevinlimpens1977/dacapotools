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
exports.setAppRole = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const db = admin.firestore();
/**
 * setAppRole
 * Supervisor-only function to set a user's role for a specific app.
 */
exports.setAppRole = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required');
    }
    // Supervisor check via custom claims ONLY
    if (request.auth.token.supervisor !== true) {
        throw new https_1.HttpsError('permission-denied', 'Supervisor access required');
    }
    const { appId, targetUid, role } = request.data;
    if (!appId || typeof appId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'appId is required');
    }
    if (!targetUid || typeof targetUid !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'targetUid is required');
    }
    const validRoles = ['user', 'administrator'];
    if (!role || !validRoles.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', `role must be one of: ${validRoles.join(', ')}`);
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
        }
        else {
            transaction.update(appUserRef, { role });
        }
        return {
            success: true,
            appId,
            targetUid,
            role
        };
    });
});
//# sourceMappingURL=setAppRole.js.map