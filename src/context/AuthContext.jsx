/**
 * AuthContext - CANONICAL IMPLEMENTATION
 * 
 * DaCapo Tools v1.0
 * 
 * SUPERVISOR POLICY (ABSOLUTE):
 * - There is EXACTLY ONE supervisor
 * - Supervisor role is determined EXCLUSIVELY via Firebase Custom Claims
 * - NO Firestore-based supervisor resolution is allowed
 * - Custom claim: request.auth.token.supervisor === true
 * 
 * USER POLICY:
 * - Users may only sign up with email ending in @stichtinglvo.nl
 * - On first login: create /users/{uid} (identity only)
 * - App roles are stored in /apps/{appId}/users/{uid}
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut as firebaseSignOut,
    getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getEffectiveRole, getPlatformRole, hasPermission as checkPermission, ROLES, isAllowedEmail, ALLOWED_EMAIL_DOMAIN } from '../config/roles';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [customClaims, setCustomClaims] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Theme context for loading/saving theme preference
    const { setThemeFromPreference, getThemePreference } = useTheme();

    // CANONICAL: Supervisor is determined EXCLUSIVELY from custom claims
    const isSupervisor = customClaims?.supervisor === true;

    // Platform role (supervisor or user - no Firestore lookup)
    const platformRole = getPlatformRole(isSupervisor);

    // For backward compatibility: userRole and isAdmin
    // In canonical model, admin is per-app, but for platform-level we use platformRole
    const userRole = platformRole;
    const isAdmin = isSupervisor; // Only supervisor has admin-level platform access

    /**
     * Check if current user has a specific permission
     * @param {string} permission - Permission key from roles.js
     * @returns {boolean}
     */
    const hasPermission = (permission) => checkPermission(userRole, permission);

    /**
     * Get app-specific role for a user
     * @param {string} appId - The app to check role for
     * @returns {Promise<string>} - 'user', 'administrator', or 'supervisor'
     */
    const getAppRole = async (appId) => {
        if (isSupervisor) return ROLES.SUPERVISOR;
        if (!user?.uid || !appId) return ROLES.USER;

        try {
            const appUserRef = doc(db, 'apps', appId, 'users', user.uid);
            const appUserSnap = await getDoc(appUserRef);
            if (appUserSnap.exists()) {
                const appRole = appUserSnap.data()?.role;
                return getEffectiveRole(isSupervisor, appRole);
            }
        } catch (error) {
            console.error('[Auth] Error fetching app role:', error);
        }
        return ROLES.USER;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // CANONICAL: Get custom claims for supervisor check
                try {
                    const tokenResult = await getIdTokenResult(firebaseUser);
                    setCustomClaims(tokenResult.claims);
                } catch (error) {
                    console.error('[Auth] Error getting custom claims:', error);
                    setCustomClaims({});
                }

                // Fetch or create user document in Firestore (identity only)
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserData(data);
                    // Apply user's theme preference (default to light if missing)
                    setThemeFromPreference(data.themePreference || 'light');
                    // Update last login
                    await updateDoc(userRef, { lastLogin: new Date() });
                } else {
                    // Create new user document (identity only - NO role field)
                    const newUserData = {
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
                        photoURL: firebaseUser.photoURL || '',
                        favorites: [],
                        createdAt: new Date(),
                        lastLogin: new Date()
                        // NOTE: No 'role' field - roles are per-app or via custom claims
                    };
                    await setDoc(userRef, newUserData);
                    setUserData(newUserData);
                }
            } else {
                setUserData(null);
                setCustomClaims(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Email/Password Sign In
    const signInWithEmail = async (email, password) => {
        try {
            setAuthError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Check email verification
            if (!userCredential.user.emailVerified) {
                return {
                    success: false,
                    message: 'Verifieer eerst je email voordat je inlogt.',
                    needsVerification: true
                };
            }

            return { success: true };
        } catch (error) {
            console.error('Error signing in with email:', error);
            const message = getErrorMessage(error.code);
            setAuthError(message);
            return { success: false, message };
        }
    };

    // Email/Password Registration - CANONICAL: Only @stichtinglvo.nl allowed
    const registerWithEmail = async (email, password, displayName = '') => {
        try {
            setAuthError(null);

            // CANONICAL: Validate email domain
            if (!isAllowedEmail(email)) {
                const message = `Registratie is alleen mogelijk met een ${ALLOWED_EMAIL_DOMAIN} emailadres.`;
                setAuthError(message);
                return { success: false, message };
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Send verification email
            await sendEmailVerification(userCredential.user);
            console.log('[Auth] Verification email sent to:', email);

            // Create user document with display name
            const userRef = doc(db, 'users', userCredential.user.uid);
            const newUserData = {
                email: userCredential.user.email,
                displayName: displayName || email.split('@')[0],
                photoURL: '',
                favorites: [],
                createdAt: new Date(),
                lastLogin: new Date()
                // NOTE: No 'role' field - roles are per-app or via custom claims
            };
            await setDoc(userRef, newUserData);

            return {
                success: true,
                message: 'Account aangemaakt! Controleer je email voor de verificatielink.'
            };
        } catch (error) {
            console.error('Error registering:', error);
            const message = getErrorMessage(error.code);
            setAuthError(message);
            return { success: false, message };
        }
    };

    // Password Reset
    const resetPassword = async (email) => {
        try {
            setAuthError(null);
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Wachtwoord reset link is verstuurd naar je email.'
            };
        } catch (error) {
            console.error('Error sending password reset:', error);
            const message = getErrorMessage(error.code);
            setAuthError(message);
            return { success: false, message };
        }
    };

    // Resend verification email
    const resendVerification = async () => {
        try {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                await sendEmailVerification(auth.currentUser);
                return { success: true, message: 'Verificatie email opnieuw verstuurd!' };
            }
            return { success: false, message: 'Geen gebruiker om te verifiëren.' };
        } catch (error) {
            console.error('Error resending verification:', error);
            return { success: false, message: getErrorMessage(error.code) };
        }
    };

    // Sign Out - save theme preference before logging out
    const signOut = async () => {
        try {
            // Save current theme preference to Firestore before signing out
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { themePreference: getThemePreference() });
            }
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Toggle Favorite
    const toggleFavorite = async (toolId) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const isFav = userData?.favorites?.includes(toolId);

        try {
            if (isFav) {
                await updateDoc(userRef, { favorites: arrayRemove(toolId) });
                setUserData(prev => ({
                    ...prev,
                    favorites: prev.favorites.filter(id => id !== toolId)
                }));
            } else {
                await updateDoc(userRef, { favorites: arrayUnion(toolId) });
                setUserData(prev => ({
                    ...prev,
                    favorites: [...(prev.favorites || []), toolId]
                }));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const isFavorite = (toolId) => {
        return userData?.favorites?.includes(toolId) || false;
    };

    // Refresh custom claims (call after role changes)
    const refreshClaims = async () => {
        if (auth.currentUser) {
            try {
                await auth.currentUser.getIdToken(true); // Force refresh
                const tokenResult = await getIdTokenResult(auth.currentUser);
                setCustomClaims(tokenResult.claims);
            } catch (error) {
                console.error('[Auth] Error refreshing claims:', error);
            }
        }
    };

    // Clear auth error
    const clearError = () => setAuthError(null);

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            customClaims,
            loading,
            // Role system - CANONICAL
            userRole,
            platformRole,
            isAdmin,
            isSupervisor,
            hasPermission,
            getAppRole,
            refreshClaims,
            // Auth methods
            authError,
            signInWithEmail,
            registerWithEmail,
            resetPassword,
            resendVerification,
            signOut,
            toggleFavorite,
            isFavorite,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Error message translations
function getErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'Dit emailadres is al in gebruik.',
        'auth/invalid-email': 'Ongeldig emailadres.',
        'auth/operation-not-allowed': 'Deze inlogmethode is niet toegestaan.',
        'auth/weak-password': 'Wachtwoord is te zwak. Gebruik minimaal 6 karakters.',
        'auth/user-disabled': 'Dit account is uitgeschakeld.',
        'auth/user-not-found': 'Geen account gevonden met dit emailadres.',
        'auth/wrong-password': 'Onjuist wachtwoord.',
        'auth/invalid-credential': 'Ongeldige inloggegevens.',
        'auth/too-many-requests': 'Te veel pogingen. Probeer het later opnieuw.',
        'auth/network-request-failed': 'Netwerkfout. Controleer je internetverbinding.',
        'auth/popup-closed-by-user': 'Login popup gesloten.',
        'auth/cancelled-popup-request': 'Login geannuleerd.'
    };
    return messages[errorCode] || 'Er ging iets mis. Probeer het opnieuw.';
}
