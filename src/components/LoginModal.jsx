import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
    const {
        signInWithEmail,
        registerWithEmail,
        resetPassword,
        authError,
        clearError
    } = useAuth();

    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setMode('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setMessage(null);
        clearError();
        onClose();
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setMessage({ type: 'error', text: 'Vul alle velden in.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        const result = await signInWithEmail(email, password);
        setLoading(false);

        if (result.success) {
            handleClose();
        } else if (result.needsVerification) {
            setMessage({ type: 'warning', text: result.message });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            setMessage({ type: 'error', text: 'Vul alle velden in.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen.' });
            return;
        }
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 karakters zijn.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        const result = await registerWithEmail(email, password, displayName);
        setLoading(false);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage({ type: 'error', text: 'Voer je emailadres in.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        const result = await resetPassword(email);
        setLoading(false);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setMessage(null);
        clearError();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-card rounded-2xl border border-theme shadow-xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 size-10 flex items-center justify-center rounded-full hover:bg-gray-500/10 transition-colors z-10"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="p-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="size-14 bg-[#2860E0] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-3">
                            DC
                        </div>
                        <h2 className="text-xl font-bold">
                            {mode === 'login' && 'Inloggen'}
                            {mode === 'register' && 'Account aanmaken'}
                            {mode === 'forgot' && 'Wachtwoord vergeten'}
                        </h2>
                    </div>

                    {/* Message */}
                    {(message || authError) && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${message?.type === 'success'
                                ? 'bg-green-500/10 border border-green-500 text-green-600 dark:text-green-400'
                                : message?.type === 'warning'
                                    ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-600 dark:text-yellow-400'
                                    : 'bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400'
                            }`}>
                            {message?.text || authError}
                        </div>
                    )}

                    {/* Login Form */}
                    {mode === 'login' && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="naam@dacapocollege.nl"
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-1">
                                    Wachtwoord
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => switchMode('forgot')}
                                className="text-sm text-[#2860E0] hover:underline"
                            >
                                Wachtwoord vergeten?
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Bezig...' : 'Inloggen'}
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                                    Naam (optioneel)
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Je naam"
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="regEmail" className="block text-sm font-medium mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="regEmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="naam@dacapocollege.nl"
                                    required
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="regPassword" className="block text-sm font-medium mb-1">
                                    Wachtwoord *
                                </label>
                                <input
                                    type="password"
                                    id="regPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimaal 6 karakters"
                                    required
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                    Bevestig wachtwoord *
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Herhaal wachtwoord"
                                    required
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Bezig...' : 'Registreren'}
                            </button>
                        </form>
                    )}

                    {/* Forgot Password Form */}
                    {mode === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <p className="text-sm text-secondary mb-4">
                                Voer je emailadres in en we sturen je een link om je wachtwoord te resetten.
                            </p>
                            <div>
                                <label htmlFor="forgotEmail" className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="forgotEmail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="naam@dacapocollege.nl"
                                    required
                                    className="w-full h-12 px-4 rounded-lg border border-theme bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Bezig...' : 'Verstuur reset link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="w-full text-sm text-[#2860E0] hover:underline"
                            >
                                ← Terug naar inloggen
                            </button>
                        </form>
                    )}

                    {/* Switch mode */}
                    {mode !== 'forgot' && (
                        <p className="text-center text-sm mt-6">
                            {mode === 'login' ? (
                                <>
                                    Nog geen account?{' '}
                                    <button
                                        onClick={() => switchMode('register')}
                                        className="text-[#2860E0] font-medium hover:underline"
                                    >
                                        Registreer
                                    </button>
                                </>
                            ) : (
                                <>
                                    Heb je al een account?{' '}
                                    <button
                                        onClick={() => switchMode('login')}
                                        className="text-[#2860E0] font-medium hover:underline"
                                    >
                                        Inloggen
                                    </button>
                                </>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
