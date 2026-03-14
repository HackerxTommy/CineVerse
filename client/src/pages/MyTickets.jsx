import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import api from '../utils/api';

const MyTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [copied, setCopied] = useState(false);

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
            const res = await api.get('/bookings/my');
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

    // Build ticket share text
    const getShareText = (ticket) => {
        const movie = ticket.show?.movie?.title || 'Movie';
        const theater = ticket.show?.theaterName || 'Theater';
        const date = ticket.show?.startTime ? formatDate(ticket.show.startTime) : '';
        const time = ticket.show?.startTime ? formatTime(ticket.show.startTime) : '';
        const seats = ticket.seats?.join(', ') || '';
        return `🎬 CineVerse Ticket\n\n🎥 ${movie}\n🏛️ ${theater}\n📅 ${date} at ${time}\n💺 Seats: ${seats}\n💰 ₹${ticket.totalAmount?.toFixed(2)}\n🆔 Booking: ${ticket._id}`;
    };

    // Build QR code data string
    const getQrData = (ticket) => {
        return JSON.stringify({
            bookingId: ticket._id,
            movie: ticket.show?.movie?.title,
            theater: ticket.show?.theaterName,
            date: ticket.show?.startTime,
            seats: ticket.seats,
            amount: ticket.totalAmount,
            status: ticket.status
        });
    };

    // WhatsApp share
    const shareWhatsApp = (ticket) => {
        const text = encodeURIComponent(getShareText(ticket));
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Copy to clipboard
    const copyToClipboard = async (ticket) => {
        try {
            await navigator.clipboard.writeText(getShareText(ticket));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = getShareText(ticket);
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Native share
    const nativeShare = async (ticket) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `CineVerse Ticket - ${ticket.show?.movie?.title}`,
                    text: getShareText(ticket)
                });
            } catch { /* user cancelled */ }
        } else {
            copyToClipboard(ticket);
        }
    };

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
                                                        onClick={() => setSelectedTicket(booking)}
                                                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--neon-blue)' }}
                                                        whileTap={{ scale: 0.95 }}
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

            {/* Ticket Detail Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTicket(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0, rotateX: -15 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '500px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
                            }}
                        >
                            {/* Ticket Header with poster */}
                            <div style={{
                                position: 'relative',
                                height: '160px',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={selectedTicket.show?.movie?.poster || ''}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: 'brightness(0.4) blur(2px)'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(transparent 0%, rgba(26,26,46,1) 100%)',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '20px 25px'
                                }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px', fontSize: '1.5rem' }}>
                                            {selectedTicket.show?.movie?.title || 'Movie'}
                                        </h2>
                                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                                            {selectedTicket.show?.theaterName || 'Theater'}
                                        </p>
                                    </div>
                                </div>
                                {/* Close button */}
                                <motion.button
                                    onClick={() => setSelectedTicket(null)}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        background: 'rgba(0,0,0,0.5)',
                                        border: 'none',
                                        color: '#fff',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ✕
                                </motion.button>
                            </div>

                            {/* Ticket Body */}
                            <div style={{ padding: '25px' }}>
                                {/* Ticket info grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
                                        <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1rem' }}>
                                            {selectedTicket.show?.startTime ? formatDate(selectedTicket.show.startTime) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Time</span>
                                        <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1rem' }}>
                                            {selectedTicket.show?.startTime ? formatTime(selectedTicket.show.startTime) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Seats</span>
                                        <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1rem', color: 'var(--neon-blue)' }}>
                                            {selectedTicket.seats?.join(', ') || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tickets</span>
                                        <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1rem' }}>
                                            {selectedTicket.seats?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Dashed divider - cinema ticket style */}
                                <div style={{
                                    borderTop: '2px dashed rgba(255,255,255,0.15)',
                                    margin: '20px -25px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-14px',
                                        top: '-14px',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.85)'
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        right: '-14px',
                                        top: '-14px',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.85)'
                                    }} />
                                </div>

                                {/* Amount & Status */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount Paid</span>
                                        <p style={{ margin: '4px 0 0', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--success)' }}>
                                            ₹{selectedTicket.totalAmount?.toFixed(2)}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        background: selectedTicket.status === 'confirmed'
                                            ? 'rgba(46,213,115,0.15)'
                                            : 'rgba(255,71,87,0.15)',
                                        color: selectedTicket.status === 'confirmed' ? '#2ed573' : '#ff4757',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {selectedTicket.status === 'confirmed' ? '✓ Confirmed' : selectedTicket.status}
                                    </div>
                                </div>

                                {/* Google Maps - Theater Location */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '10px'
                                    }}>
                                        <span style={{ fontSize: '1.1rem' }}>📍</span>
                                        <span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Theater Location</span>
                                    </div>
                                    <div style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        height: '200px'
                                    }}>
                                        <iframe
                                            title="Theater Location"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent((selectedTicket.show?.theaterName || 'Cinema') + ' cinema theater')}`}
                                        />
                                    </div>
                                    <motion.a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((selectedTicket.show?.theaterName || 'Cinema') + ' cinema theater')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            marginTop: '10px',
                                            padding: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '10px',
                                            color: '#4285f4',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            border: '1px solid rgba(66,133,244,0.2)'
                                        }}
                                    >
                                        🗺️ Open in Google Maps
                                    </motion.a>
                                </div>

                                {/* QR Code */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getQrData(selectedTicket))}&bgcolor=ffffff&color=000000&margin=5`}
                                        alt="Ticket QR Code"
                                        style={{
                                            width: '180px',
                                            height: '180px',
                                            imageRendering: 'pixelated'
                                        }}
                                    />
                                    <p style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.7rem',
                                        color: '#333',
                                        margin: '10px 0 0',
                                        letterSpacing: '1px'
                                    }}>
                                        {selectedTicket._id?.toUpperCase()}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: '#999', margin: '4px 0 0' }}>
                                        Scan to verify ticket
                                    </p>
                                </div>

                                {/* Share Buttons */}
                                <div style={{ marginBottom: '15px' }}>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginBottom: '10px',
                                        textAlign: 'center'
                                    }}>
                                        Share Ticket
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        justifyContent: 'center'
                                    }}>
                                        {/* WhatsApp */}
                                        <motion.button
                                            onClick={() => shareWhatsApp(selectedTicket)}
                                            whileHover={{ scale: 1.08, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                padding: '12px',
                                                background: 'rgba(37,211,102,0.1)',
                                                border: '1px solid rgba(37,211,102,0.3)',
                                                borderRadius: '12px',
                                                color: '#25d366',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            WhatsApp
                                        </motion.button>

                                        {/* Copy Link */}
                                        <motion.button
                                            onClick={() => copyToClipboard(selectedTicket)}
                                            whileHover={{ scale: 1.08, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                padding: '12px',
                                                background: copied ? 'rgba(46,213,115,0.15)' : 'rgba(255,255,255,0.05)',
                                                border: copied ? '1px solid rgba(46,213,115,0.3)' : '1px solid rgba(255,255,255,0.15)',
                                                borderRadius: '12px',
                                                color: copied ? '#2ed573' : '#aaa',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {copied ? '✓' : '📋'} {copied ? 'Copied!' : 'Copy'}
                                        </motion.button>

                                        {/* Share (native) */}
                                        <motion.button
                                            onClick={() => nativeShare(selectedTicket)}
                                            whileHover={{ scale: 1.08, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                padding: '12px',
                                                background: 'rgba(0,242,234,0.08)',
                                                border: '1px solid rgba(0,242,234,0.25)',
                                                borderRadius: '12px',
                                                color: '#00f2ea',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🔗 Share
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Booking ID */}
                                <p style={{
                                    textAlign: 'center',
                                    color: '#666',
                                    fontSize: '0.75rem',
                                    margin: 0
                                }}>
                                    Booking ID: {selectedTicket._id}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default MyTickets;
