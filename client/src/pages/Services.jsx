import React from 'react';
 
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const Services = () => {
    const services = [
        {
            icon: '🎬',
            title: 'Movie Booking',
            description: 'Book tickets for the latest movies in just a few taps. Choose your seats, showtime, and theater.',
            color: '#e50914'
        },
        {
            icon: '🎟️',
            title: 'Premium Formats',
            description: 'Experience movies in IMAX, 4K, Dolby Atmos, and 3D at partner theaters across the country.',
            color: '#00f2ea'
        },
        {
            icon: '💳',
            title: 'Secure Payments',
            description: 'Pay securely with credit/debit cards, UPI, or digital wallets. All transactions are encrypted.',
            color: '#2ed573'
        },
        {
            icon: '📱',
            title: 'Digital Tickets',
            description: 'Get instant QR code tickets on your phone. No printing required - just show and go!',
            color: '#ff00ff'
        },
        {
            icon: '🎁',
            title: 'Rewards Program',
            description: 'Earn points on every booking. Redeem for free tickets, snacks, and exclusive merchandise.',
            color: '#ffd700'
        },
        {
            icon: '👥',
            title: 'Group Bookings',
            description: 'Planning a movie outing? Book multiple seats together and get special group discounts.',
            color: '#ff6b81'
        },
        {
            icon: '🔔',
            title: 'Release Alerts',
            description: 'Never miss a premiere! Get notified when your favorite movies are available for booking.',
            color: '#5f27cd'
        },
        {
            icon: '🍿',
            title: 'F&B Pre-Order',
            description: 'Skip the queue! Order popcorn, drinks, and snacks in advance and pick up at the theater.',
            color: '#ff9f43'
        }
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            <AnimatedBackground variant="gold" />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <h1 style={{ marginBottom: '15px' }}>
                        Our <span style={{ color: 'var(--gold)' }}>Services</span>
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Everything you need for the ultimate cinema experience
                    </p>
                </motion.div>

                {/* Services Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '25px'
                }}>
                    {services.map((service, i) => (
                        <motion.div
                            key={service.title}
                            className="glass-panel"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                            whileHover={{
                                scale: 1.03,
                                y: -5,
                                boxShadow: `0 20px 40px ${service.color}20`
                            }}
                            style={{ padding: '35px', cursor: 'default' }}
                        >
                            <motion.div
                                style={{
                                    fontSize: '3rem',
                                    marginBottom: '20px',
                                    display: 'inline-block'
                                }}
                                whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                                {service.icon}
                            </motion.div>
                            <h3 style={{ margin: '0 0 15px 0', color: service.color }}>{service.title}</h3>
                            <p style={{ color: '#aaa', margin: 0, lineHeight: 1.7 }}>{service.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="glass-panel"
                    style={{
                        marginTop: '60px',
                        padding: '50px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(229,9,20,0.1), rgba(255,215,0,0.1))'
                    }}
                >
                    <h2 style={{ marginBottom: '15px' }}>Ready to Experience?</h2>
                    <p style={{ color: '#888', marginBottom: '30px' }}>
                        Join millions of happy movie-goers today!
                    </p>
                    <motion.a
                        href="/"
                        className="btn btn-primary btn-glow"
                        style={{ padding: '15px 40px', fontSize: '1.1rem', textDecoration: 'none' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Browse Movies
                    </motion.a>
                </motion.div>
            </div>
        </div>
    );
};

export default Services;
