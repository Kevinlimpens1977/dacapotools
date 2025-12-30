import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL } from '../firebase';
import { getEffectiveRole, hasPermission as checkPermission, ROLES } from '../config/roles';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Theme context for loading/saving theme preference
    const { setThemeFromPreference, getThemePreference } = useTheme();

    // Compute role from Firestore role field (primary) or email fallback
    const userRole = getEffectiveRole(userData?.role, user?.email);
    const isAdmin = userRole === ROLES.ADMIN || userRole === ROLES.SUPERVISOR;
    const isSupervisor = userRole === ROLES.SUPERVISOR;

    /**
     * Check if current user has a specific permission
     * @param {string} permission - Permission key from roles.js
     * @returns {boolean}
     */
    const hasPermission = (permission) => checkPermission(userRole, permission);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch or create user document in Firestore
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
                    // Create new user document
                    const newUserData = {
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
                        photoURL: firebaseUser.photoURL || '',
                        favorites: [],
                        isAdmin: firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
                        createdAt: new Date(),
                        lastLogin: new Date()
                    };
                    await setDoc(userRef, newUserData);
                    setUserData(newUserData);
                }
            } else {
                setUserData(null);
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

    // Email/Password Registration
    const registerWithEmail = async (email, password, displayName = '') => {
        try {
            setAuthError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Send verification email
            await sendEmailVerification(userCredential.user);
            console.log('[Auth] Verification email sent to:', email);

            // Update display name in user data
            if (displayName) {
                const userRef = doc(db, 'users', userCredential.user.uid);
                await updateDoc(userRef, { displayName });
            }

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

    // Clear auth error
    const clearError = () => setAuthError(null);

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            // Role system
            userRole,
            isAdmin,
            isSupervisor,
            hasPermission,
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
