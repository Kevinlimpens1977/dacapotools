/**
 * Role Definitions and Permission Mapping
 * 
 * Defines user roles and their permissions in the DaCapo Toolbox.
 * 
 * Role Resolution:
 * 1. Primary: users/{uid}.role field in Firestore
 * 2. Fallback: Hardcoded supervisor email list
 */

export const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor'
};

/**
 * Permission definitions
 * Each permission lists which roles have access
 */
export const PERMISSIONS = {
    CREDITS_VIEW_OWN: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERVISOR],
    CREDITS_VIEW_ALL: [ROLES.ADMIN, ROLES.SUPERVISOR],
    CREDITS_MODIFY: [ROLES.SUPERVISOR],
    ADMIN_DASHBOARD: [ROLES.ADMIN, ROLES.SUPERVISOR],
    MANAGE_TOOLS: [ROLES.ADMIN, ROLES.SUPERVISOR],
    MANAGE_LABELS: [ROLES.ADMIN, ROLES.SUPERVISOR],
    VIEW_STATS: [ROLES.ADMIN, ROLES.SUPERVISOR]
};

/**
 * Supervisor emails (hardcoded fallback)
 * Primary source is users/{uid}.role in Firestore
 */
export const SUPERVISOR_EMAILS = [
    'kevlimpens@gmail.com'
];

/**
 * Admin emails (hardcoded fallback)
 */
export const ADMIN_EMAILS = [
    'kevlimpens@gmail.com'
];

/**
 * Check if a role has a specific permission
 * @param {string} role - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
}

/**
 * Get role from email (fallback when Firestore role is not set)
 * @param {string} email 
 * @returns {string}
 */
export function getRoleFromEmail(email) {
    const lowerEmail = email?.toLowerCase();
    if (!lowerEmail) return ROLES.USER;

    if (SUPERVISOR_EMAILS.includes(lowerEmail)) {
        return ROLES.SUPERVISOR;
    }
    if (ADMIN_EMAILS.includes(lowerEmail)) {
        return ROLES.ADMIN;
    }
    return ROLES.USER;
}

/**
 * Determine effective role
 * Priority: Firestore role > email-based role
 * @param {string} firestoreRole - Role from user's Firestore document
 * @param {string} email - User's email
 * @returns {string}
 */
export function getEffectiveRole(firestoreRole, email) {
    if (firestoreRole && Object.values(ROLES).includes(firestoreRole)) {
        return firestoreRole;
    }
    return getRoleFromEmail(email);
}
