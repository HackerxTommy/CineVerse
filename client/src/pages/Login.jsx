import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login, register, checkAuth } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // 2FA State
    const [require2FA, setRequire2FA] = useState(false);
    const [userId, setUserId] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || '/';
            navigate(from);
        }
    }, [user, navigate, location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                if (require2FA) {
                    // Verify 2FA
                    await axios.post(`${API_URL}/two-factor/validate`, {
                        userId,
                        token: twoFactorCode
                    }, { withCredentials: true });

                    // Refresh auth state and redirect
                    await checkAuth();
                    const fromObj = location.state?.from || { pathname: '/' };
                    navigate(fromObj.pathname || '/', { state: fromObj.state });
                    return;
                }

                const response = await login(formData.email, formData.password);

                if (response.require2FA) {
                    setRequire2FA(true);
                    setUserId(response.userId);
                    setLoading(false);
                    return;
                }

                // Normal login success - redirect
                const fromObj = location.state?.from || { pathname: '/' };
                navigate(fromObj.pathname || '/', { state: fromObj.state });
            } else {
                // Registration
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                const result = await register(formData.name, formData.email, formData.password);
                if (result.success) {
                    setSuccess('Account created! Please login with your credentials.');
                    setIsLogin(true);
                    setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
        setRequire2FA(false);
    };

    const formVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    };

    // 2FA Input UI
    if (require2FA) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <AnimatedBackground variant="purple" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '40px', borderRadius: '20px', maxWidth: '400px', width: '100%', zIndex: 1, textAlign: 'center' }}
                >
                    <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Two-Factor Authentication</h2>
                    <p style={{ color: '#ccc', marginBottom: '30px' }}>
                        Enter the 6-digit code from your authenticator app.
                    </p>

                    {error && <div style={{ color: '#ff4757', marginBottom: '20px' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                letterSpacing: '5px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '10px',
                                color: 'white',
                                marginBottom: '25px'
                            }}
                            autoFocus
                        />
                        <motion.button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </motion.button>
                    </form>
                    <button
                        onClick={() => setRequire2FA(false)}
                        style={{ background: 'none', border: 'none', color: '#888', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <AnimatedBackground variant="purple" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: 'center', marginBottom: '40px' }}
                >
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>
                            <span style={{ color: 'var(--primary)' }}>CINE</span>VERSE
                        </h1>
                    </Link>
                    <p style={{ color: '#888', marginTop: '10px' }}>
                        {isLogin ? 'Welcome back!' : 'Create your account'}
                    </p>
                </motion.div>

                {/* Form Container */}
                <motion.div
                    className="glass-panel"
                    style={{ padding: '40px', borderRadius: '20px' }}
                    whileHover={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}
                >
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? 'login' : 'signup'}
                            vari
                            ants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                        >
                            {/* Success Message */}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: 'rgba(46,213,115,0.15)',
                                        border: '1px solid var(--success)',
                                        borderRadius: '10px',
                                        padding: '15px',
                                        marginBottom: '20px',
                                        color: 'var(--success)',
                                        textAlign: 'center'
                                    }}
                                >
                                    ✓ {success}
                                </motion.div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: 'rgba(255,71,87,0.15)',
                                        border: '1px solid #ff4757',
                                        borderRadius: '10px',
                                        padding: '15px',
                                        marginBottom: '20px',
                                        color: '#ff4757',
                                        textAlign: 'center'
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Name Field (Signup Only) */}
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        placeholder="John Doe"
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.3s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </motion.div>
                            )}

                            {/* Email Field */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>

                            {/* Password Field */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>

                            {/* Confirm Password Field (Signup Only) */}
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: '25px' }}
                                >
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword || ''}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        placeholder="Repeat password"
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.3s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                className="btn btn-primary btn-glow"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '1.1rem',
                                    marginBottom: '20px'
                                }}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(229,9,20,0.5)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        {isLogin ? 'Logging in...' : 'Creating account...'}
                                    </motion.span>
                                ) : (
                                    isLogin ? 'Login' : 'Create Account'
                                )}
                            </motion.button>

                            {/* Divider */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                margin: '25px 0',
                                color: '#666'
                            }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <span>or continue with</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            </div>

                            {/* Google Button */}
                            <motion.button
                                type="button"
                                onClick={handleGoogleLogin}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#333',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(255,255,255,0.2)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>

                    {/* Toggle Link */}
                    <motion.p
                        style={{ textAlign: 'center', marginTop: '25px', color: '#aaa' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <motion.button
                            onClick={toggleMode}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 'inherit'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLogin ? 'Sign up' : 'Login'}
                        </motion.button>
                    </motion.p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
