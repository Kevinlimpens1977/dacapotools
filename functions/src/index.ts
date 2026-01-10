/**
 * DaCapo Tools - Cloud Functions
 * CANON IMPLEMENTATION
 */

import * as admin from 'firebase-admin';

// 🔴 EXACT 1 KEER initialiseren — HIER
admin.initializeApp();

// Credits
export { initAppUser } from './credits/initAppUser';
export { getCredits } from './credits/getCredits';
export { consumeCredits } from './credits/consumeCredits';
export { adminAdjustCredits } from './credits/adminAdjustCredits';
