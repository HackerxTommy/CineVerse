import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const About = () => {
    const team = [
        { name: 'Vishal Gupta', role: 'CEO & Founder', emoji: '👨‍💼' },
        { name: 'Priya Patel', role: 'CTO', emoji: '👩‍💻' },
        { name: 'Arjun Singh', role: 'Head of Design', emoji: '🎨' },
        { name: 'Neha Gupta', role: 'Customer Success', emoji: '🤝' }
    ];

    const stats = [
        { value: '10M+', label: 'Happy Customers' },
        { value: '500+', label: 'Partner Theaters' },
        { value: '50+', label: 'Cities Covered' },
        { value: '99.9%', label: 'Uptime' }
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            <AnimatedBackground variant="purple" />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '80px' }}
                >
                    <motion.h1
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '20px' }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        About <span style={{ color: 'var(--primary)' }}>CineVerse</span>
                    </motion.h1>
                    <motion.p
                        style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        We're on a mission to revolutionize the movie-going experience.
                        From seamless booking to premium entertainment, CineVerse brings
                        cinema to your fingertips.
                    </motion.p>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '30px',
                        marginBottom: '80px'
                    }}
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="glass-panel"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,0,255,0.2)' }}
                            style={{ padding: '40px', textAlign: 'center' }}
                        >
                            <motion.div
                                style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--neon-purple)', marginBottom: '10px' }}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                            >
                                {stat.value}
                            </motion.div>
                            <div style={{ color: '#888' }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Story Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="glass-panel"
                    style={{ padding: '50px', marginBottom: '80px' }}
                >
                    <h2 style={{ marginBottom: '25px', color: 'var(--neon-blue)' }}>Our Story</h2>
                    <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1.1rem' }}>
                        Founded in 2020, CineVerse started with a simple idea: make movie booking as
                        enjoyable as watching the movie itself. What began as a small startup has
                        grown into India's leading cinema experience platform.
                    </p>
                    <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1.1rem', marginTop: '20px' }}>
                        We partner with over 500 theaters across 50+ cities, offering everything from
                        blockbuster releases to indie films. Our cutting-edge technology ensures
                        you get the best seats, every time.
                    </p>
                </motion.div>

                {/* Team Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Meet Our Team</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '25px'
                    }}>
                        {team.map((member, i) => (
                            <motion.div
                                key={member.name}
                                className="glass-panel"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                style={{ padding: '35px', textAlign: 'center' }}
                            >
                                <motion.div
                                    style={{ fontSize: '4rem', marginBottom: '15px' }}
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                >
                                    {member.emoji}
                                </motion.div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{member.name}</h3>
                                <p style={{ color: '#888', margin: 0 }}>{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
