import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
 
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// Seat pricing tiers
const SEAT_TIERS = {
    front: { rows: ['A', 'B'], multiplier: 0.8, color: '#2ed573', label: 'Front (Budget)' },
    middle: { rows: ['C', 'D', 'E'], multiplier: 1.0, color: '#00f2ea', label: 'Middle (Regular)' },
    recliner: { rows: ['F', 'G'], multiplier: 1.5, color: '#ffd700', label: 'Recliner (Premium)' }
};

const getSeatTier = (row) => {
    for (const [tierName, tier] of Object.entries(SEAT_TIERS)) {
        if (tier.rows.includes(row)) return { name: tierName, ...tier };
    }
    return { name: 'middle', ...SEAT_TIERS.middle };
};

// Helper to extract YouTube video ID
const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
};

const SeatSelection = () => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState(location.state?.selectedSeats || []);
    const [timeLeft, setTimeLeft] = useState(location.state?.timeLeft || 300);
    const [timerActive, setTimerActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTrailer, setShowTrailer] = useState(false);

     
     
     
    useEffect(() => {
        fetchShow();
        
        // Serverless-Friendly "Real-Time" Polling Strategy
        // Polls the server every 4 seconds for fresh seat statuses
        const pollInterval = setInterval(() => {
            fetchShow(true); // pass true to indicate silent background fetch
        }, 4000);

        return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showId]);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            alert('Booking time expired! Please try again.');
            navigate('/');
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft, navigate]);

    const fetchShow = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await api.get(`/shows/${showId}`);
            setShow(res.data);
            
            // Check if any selected seat got booked by someone else
            if (isBackground && Array.isArray(selectedSeats) && selectedSeats.length > 0 && res.data?.seats) {
                const nowBooked = selectedSeats.filter(seatId => {
                    const latestSeatStatus = res.data.seats.find(s => s.id === seatId);
                    if (!latestSeatStatus) return true;
                    return latestSeatStatus.isBooked || (latestSeatStatus.lockedUntil && new Date(latestSeatStatus.lockedUntil) > new Date());
                });
                
                if (nowBooked.length > 0) {
                    setSelectedSeats(prev => prev.filter(id => !nowBooked.includes(id)));
                    alert('Someone just booked/locked one of your selecting seats!');
                }
            }
        } catch (err) {
            if (!isBackground) setError(err.response?.data?.message || 'Failed to load show');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const isSeatAvailable = useCallback((seat) => {
        if (seat.isBooked) return false;
        if (seat.lockedUntil && new Date(seat.lockedUntil) > new Date()) return false;
        return true;
    }, []);

    const getSeatPrice = useCallback((seat) => {
        if (!show) return 0;
        const tier = getSeatTier(seat.row);
        return show.price * tier.multiplier;
    }, [show]);

    const totalPrice = selectedSeats.reduce((sum, seatId) => {
        const seat = show?.seats?.find(s => s.id === seatId);
        return sum + (seat ? getSeatPrice(seat) : 0);
    }, 0);

    const toggleSeat = (seat) => {
        if (!isSeatAvailable(seat)) return;

        if (selectedSeats.includes(seat.id)) {
            setSelectedSeats(prev => prev.filter(id => id !== seat.id));
        } else {
            if (selectedSeats.length >= 8) {
                alert('Maximum 8 seats per booking');
                return;
            }
            setSelectedSeats(prev => [...prev, seat.id]);
        }
    };
    const handleProceed = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        if (!user) {
            // Pass the current selected seats in state so they aren't lost after login
            navigate('/login', {
                state: {
                    from: {
                        pathname: location.pathname,
                        state: { selectedSeats, timeLeft }
                    }
                }
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('/bookings/lock', { showId, selectedSeats });
            setTimerActive(true);

            // Navigate to payment page
            navigate('/payment', {
                state: {
                    showId,
                    selectedSeats,
                    totalAmount: totalPrice,
                    show: {
                        movie: show.movie?.title,
                        poster: show.movie?.poster,
                        theater: show.theaterName,
                        time: show.startTime,
                        price: show.price
                    }
                }
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to lock seats');
            fetchShow();
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const youtubeId = show?.movie?.trailer ? getYouTubeId(show.movie.trailer) : null;

    useEffect(() => {
        if (!loading && show) {
            const timer = setTimeout(() => {
                setShowTrailer(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, show]);

    if (loading && !show) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <div className="loading-shimmer" style={{ width: '200px', height: '30px', margin: '0 auto 20px' }} />
                <div className="loading-shimmer" style={{ width: '100%', maxWidth: '600px', height: '400px', margin: '0 auto' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2>Error</h2>
                <p style={{ color: '#ff6b6b' }}>{error}</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    // Group seats by row
    const seatsByRow = {};
    show?.seats?.forEach(seat => {
        if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
        seatsByRow[seat.row].push(seat);
    });

    return (
        <div style={{
            paddingTop: '100px',
            paddingBottom: '50px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 0 // Force stacking context
        }}>
            {/* Movie Trailer Background */}
            {youtubeId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showTrailer ? 0.25 : 0 }}
                    transition={{ duration: 1.5 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        overflow: 'hidden',
                        zIndex: -2,
                        pointerEvents: 'none',
                        filter: 'grayscale(80%) contrast(1.2)'
                    }}
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&showinfo=0`}
                        style={{
                            width: '150%',
                            height: '150%',
                            position: 'absolute',
                            top: '-25%',
                            left: '-25%',
                            border: 'none'
                        }}
                        allow="autoplay"
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, #000 85%)'
                    }} />
                </motion.div>
            )}

            {/* Movie Poster Cover */}
            <AnimatePresence>
                {show && show.movie && show.movie.poster && !showTrailer && (
                    <motion.div
                        key="seat-poster"
                        initial={{ opacity: 0.25 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: -1,
                            pointerEvents: 'none',
                            backgroundImage: `url(${show.movie.poster})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'grayscale(80%) contrast(1.2)'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, #000 85%)'
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Movie Poster Floating Effect */}
            {show?.movie?.poster && (
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [-2, 2, -2]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 6,
                        ease: 'easeInOut'
                    }}
                    style={{
                        position: 'fixed',
                        right: '5%',
                        top: '15%',
                        width: '150px',
                        height: '220px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(229,9,20,0.3)',
                        zIndex: 1,
                        opacity: 0.8
                    }}
                >
                    <img
                        src={show.movie.poster}
                        alt={show.movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </motion.div>
            )}

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '40px',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}
                >
                    <div>
                        <h2 className="glow-text" style={{ margin: 0 }}>{show?.movie?.title}</h2>
                        <p style={{ color: '#aaa', margin: '5px 0 0' }}>
                            {show?.theaterName} | {show?.startTime && new Date(show.startTime).toLocaleString()}
                        </p>
                    </div>
                    {timerActive && (
                        <motion.div
                            animate={{ scale: timeLeft < 60 ? [1, 1.05, 1] : 1 }}
                            transition={{ repeat: timeLeft < 60 ? Infinity : 0, duration: 1 }}
                            className="timer-display"
                            style={{ color: timeLeft < 60 ? '#ff4757' : 'var(--neon-blue)' }}
                        >
                            {formatTime(timeLeft)}
                        </motion.div>
                    )}
                </motion.div>

                {/* Arch-Shaped Screen */}
                <div className="screen-container">
                    <div className="screen-arch">
                        <div className="screen-glow" />
                        <span className="screen-text">SCREEN</span>
                    </div>
                </div>

                {/* Seat Grid */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="seat-grid-container"
                >
                    {Object.entries(seatsByRow).map(([row, seats]) => {
                        const tier = getSeatTier(row);
                        return (
                            <div key={row} className="seat-row">
                                <span className="row-label" style={{ color: tier.color }}>{row}</span>
                                <div className="seats">
                                    {seats.sort((a, b) => a.number - b.number).map(seat => {
                                        const isSelected = selectedSeats.includes(seat.id);
                                        const available = isSeatAvailable(seat);
                                        const seatPrice = getSeatPrice(seat);

                                        return (
                                            <motion.div
                                                key={seat.id}
                                                className={`seat ${tier.name} ${isSelected ? 'selected' : ''} ${!available ? 'booked' : ''}`}
                                                onClick={() => toggleSeat(seat)}
                                                whileHover={available ? { scale: 1.15, zIndex: 10 } : {}}
                                                whileTap={available ? { scale: 0.95 } : {}}
                                                title={available ? `${seat.id} - ₹${seatPrice.toFixed(0)}` : 'Not available'}
                                                style={{
                                                    '--seat-color': tier.color,
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {isSelected ? (
                                                    <motion.div
                                                        className="seat-movie-effect"
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            backgroundImage: `url(${show?.movie?.poster})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            borderRadius: '6px'
                                                        }}
                                                    >
                                                        {/* Live animation shimmer */}
                                                        <motion.div
                                                            animate={{
                                                                x: ['-100%', '200%']
                                                            }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 1.5,
                                                                ease: 'linear'
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '50%',
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                                pointerEvents: 'none'
                                                            }}
                                                        />
                                                        {/* Glowing border animation */}
                                                        <motion.div
                                                            animate={{
                                                                boxShadow: [
                                                                    'inset 0 0 10px rgba(229,9,20,0.5)',
                                                                    'inset 0 0 20px rgba(229,9,20,0.8)',
                                                                    'inset 0 0 10px rgba(229,9,20,0.5)'
                                                                ]
                                                            }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 1
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                borderRadius: '6px'
                                                            }}
                                                        />
                                                        <motion.span
                                                            className="seat-check"
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1 }}
                                                            style={{
                                                                position: 'relative',
                                                                zIndex: 2,
                                                                textShadow: '0 0 10px rgba(255,255,255,0.8)'
                                                            }}
                                                        >
                                                            ✓
                                                        </motion.span>
                                                    </motion.div>
                                                ) : (
                                                    <span className="seat-number">{seat.number}</span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <span className="row-label" style={{ color: tier.color }}>{row}</span>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="seat-legend"
                >
                    {Object.entries(SEAT_TIERS).map(([name, tier]) => (
                        <div key={name} className="legend-item">
                            <div className="legend-box" style={{ background: tier.color }} />
                            <span>{tier.label} (×{tier.multiplier})</span>
                        </div>
                    ))}
                    <div className="legend-item">
                        <div className="legend-box booked" />
                        <span>Booked</span>
                    </div>
                </motion.div>

                {/* Selection Summary & Proceed */}
                <AnimatePresence>
                    {selectedSeats.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="booking-summary-bar"
                        >
                            <div className="summary-info">
                                <span className="seats-count">{selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}</span>
                                <span className="seats-list">{selectedSeats.join(', ')}</span>
                            </div>
                            <div className="summary-action">
                                <span className="total-price">₹{totalPrice.toFixed(2)}</span>
                                <motion.button
                                    className="btn btn-primary btn-glow"
                                    onClick={handleProceed}
                                    disabled={loading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ position: 'relative', overflow: 'hidden' }}
                                >
                                    {/* Animated gradient */}
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '50%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    {loading ? 'Processing...' : '🎬 Proceed to Pay'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SeatSelection;
