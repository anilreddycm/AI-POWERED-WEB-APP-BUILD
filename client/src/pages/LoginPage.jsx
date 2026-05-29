import { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { register, emailLogin, googleLogin, getAuthConfig } from '../services/authService.js';
import '../styles/login.css';

function LoginPage() {
    const { user, login } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const navigate = useNavigate();

    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [googleClientId, setGoogleClientId] = useState('');
    const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await getAuthConfig();
                if (config && config.googleClientId && !config.googleClientId.includes('placeholder')) {
                    setGoogleClientId(config.googleClientId);
                    setIsGoogleConfigured(true);
                }
            } catch (err) {
                console.error('Failed to fetch auth config:', err);
            }
        };
        fetchConfig();
    }, []);

    const handleGoogleCredentialResponse = async (response) => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await googleLogin(response.credential);
            login(result.token, result.user);
            showToast(`Welcome, ${result.user.name}!`, 'success');
            navigate('/dashboard');
        } catch (err) {
            const message = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Google Sign-In failed.';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isGoogleConfigured || !googleClientId) return;

        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCredentialResponse,
                });
                const target = document.getElementById('google-signin-target');
                if (target) {
                    window.google.accounts.id.renderButton(target, {
                        theme: 'outline',
                        size: 'large',
                        width: 360,
                        logo_alignment: 'left'
                    });
                }
            }
        };

        if (window.google) {
            initializeGoogleSignIn();
        } else {
            const checkInterval = setInterval(() => {
                if (window.google) {
                    initializeGoogleSignIn();
                    clearInterval(checkInterval);
                }
            }, 500);
            return () => clearInterval(checkInterval);
        }
    }, [isGoogleConfigured, googleClientId, isSignUp]);

    if (user) return <Navigate to="/dashboard" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!email || !password) {
            showToast('Please fill in all fields.', 'error');
            return;
        }
        if (isSignUp && !name) {
            showToast('Please enter your name.', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = isSignUp
                ? await register(name, email, password)
                : await emailLogin(email, password);

            login(result.token, result.user);
            showToast(
                isSignUp ? `Welcome, ${result.user.name}!` : `Welcome back, ${result.user.name}!`,
                'success'
            );
            navigate('/dashboard');
        } catch (err) {
            const message = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Something went wrong.';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="login-page">
            <div className="login-brand" onClick={() => navigate('/')}>
                <span className="login-brand-mark">&lt;/&gt;</span> SmartWebBuild
            </div>

            <div className="login-card">
                <h2 className="login-card-title">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="login-card-subtitle">
                    {isSignUp
                        ? 'Start building web apps with AI'
                        : 'Sign in to continue building'}
                </p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="login-field">
                            <label className="login-label">Full Name</label>
                            <input
                                type="text"
                                className="login-input"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            className="login-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            type="password"
                            className="login-input"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="login-divider">
                    <span className="login-divider-line"></span>
                    <span className="login-divider-text">or</span>
                    <span className="login-divider-line"></span>
                </div>

                {isGoogleConfigured ? (
                    <div id="google-signin-target" className="google-signin-container"></div>
                ) : (
                    <button 
                        type="button" 
                        className="google-mock-btn" 
                        onClick={() => handleGoogleCredentialResponse({ credential: 'mock-google-token' })}
                        disabled={loading}
                    >
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.148 4.2-3.525 0-6.38-2.858-6.38-6.382 0-3.522 2.855-6.38 6.38-6.38 1.58 0 3.01.577 4.13 1.527l3.056-3.057C19.244 2.59 15.997 1 12.24 1 6.136 1 1.2 5.936 1.2 12.043c0 6.106 4.936 11.042 11.04 11.042 6.363 0 11.536-4.636 11.536-11.042 0-.693-.082-1.353-.223-1.996l-10.313.238z"/>
                        </svg>
                        Sign in with Google
                    </button>
                )}

                <p className="login-toggle">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button type="button" className="login-toggle-btn" onClick={handleToggle}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;