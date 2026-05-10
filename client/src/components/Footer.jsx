import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { path: '/about', label: 'About Us' },
        { path: '/services', label: 'Services' },
        { path: '/help', label: 'Help Center' },
        { path: '/contact', label: 'Contact' }
    ];

    return (
        <footer style={{
            position: 'relative',
            background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.95) 20%, #0a0a0f 100%)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '60px 30px 30px',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Main Footer Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '40px',
                    marginBottom: '40px'
                }}>
                    {/* Brand */}
                    <div>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 800,
                                    marginBottom: '15px',
                                    display: 'inline-block'
                                }}
                            >
                                <span style={{ color: 'var(--primary)' }}>CINE</span>
                                <span style={{ color: 'white' }}>VERSE</span>
                            </motion.div>
                        </Link>
                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            Your premium destination for movie experiences. Book tickets for the latest blockbusters and timeless classics.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1rem' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {footerLinks.map((link) => (
                                <li key={link.path} style={{ marginBottom: '12px' }}>
                                    <Link to={link.path} style={{ textDecoration: 'none' }}>
                                        <motion.span
                                            whileHover={{ color: 'var(--primary)', x: 5 }}
                                            style={{
                                                color: '#888',
                                                fontSize: '0.9rem',
                                                display: 'inline-block',
                                                transition: 'color 0.3s'
                                            }}
                                        >
                                            {link.label}
                                        </motion.span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1rem' }}>Contact</h4>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>
                            <p style={{ marginBottom: '10px' }}>📧 vishalgupta0x01@gmail.com</p>
                            <p style={{ marginBottom: '10px' }}>📞 +91 8791661106</p>
                            <p>📍 Ghaziabad, India</p>
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1rem' }}>Follow Us</h4>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {[
                                { icon: <FaLinkedinIn />, url: 'https://linkedin.in/vishalgupta0001' },
                                { icon: <FaTwitter />, url: 'https://twitter.com/HackerxTommy' },
                                { icon: <FaInstagram />, url: 'https://instagram.com/vishal_gupta_ethhacker' },
                                { icon: <FaYoutube />, url: '#' }
                            ].map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.2, y: -3 }}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        textDecoration: 'none',
                                        color: 'white'
                                    }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.5), transparent)',
                    marginBottom: '25px'
                }} />

                {/* Copyright Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'center'
                }}>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            color: '#666',
                            fontSize: '0.85rem',
                            margin: 0
                        }}
                    >
                        © {currentYear} CineVerse. All rights reserved.
                    </motion.p>

                    {/* Developer Credit */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, rgba(229,9,20,0.1), rgba(0,242,234,0.1))',
                            borderRadius: '25px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <span style={{ fontSize: '1rem' }}>👨‍💻</span>
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
                            Developed by{' '}
                            <motion.span
                                whileHover={{ color: 'var(--primary)' }}
                                style={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Vishal Gupta
                            </motion.span>
                        </span>
                        <span style={{
                            padding: '3px 10px',
                            background: 'rgba(0,242,234,0.15)',
                            border: '1px solid rgba(0,242,234,0.3)',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            color: 'var(--neon-blue)',
                            fontWeight: 500
                        }}>
                            Application Security Engineer
                        </span>
                    </motion.div>

                    <p style={{
                        color: '#555',
                        fontSize: '0.75rem',
                        margin: '5px 0 0'
                    }}>
                        🔒 Secured with industry-standard security practices
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
