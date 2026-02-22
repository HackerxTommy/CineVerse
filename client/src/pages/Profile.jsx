import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
 
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile form
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });

    // 2FA state
    const [twoFAStatus, setTwoFAStatus] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verifyToken, setVerifyToken] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || ''
        });
        fetch2FAStatus();
    }, [user, navigate]);

    const fetch2FAStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/2fa/status`, { withCredentials: true });
            setTwoFAStatus(res.data.enabled);
        } catch {
            console.error('Failed to fetch 2FA status');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // In a real app, you'd call an update endpoint
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const setup2FA = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post(`${API_URL}/2fa/setup`, {}, { withCredentials: true });
            setQrCode(res.data.qrCode);
            setSecret(res.data.secret);
            setMessage({ type: 'info', text: 'Scan the QR code with Google Authenticator' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to setup 2FA' });
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async () => {
        if (!verifyToken || verifyToken.length !== 6) {
            setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/2fa/verify`, { token: verifyToken }, { withCredentials: true });
            setTwoFAStatus(true);
            setBackupCodes(res.data.backupCodes);
            setShowBackupCodes(true);
            setQrCode('');
            setSecret('');
            setVerifyToken('');
            setMessage({ type: 'success', text: '2FA enabled successfully! Save your backup codes.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid verification code' });
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        const token = prompt('Enter your current 2FA code to disable:');
        if (!token) return;

        setLoading(true);
        try {
            await axios.post(`${API_URL}/2fa/disable`, { token }, { withCredentials: true });
            setTwoFAStatus(false);
            setMessage({ type: 'success', text: '2FA disabled successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to disable 2FA' });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'security', label: 'Security', icon: '🔐' },
        { id: 'bookings', label: 'Bookings', icon: '🎫' }
    ];

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh' }}>
            <AnimatedBackground variant="purple" />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '40px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '30px' }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: user.avatar ? `url(${user.avatar})` : 'linear-gradient(135deg, var(--primary), #b20710)',
                                backgroundSize: 'cover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: user.avatar ? '0' : '2.5rem',
                                fontWeight: 'bold',
                                border: '3px solid var(--primary)',
                                boxShadow: '0 0 30px rgba(229,9,20,0.3)'
                            }}
                        >
                            {!user.avatar && user.name?.charAt(0).toUpperCase()}
                        </motion.div>
                        <div>
                            <h1 style={{ margin: '0 0 8px 0' }}>{user.name}</h1>
                            <p style={{ color: '#888', margin: 0 }}>{user.email}</p>
                            {twoFAStatus && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    marginTop: '10px',
                                    padding: '5px 12px',
                                    background: 'rgba(46,213,115,0.15)',
                                    border: '1px solid var(--success)',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    color: 'var(--success)'
                                }}>
                                    🔒 2FA Enabled
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    padding: '12px 25px',
                                    background: activeTab === tab.id ? 'linear-gradient(135deg, var(--primary), #b20710)' : 'rgba(255,255,255,0.05)',
                                    border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Message */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                padding: '15px 20px',
                                marginBottom: '25px',
                                borderRadius: '10px',
                                background: message.type === 'success' ? 'rgba(46,213,115,0.15)' :
                                    message.type === 'error' ? 'rgba(255,71,87,0.15)' : 'rgba(0,242,234,0.15)',
                                border: `1px solid ${message.type === 'success' ? 'var(--success)' :
                                    message.type === 'error' ? 'var(--danger)' : 'var(--neon-blue)'}`,
                                color: message.type === 'success' ? 'var(--success)' :
                                    message.type === 'error' ? 'var(--danger)' : 'var(--neon-blue)'
                            }}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-panel"
                            style={{ padding: '40px' }}
                        >
                            <h2 style={{ marginBottom: '30px' }}>Profile Information</h2>
                            <form onSubmit={handleProfileUpdate}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: '10px',
                                                color: '#888',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Phone</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Bio</label>
                                    <textarea
                                        rows={4}
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        placeholder="Tell us about yourself..."
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ marginTop: '30px', padding: '14px 40px' }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-panel"
                            style={{ padding: '40px' }}
                        >
                            <h2 style={{ marginBottom: '30px' }}>Security Settings</h2>

                            {/* 2FA Section */}
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>🔐</span> Two-Factor Authentication
                                </h3>
                                <p style={{ color: '#888', marginBottom: '20px' }}>
                                    Add an extra layer of security by enabling 2FA with Google Authenticator.
                                </p>

                                {!twoFAStatus ? (
                                    <>
                                        {!qrCode ? (
                                            <motion.button
                                                onClick={setup2FA}
                                                disabled={loading}
                                                className="btn btn-primary"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {loading ? 'Setting up...' : 'Enable 2FA'}
                                            </motion.button>
                                        ) : (
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '15px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ marginBottom: '15px', color: '#aaa' }}>Scan with Google Authenticator:</p>
                                                        <img src={qrCode} alt="2FA QR Code" style={{ borderRadius: '10px' }} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                                        <p style={{ color: '#888', marginBottom: '10px' }}>Or enter manually:</p>
                                                        <code style={{
                                                            display: 'block',
                                                            padding: '15px',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '8px',
                                                            marginBottom: '20px',
                                                            wordBreak: 'break-all',
                                                            color: 'var(--neon-blue)'
                                                        }}>
                                                            {secret}
                                                        </code>
                                                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>
                                                            Enter 6-digit code:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            value={verifyToken}
                                                            onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, ''))}
                                                            placeholder="000000"
                                                            style={{
                                                                width: '150px',
                                                                padding: '14px',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                borderRadius: '10px',
                                                                color: 'white',
                                                                fontSize: '1.5rem',
                                                                textAlign: 'center',
                                                                letterSpacing: '5px'
                                                            }}
                                                        />
                                                        <motion.button
                                                            onClick={verify2FA}
                                                            disabled={loading || verifyToken.length !== 6}
                                                            className="btn btn-primary"
                                                            style={{ marginLeft: '15px' }}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            Verify
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <span style={{ color: 'var(--success)' }}>✓ 2FA is enabled</span>
                                        <motion.button
                                            onClick={disable2FA}
                                            disabled={loading}
                                            className="btn btn-outline"
                                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                            whileHover={{ scale: 1.02, background: 'rgba(255,71,87,0.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Disable 2FA
                                        </motion.button>
                                    </div>
                                )}

                                {/* Backup Codes */}
                                {showBackupCodes && backupCodes.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            marginTop: '30px',
                                            padding: '25px',
                                            background: 'rgba(255,165,2,0.1)',
                                            border: '1px solid var(--warning)',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <h4 style={{ color: 'var(--warning)', marginBottom: '15px' }}>
                                            ⚠️ Save Your Backup Codes
                                        </h4>
                                        <p style={{ color: '#aaa', marginBottom: '15px' }}>
                                            Store these codes safely. You can use them to login if you lose access to your authenticator.
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                            {backupCodes.map((code, i) => (
                                                <code key={i} style={{
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    borderRadius: '6px',
                                                    textAlign: 'center',
                                                    color: '#fff'
                                                }}>
                                                    {code}
                                                </code>
                                            ))}
                                        </div>
                                        <motion.button
                                            onClick={() => setShowBackupCodes(false)}
                                            className="btn btn-outline"
                                            style={{ marginTop: '20px' }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            I've saved my codes
                                        </motion.button>
                                    </motion.div>
                                )}
                            </div>

                            {/* Password Change */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                                <h3 style={{ marginBottom: '15px' }}>🔑 Change Password</h3>
                                <p style={{ color: '#888', marginBottom: '20px' }}>
                                    Update your password to keep your account secure.
                                </p>
                                <motion.button
                                    className="btn btn-outline"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Change Password
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'bookings' && (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-panel"
                            style={{ padding: '40px', textAlign: 'center' }}
                        >
                            <h2 style={{ marginBottom: '20px' }}>My Bookings</h2>
                            <p style={{ color: '#888', marginBottom: '30px' }}>
                                View and manage all your movie bookings
                            </p>
                            <motion.a
                                href="/my-tickets"
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ textDecoration: 'none' }}
                            >
                                View All Tickets
                            </motion.a>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Logout Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: '30px', textAlign: 'center' }}
                >
                    <motion.button
                        onClick={logout}
                        className="btn btn-outline"
                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        whileHover={{ scale: 1.02, background: 'rgba(255,71,87,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        🚪 Logout
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
