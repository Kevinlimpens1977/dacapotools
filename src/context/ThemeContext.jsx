import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage, default to light mode
        const saved = localStorage.getItem('dacapo-theme');
        return saved === 'dark';
    });

    useEffect(() => {
        // Update document body class and localStorage
        if (isDarkMode) {
            document.body.classList.add('dark');
            localStorage.setItem('dacapo-theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('dacapo-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
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
