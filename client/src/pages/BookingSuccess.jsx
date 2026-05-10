import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showTicket, setShowTicket] = useState(false);
    const [copied, setCopied] = useState(false);

    const { booking, showDetails } = location.state || {};

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

    // Build ticket share text
    const getShareText = () => {
        if (!booking) return '';
        const movie = booking.movie || 'Movie';
        const theater = booking.theater || 'Theater';
        const date = booking.showTime ? formatDate(booking.showTime) : '';
        const time = booking.showTime ? formatTime(booking.showTime) : '';
        const seats = booking.seats?.join(', ') || '';
        return `🎬 CineVerse Ticket\n\n🎥 ${movie}\n🏛️ ${theater}\n📅 ${date} at ${time}\n💺 Seats: ${seats}\n💰 ₹${booking.totalAmount?.toFixed(2)}\n🆔 Booking: ${booking._id}`;
    };

    // WhatsApp share
    const shareWhatsApp = () => {
        const text = encodeURIComponent(getShareText());
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = getShareText();
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Native share
    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `CineVerse Ticket - ${booking?.movie}`,
                    text: getShareText()
                });
            } catch { /* user cancelled */ }
        } else {
            copyToClipboard();
        }
    };

    useEffect(() => {
        if (!booking) {
            navigate('/');
            return;
        }

        // Trigger confetti celebration
        const celebrateSuccess = () => {
            const duration = 3000;
            const end = Date.now() + duration;

            const colors = ['#e50914', '#00f2ea', '#ffd700', '#ff00ff'];
            const fireConfetti = typeof confetti === 'function' ? confetti : (confetti && confetti.default ? confetti.default : null);

            if (!fireConfetti) return;

            (function frame() {
                try {
                    fireConfetti({
                        particleCount: 4,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                    });
                    fireConfetti({
                        particleCount: 4,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                } catch (e) {
                    console.error('Confetti error:', e);
                }
            }());
        };

        try {
            celebrateSuccess();
        } catch (e) {
            console.error(e);
        } finally {
            // Show ticket after celebration
            setTimeout(() => setShowTicket(true), 800);
        }
    }, [booking, navigate]);

    if (!booking) return null;

    const qrData = JSON.stringify({
        bookingId: booking._id,
        movie: booking.movie,
        seats: booking.seats,
        time: booking.showTime
    });

    return (
        <div className="booking-success-page">
            {/* Success Animation Overlay */}
            <motion.div
                className="success-overlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                style={{ pointerEvents: 'none' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="success-checkmark"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        ✓
                    </motion.span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="success-title"
                >
                    Booking Confirmed!
                </motion.h2>
            </motion.div>

            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: showTicket ? 1 : 0, y: showTicket ? 0 : 50 }}
                    transition={{ duration: 0.6 }}
                    className="ticket-container"
                >
                    {/* Ticket Card */}
                    <div className="ticket-card">
                        <div className="ticket-header">
                            <div className="ticket-logo">
                                <span style={{ color: 'var(--primary)' }}>CINE</span>VERSE
                            </div>
                            <span className="ticket-type">E-TICKET</span>
                        </div>

                        <div className="ticket-movie-section">
                            {showDetails?.poster && (
                                <motion.img
                                    src={showDetails.poster}
                                    alt={booking.movie}
                                    className="ticket-poster"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                />
                            )}
                            <div className="ticket-movie-info">
                                <h2 className="movie-title">{booking.movie}</h2>
                                <div className="movie-meta">
                                    <span className="badge badge-4k">4K</span>
                                    <span className="badge badge-3d">3D</span>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-divider">
                            <div className="divider-circle left" />
                            <div className="divider-line" />
                            <div className="divider-circle right" />
                        </div>

                        <div className="ticket-details">
                            <div className="detail-row">
                                <div className="detail-item">
                                    <span className="detail-label">Date & Time</span>
                                    <span className="detail-value">
                                        {booking.showTime && new Date(booking.showTime).toLocaleString([], {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Theater</span>
                                    <span className="detail-value">{booking.theater}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-item">
                                    <span className="detail-label">Seats</span>
                                    <span className="detail-value seats">{booking.seats?.join(', ')}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Amount Paid</span>
                                    <span className="detail-value amount">₹{booking.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-qr-section">
                            <motion.div
                                className="qr-wrapper"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                                style={{ marginBottom: '10px' }}
                            >
                                <QRCodeSVG
                                    value={qrData}
                                    size={150}
                                    level="H"
                                    includeMargin
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            </motion.div>
                            <p className="qr-instruction" style={{ marginBottom: '25px' }}>Scan this QR code at the theater</p>

                            {/* Google Maps - Theater Location */}
                            <div style={{ width: '100%', marginBottom: '25px', textAlign: 'left' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '10px'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>📍</span>
                                    <span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Theater Location</span>
                                </div>
                                <div style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    height: '180px',
                                    width: '100%'
                                }}>
                                    <iframe
                                        title="Theater Location"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent((booking.theater || 'Cinema') + ' cinema theater')}`}
                                    />
                                </div>
                                <motion.a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((booking.theater || 'Cinema') + ' cinema theater')}`}
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
                                        border: '1px solid rgba(66,133,244,0.2)',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    🗺️ Open in Google Maps
                                </motion.a>
                            </div>

                            {/* Share Buttons */}
                            <div style={{ width: '100%', marginBottom: '10px' }}>
                                <p style={{
                                    color: '#888',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '10px',
                                    textAlign: 'center',
                                    fontWeight: 600
                                }}>
                                    Share E-Ticket
                                </p>
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'center',
                                    width: '100%'
                                }}>
                                    {/* WhatsApp */}
                                    <motion.button
                                        onClick={shareWhatsApp}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '12px 0',
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
                                        onClick={copyToClipboard}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '12px 0',
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
                                        {copied ? '✓' : '📋'} {copied ? 'Copied' : 'Copy'}
                                    </motion.button>

                                    {/* Share */}
                                    <motion.button
                                        onClick={nativeShare}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '12px 0',
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
                        </div>

                        <div className="ticket-footer">
                            <span className="booking-id">Booking ID: {booking._id}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="success-actions">
                        <motion.button
                            className="btn btn-primary btn-glow"
                            onClick={() => navigate('/my-tickets')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View All Tickets
                        </motion.button>
                        <motion.button
                            className="btn btn-outline"
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Book More
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BookingSuccess;
