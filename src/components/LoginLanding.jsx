import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from '../config/roles';

export default function LoginLanding() {
    const {
        signInWithEmail,
        registerWithEmail,
        resetPassword,
        authError,
        clearError
    } = useAuth();

    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
    const [username, setUsername] = useState(''); // Changed from email to username
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [animateCard, setAnimateCard] = useState(false);

    useEffect(() => {
        setAnimateCard(true);
    }, []);

    // Helper to construct full email
    const getFullEmail = (userPart) => {
        if (!userPart) return '';
        return `${userPart}${ALLOWED_EMAIL_DOMAIN}`;
    };

    const handleUsernameChange = (e) => {
        // Prevent @ and spaces
        const val = e.target.value.replace(/[@\s]/g, '');
        setUsername(val);
        // Clear specific error if user is typing
        if (message?.text?.includes('Gebruik alleen')) {
            setMessage(null);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setMessage({ type: 'error', text: 'Vul alle velden in.' });
            return;
        }

        const fullEmail = getFullEmail(username);

        // Security check (redundant but safe)
        if (!isAllowedEmail(fullEmail)) {
            setMessage({ type: 'error', text: 'Alleen Stichting LVO-accounts zijn toegestaan' });
            return;
        }

        setLoading(true);
        setMessage(null);
        const result = await signInWithEmail(fullEmail, password);
        setLoading(false);

        if (!result.success) {
            if (result.needsVerification) {
                setMessage({ type: 'warning', text: result.message });
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const fullEmail = getFullEmail(username);

        if (!username || !password || !confirmPassword) {
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
        const result = await registerWithEmail(fullEmail, password, displayName);
        setLoading(false);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!username) {
            setMessage({ type: 'error', text: 'Voer je gebruikersnaam in.' });
            return;
        }

        const fullEmail = getFullEmail(username);
        setLoading(true);
        setMessage(null);
        const result = await resetPassword(fullEmail);
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
        // Keep username if switching? Yes, helpful.
        setPassword('');
        setConfirmPassword('');
    };

    // Style classes
    const labelClass = "block text-sm font-medium mb-1 text-white/90";
    // Input Group wrapper styles
    const inputGroupClass = "flex items-center w-full rounded-lg border border-white/20 bg-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#2860E0] focus-within:border-transparent transition-all";
    const inputFieldClass = "flex-1 h-12 px-4 bg-transparent text-white outline-none placeholder-white/30";
    const suffixClass = "px-4 h-12 flex items-center bg-white/5 text-white/50 text-sm border-l border-white/10 select-none pointer-events-none";

    // Password input (standard styled)
    const passwordInputClass = "w-full h-12 px-4 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#2860E0] focus:border-transparent outline-none transition-all";

    return (
        <div
            className="min-h-screen w-full bg-[#0B2559] bg-cover bg-top flex items-center justify-center md:justify-end p-4 md:p-16 relative overflow-hidden"
            style={{
                backgroundImage: "url('/login-bg.jpg')",
            }}
        >
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            <div className={`w-full max-w-[480px] bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 relative z-10 text-white transition-all duration-700 transform ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                        Welkom bij<br />
                        <span className="text-[#4D8EFF]">DaCapo Tools</span>
                    </h1>
                    <p className="text-lg text-white/70 font-light">
                        Alles voor onderwijs, op één plek.
                    </p>
                </div>

                {/* Form Content */}
                <div className="space-y-6">

                    {/* Message Area */}
                    {(message || authError) && (
                        <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${message?.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                            <span className="material-symbols-outlined text-lg">
                                {message?.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            <span>{message?.text || authError}</span>
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {mode === 'login' && (
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div>
                                <label htmlFor="username" className={labelClass}>Gebruikersnaam</label>
                                <div className={inputGroupClass}>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        placeholder="v.achternaam"
                                        className={inputFieldClass}
                                        autoComplete="username"
                                    />
                                    <div className={suffixClass}>
                                        {ALLOWED_EMAIL_DOMAIN}
                                    </div>
                                </div>
                                <p className="text-xs text-white/50 mt-1 ml-1">
                                    Je hoeft geen {ALLOWED_EMAIL_DOMAIN} te typen
                                </p>
                            </div>

                            <div>
                                <label htmlFor="password" className={labelClass}>Wachtwoord</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={passwordInputClass}
                                    autoComplete="current-password"
                                // NO placeholder as requested
                                />
                                <div className="flex justify-end mt-1">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('forgot')}
                                        className="text-xs text-[#4D8EFF] hover:text-[#7aaaff] transition-colors"
                                    >
                                        Wachtwoord vergeten?
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#2860E0] hover:bg-[#326bf5] active:bg-[#1C4DAB] text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[#2860E0]/30 disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Inloggen...' : 'Inloggen'}
                            </button>
                        </form>
                    )}

                    {/* REGISTER FORM */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className={labelClass}>Naam (optioneel)</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Je naam"
                                    className={passwordInputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="regUsername" className={labelClass}>Gebruikersnaam</label>
                                <div className={inputGroupClass}>
                                    <input
                                        type="text"
                                        id="regUsername"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        placeholder="v.achternaam"
                                        className={inputFieldClass}
                                    />
                                    <div className={suffixClass}>
                                        {ALLOWED_EMAIL_DOMAIN}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="regPassword" className={labelClass}>Wachtwoord</label>
                                <input
                                    type="password"
                                    id="regPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={passwordInputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className={labelClass}>Bevestig wachtwoord</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={passwordInputClass}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#2860E0] hover:bg-[#326bf5] text-white font-bold rounded-lg transition-all shadow-lg mt-2 disabled:opacity-50"
                            >
                                {loading ? 'Bezig...' : 'Registreren'}
                            </button>
                        </form>
                    )}

                    {/* FORGOT PASSWORD */}
                    {mode === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <p className="text-sm text-white/70">
                                Voer je gebruikersnaam in om je wachtwoord te resetten.
                            </p>
                            <div>
                                <label htmlFor="forgotUsername" className={labelClass}>Gebruikersnaam</label>
                                <div className={inputGroupClass}>
                                    <input
                                        type="text"
                                        id="forgotUsername"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        placeholder="v.achternaam"
                                        className={inputFieldClass}
                                    />
                                    <div className={suffixClass}>
                                        {ALLOWED_EMAIL_DOMAIN}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#2860E0] hover:bg-[#326bf5] text-white font-bold rounded-lg transition-all shadow-lg mt-2 disabled:opacity-50"
                            >
                                {loading ? 'Bezig...' : 'Verstuur reset link'}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="pt-6 border-t border-white/10 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
                            <span className="material-symbols-outlined text-base">lock</span>
                            <span>Alleen toegankelijk voor medewerkers van Stichting LVO</span>
                        </div>

                        <div className="text-center text-sm text-white/80">
                            {mode === 'login' && (
                                <>
                                    Nog geen account?{' '}
                                    <button onClick={() => switchMode('register')} className="text-[#4D8EFF] hover:text-white font-medium transition-colors">
                                        Registreer direct
                                    </button>
                                </>
                            )}
                            {(mode === 'register' || mode === 'forgot') && (
                                <>
                                    Heb je al een account?{' '}
                                    <button onClick={() => switchMode('login')} className="text-[#4D8EFF] hover:text-white font-medium transition-colors">
                                        Inloggen
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
