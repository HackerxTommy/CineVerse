import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { path: '/services', label: 'Services', icon: '🎬' },
        { path: '/about', label: 'About', icon: '📖' },
        { path: '/help', label: 'Help', icon: '❓' },
        { path: '/contact', label: 'Contact', icon: '📞' }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '15px 30px',
                background: scrolled
                    ? 'rgba(10,10,10,0.95)'
                    : 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            letterSpacing: '-1px'
                        }}
                    >
                        <span style={{ color: 'var(--primary)' }}>CINE</span>
                        <span style={{ color: 'white' }}>VERSE</span>
                    </motion.div>
                </Link>

                {/* Center Navigation Links */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    color: location.pathname === link.path ? 'var(--primary)' : '#aaa',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {link.label}
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* User Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    {user ? (
                        <>
                            <Link to="/my-tickets" style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.05, color: 'var(--neon-blue)' }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        color: location.pathname === '/my-tickets' ? 'var(--neon-blue)' : '#aaa',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'color 0.3s'
                                    }}
                                >
                                    <span>🎟️</span>
                                    My Tickets
                                </motion.div>
                            </Link>

                            {/* User Menu */}
                            <div style={{ position: 'relative' }}>
                                <motion.div
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        padding: '8px 15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '50px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid var(--primary)'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), #b20710)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span style={{ color: '#ddd', fontWeight: 500 }}>
                                        {user.name?.split(' ')[0]}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: menuOpen ? 180 : 0 }}
                                        style={{ color: '#888', fontSize: '0.8rem' }}
                                    >
                                        ▼
                                    </motion.span>
                                </motion.div>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {menuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                marginTop: '10px',
                                                background: 'rgba(20,20,30,0.98)',
                                                backdropFilter: 'blur(20px)',
                                                borderRadius: '15px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '10px',
                                                minWidth: '220px',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                            }}
                                        >
                                            <div style={{
                                                padding: '15px',
                                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                marginBottom: '10px'
                                            }}>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>
                                                    {user.name}
                                                </p>
                                                <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#888' }}>
                                                    {user.email}
                                                </p>
                                            </div>

                                            <Link to="/profile" style={{ textDecoration: 'none' }}>
                                                <motion.div
                                                    whileHover={{ background: 'rgba(255,255,255,0.1)', x: 5 }}
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '10px',
                                                        color: '#ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    👤 Profile
                                                </motion.div>
                                            </Link>

                                            <Link to="/my-tickets" style={{ textDecoration: 'none' }}>
                                                <motion.div
                                                    whileHover={{ background: 'rgba(255,255,255,0.1)', x: 5 }}
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '10px',
                                                        color: '#ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🎫 My Bookings
                                                </motion.div>
                                            </Link>

                                            <Link to="/help" style={{ textDecoration: 'none' }}>
                                                <motion.div
                                                    whileHover={{ background: 'rgba(255,255,255,0.1)', x: 5 }}
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '10px',
                                                        color: '#ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ❓ Help Center
                                                </motion.div>
                                            </Link>

                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
                                                <motion.div
                                                    whileHover={{ background: 'rgba(229,9,20,0.2)', x: 5 }}
                                                    onClick={logout}
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '10px',
                                                        color: 'var(--danger)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🚪 Logout
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <motion.button
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(229,9,20,0.5)' }}
                                whileTap={{ scale: 0.95 }}
                                style={{ padding: '10px 25px' }}
                            >
                                Login
                            </motion.button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
