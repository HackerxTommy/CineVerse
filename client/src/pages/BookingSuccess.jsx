import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showTicket, setShowTicket] = useState(false);

    const { booking, showDetails } = location.state || {};

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

            (function frame() {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        };

        celebrateSuccess();

        // Show ticket after celebration
        setTimeout(() => setShowTicket(true), 800);
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
                            <p className="qr-instruction">Scan this QR code at the theater</p>
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
