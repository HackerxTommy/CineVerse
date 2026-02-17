import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const contactInfo = [
        { icon: '📍', title: 'Address', value: '123 Cinema Street, Bangalore, India 560001' },
        { icon: '📞', title: 'Phone', value: '+91 80 1234 5678' },
        { icon: '✉️', title: 'Email', value: 'support@cineverse.com' },
        { icon: '🕐', title: 'Hours', value: 'Mon-Sun: 9AM - 11PM' }
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            <AnimatedBackground variant="blue" />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <h1 style={{ marginBottom: '15px' }}>
                        Get in <span style={{ color: 'var(--neon-blue)' }}>Touch</span>
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>
                        We'd love to hear from you. Send us a message!
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel"
                        style={{ padding: '40px' }}
                    >
                        <h2 style={{ marginBottom: '30px', color: '#fff' }}>Send a Message</h2>

                        {submitted && (
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
                                ✓ Message sent successfully!
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your name"
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

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
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

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="How can we help?"
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

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Your message..."
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
                                style={{ width: '100%', padding: '15px' }}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,242,234,0.4)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Send Message
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {contactInfo.map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    className="glass-panel"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,242,234,0.2)' }}
                                    style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}
                                >
                                    <motion.div
                                        style={{ fontSize: '2rem' }}
                                        whileHover={{ scale: 1.2 }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--neon-blue)' }}>{item.title}</h4>
                                        <p style={{ margin: 0, color: '#ccc' }}>{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Map placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="glass-panel"
                            style={{
                                marginTop: '25px',
                                padding: '0',
                                height: '200px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(0,242,234,0.1), rgba(0,136,255,0.1))'
                            }}
                        >
                            <div style={{ textAlign: 'center', color: '#888' }}>
                                <span style={{ fontSize: '3rem' }}>🗺️</span>
                                <p>Interactive Map Coming Soon</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
