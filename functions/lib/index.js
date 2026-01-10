"use strict";
/**
 * DaCapo Tools - Cloud Functions
 * CANON IMPLEMENTATION
 */
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
exports.adminAdjustCredits = exports.consumeCredits = exports.getCredits = exports.initAppUser = void 0;
const admin = __importStar(require("firebase-admin"));
// 🔴 EXACT 1 KEER initialiseren — HIER
admin.initializeApp();
// Credits
var initAppUser_1 = require("./credits/initAppUser");
Object.defineProperty(exports, "initAppUser", { enumerable: true, get: function () { return initAppUser_1.initAppUser; } });
var getCredits_1 = require("./credits/getCredits");
Object.defineProperty(exports, "getCredits", { enumerable: true, get: function () { return getCredits_1.getCredits; } });
var consumeCredits_1 = require("./credits/consumeCredits");
Object.defineProperty(exports, "consumeCredits", { enumerable: true, get: function () { return consumeCredits_1.consumeCredits; } });
var adminAdjustCredits_1 = require("./credits/adminAdjustCredits");
Object.defineProperty(exports, "adminAdjustCredits", { enumerable: true, get: function () { return adminAdjustCredits_1.adminAdjustCredits; } });
//# sourceMappingURL=index.js.map