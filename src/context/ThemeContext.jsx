/**
 * ThemeContext
 * 
 * Provides theme state (light/dark) and toggle functionality.
 * 
 * Theme Persistence:
 * - Default is LIGHT mode on first visit
 * - Theme is stored in localStorage for immediate application (no flicker)
 * - When user logs in, their preference from Firestore overrides localStorage
 * - When user logs out, current theme is saved to Firestore
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Initialize from localStorage for immediate application (prevents flicker)
    // Default to light mode if no preference is stored
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('dacapo-theme');
        return saved === 'dark';
    });

    // Apply theme class to body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark');
            localStorage.setItem('dacapo-theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('dacapo-theme', 'light');
        }
    }, [isDarkMode]);

    // Toggle theme
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    /**
     * Set theme from user preference (called on login)
     * @param {'light' | 'dark' | undefined} preference - User's stored preference
     */
    const setThemeFromPreference = useCallback((preference) => {
        if (preference === 'dark') {
            setIsDarkMode(true);
        } else {
            // Default to light for 'light', undefined, or any other value
            setIsDarkMode(false);
        }
    }, []);

    /**
     * Get current theme preference string (for saving to Firestore)
     * @returns {'light' | 'dark'}
     */
    const getThemePreference = useCallback(() => {
        return isDarkMode ? 'dark' : 'light';
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{
            isDarkMode,
            toggleTheme,
            setThemeFromPreference,
            getThemePreference
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
