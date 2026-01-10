/**
 * Role Definitions and Permission Mapping
 * 
 * CANONICAL IMPLEMENTATION - DaCapo Tools v1.0
 * 
 * Supervisor role is determined EXCLUSIVELY via Firebase Custom Claims.
 * NO Firestore-based supervisor resolution is allowed.
 * 
 * Role Resolution:
 * 1. Supervisor: Firebase Custom Claims (request.auth.token.supervisor === true)
 * 2. Admin: Per-app role in /apps/{appId}/users/{uid}.role === 'administrator'
 * 3. User: Default role for all authenticated users
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
    VIEW_STATS: [ROLES.ADMIN, ROLES.SUPERVISOR],
    ASSIGN_ROLES: [ROLES.SUPERVISOR],
    MANAGE_USERS: [ROLES.SUPERVISOR]
};

/**
 * Allowed email domain for user registration
 * Users may only sign up with emails ending in this domain
 */
export const ALLOWED_EMAIL_DOMAIN = '@stichtinglvo.nl';

/**
 * Check if an email is allowed to register
 * @param {string} email 
 * @returns {boolean}
 */
export function isAllowedEmail(email) {
    if (!email) return false;
    return email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
}

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
 * Determine effective role from custom claims and app-level role
 * 
 * CANONICAL RULE:
 * - Supervisor is ONLY determined via custom claims (isSupervisorClaim)
 * - Admin is determined via app-level role (for specific app context)
 * - Default is user
 * 
 * @param {boolean} isSupervisorClaim - From Firebase Custom Claims
 * @param {string} appRole - From /apps/{appId}/users/{uid}.role (optional)
 * @returns {string}
 */
export function getEffectiveRole(isSupervisorClaim, appRole = null) {
    // Supervisor from custom claims takes absolute precedence
    if (isSupervisorClaim === true) {
        return ROLES.SUPERVISOR;
    }

    // App-level admin role
    if (appRole === 'administrator' || appRole === 'admin') {
        return ROLES.ADMIN;
    }

    // Default to user
    return ROLES.USER;
}

/**
 * Get platform-level role (supervisor or user)
 * Used for platform-wide access control
 * 
 * @param {boolean} isSupervisorClaim - From Firebase Custom Claims
 * @returns {string}
 */
export function getPlatformRole(isSupervisorClaim) {
    return isSupervisorClaim === true ? ROLES.SUPERVISOR : ROLES.USER;
}
