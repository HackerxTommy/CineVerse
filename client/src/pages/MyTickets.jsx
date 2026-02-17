import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

const API_URL = 'http://localhost:5000/api';

const MyTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/bookings/my`, { withCredentials: true });
            setBookings(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.response?.data?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString([], {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUpcoming = (dateStr) => new Date(dateStr) > new Date();

    return (
        <div style={{ minHeight: '100vh' }}>
            <AnimatedBackground variant="blue" />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '50px', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 style={{ marginBottom: '10px' }}>
                        <span style={{ color: 'var(--neon-blue)' }}>🎟️</span> My Tickets
                    </h1>
                    <p style={{ color: '#888', marginBottom: '40px' }}>
                        View all your movie bookings and tickets
                    </p>
                </motion.div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner-large" style={{ borderTopColor: 'var(--neon-blue)' }} />
                        <p>Loading your tickets...</p>
                    </div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel"
                        style={{ padding: '40px', textAlign: 'center' }}
                    >
                        <p style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</p>
                        <motion.button
                            className="btn btn-primary"
                            onClick={fetchBookings}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Try Again
                        </motion.button>
                    </motion.div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel"
                        style={{ padding: '60px', textAlign: 'center' }}
                    >
                        <motion.div
                            style={{ fontSize: '4rem', marginBottom: '20px' }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            🎬
                        </motion.div>
                        <h3 style={{ marginBottom: '15px', color: '#fff' }}>No bookings yet</h3>
                        <p style={{ color: '#888', marginBottom: '30px' }}>
                            Start by booking tickets for your favorite movies!
                        </p>
                        <motion.button
                            className="btn btn-primary btn-glow"
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Browse Movies
                        </motion.button>
                    </motion.div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}
                    >
                        <AnimatePresence>
                            {bookings.map((booking, index) => {
                                const upcoming = isUpcoming(booking.show?.startTime);
                                return (
                                    <motion.div
                                        key={booking._id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                        className="glass-panel"
                                        style={{
                                            padding: '25px',
                                            display: 'flex',
                                            gap: '25px',
                                            alignItems: 'stretch',
                                            opacity: upcoming ? 1 : 0.7
                                        }}
                                    >
                                        {/* Poster */}
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            style={{ flexShrink: 0 }}
                                        >
                                            <img
                                                src={booking.show?.movie?.poster || 'https://via.placeholder.com/120x180?text=Movie'}
                                                alt={booking.show?.movie?.title}
                                                style={{
                                                    width: '120px',
                                                    height: '180px',
                                                    objectFit: 'cover',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                                }}
                                            />
                                        </motion.div>

                                        {/* Details */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                                    <h3 style={{ margin: 0, color: '#fff' }}>
                                                        {booking.show?.movie?.title || 'Movie Title'}
                                                    </h3>
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            background: upcoming
                                                                ? 'linear-gradient(135deg, var(--success), #1e9c53)'
                                                                : 'rgba(255,255,255,0.1)',
                                                            color: upcoming ? '#fff' : '#888'
                                                        }}
                                                    >
                                                        {upcoming ? '🎬 Upcoming' : 'Completed'}
                                                    </motion.span>
                                                </div>

                                                <p style={{ color: '#888', margin: '0 0 15px 0' }}>
                                                    {booking.show?.theaterName || 'Theater'}
                                                </p>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
                                                    <div>
                                                        <span style={{ color: '#666', fontSize: '0.8rem', display: 'block' }}>Date</span>
                                                        <span style={{ fontWeight: 600 }}>
                                                            {booking.show?.startTime ? formatDate(booking.show.startTime) : '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#666', fontSize: '0.8rem', display: 'block' }}>Time</span>
                                                        <span style={{ fontWeight: 600 }}>
                                                            {booking.show?.startTime ? formatTime(booking.show.startTime) : '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#666', fontSize: '0.8rem', display: 'block' }}>Seats</span>
                                                        <span style={{ fontWeight: 600, color: 'var(--neon-blue)' }}>
                                                            {booking.seats?.join(', ') || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: '20px',
                                                paddingTop: '20px',
                                                borderTop: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <div>
                                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>Total Paid</span>
                                                    <p style={{
                                                        margin: '5px 0 0',
                                                        fontSize: '1.4rem',
                                                        fontWeight: 'bold',
                                                        color: 'var(--success)'
                                                    }}>
                                                        ₹{booking.totalAmount?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--neon-blue)' }}
                                                        style={{
                                                            padding: '10px 20px',
                                                            background: 'rgba(0,242,234,0.1)',
                                                            border: '1px solid var(--neon-blue)',
                                                            borderRadius: '10px',
                                                            color: 'var(--neon-blue)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        View Ticket
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status indicator */}
                                        <div style={{
                                            width: '4px',
                                            background: upcoming
                                                ? 'linear-gradient(180deg, var(--success), var(--neon-blue))'
                                                : 'rgba(255,255,255,0.1)',
                                            borderRadius: '2px'
                                        }} />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
