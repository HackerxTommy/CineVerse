import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
 
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

// Using shared api instance

// Helper to extract YouTube video ID
const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
};

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [ambientTrailerReady, setAmbientTrailerReady] = useState(false);
    const trailerRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [movieRes, showsRes] = await Promise.all([
                api.get(`/movies/${id}`),
                api.get(`/movies/${id}/shows`)
            ]);
            setMovie(movieRes.data);
            setShows(showsRes.data);

            // Group shows by date and select first date
            if (showsRes.data.length > 0) {
                const firstDate = new Date(showsRes.data[0].startTime).toDateString();
                setSelectedDate(firstDate);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching movie details:', err);
            setError(err.response?.data?.message || 'Failed to load movie details');
        } finally {
            setLoading(false);
        }
    }, [id, setMovie, setShows, setSelectedDate, setError, setLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!loading && movie) {
            const timer = setTimeout(() => {
                setAmbientTrailerReady(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, movie]);

    // Group shows by date
    const showsByDate = shows.reduce((acc, show) => {
        const date = new Date(show.startTime).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(show);
        return acc;
    }, {});

    const dates = Object.keys(showsByDate);
    const youtubeId = movie ? getYouTubeId(movie.trailer) : null;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#000' }}>
                <AnimatedBackground variant="blue" />
                <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{
                            width: '60px',
                            height: '60px',
                            border: '3px solid rgba(255,255,255,0.1)',
                            borderTopColor: 'var(--neon-blue)',
                            borderRadius: '50%',
                            margin: '0 auto'
                        }}
                    />
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div style={{ minHeight: '100vh', background: '#000' }}>
                <AnimatedBackground variant="default" />
                <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>Error</h2>
                        <p style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error || 'Movie not found'}</p>
                        <motion.button
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Go Home
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        );
    }

    const { title, description, backdrop, poster, genre, duration, rating, format } = movie;

    return (
        <div style={{ minHeight: '100vh', background: '#000' }}>
            {/* YouTube Trailer Background */}
            {showTrailer && youtubeId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 50,
                        background: 'rgba(0,0,0,0.95)'
                    }}
                >
                    <button
                        onClick={() => setShowTrailer(false)}
                        style={{
                            position: 'absolute',
                            top: '100px',
                            right: '30px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '12px 25px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            zIndex: 51,
                            fontSize: '1rem'
                        }}
                    >
                        ✕ Close Trailer
                    </button>
                    <iframe
                        ref={trailerRef}
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </motion.div>
            )}

            {/* Hero Backdrop with parallax effect */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                    minHeight: '75vh',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: '60px',
                    zIndex: 0 // Force stacking context so negative children don't hide behind body
                }}
            >
                {/* Ambient trailer video background (muted) */}
                {youtubeId && !showTrailer && ambientTrailerReady && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            zIndex: -3
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
                    </motion.div>
                )}

                {/* Poster Background layer (fades out when trailer starts) */}
                {(backdrop || poster) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: ambientTrailerReady ? 0 : 1 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `url(${backdrop || poster})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            backgroundAttachment: 'fixed',
                            zIndex: -2,
                            pointerEvents: 'none'
                        }}
                    />
                )}

                {/* Dark Gradient Overlay for Readability (persists) */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 50%, #000 100%)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />

                {/* Animated overlay particles */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 70%, rgba(229,9,20,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />

                <div className="container">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <motion.h1
                            style={{
                                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                                margin: 0,
                                textShadow: '0 4px 30px rgba(0,0,0,0.9)',
                                lineHeight: 1.1,
                                fontWeight: 800
                            }}
                        >
                            {title}
                        </motion.h1>

                        {/* Movie Meta */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0', flexWrap: 'wrap' }}
                        >
                            {rating && (
                                <motion.span
                                    whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(229,9,20,0.5)' }}
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary), #b20710)',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    ★ {rating.toFixed(1)}
                                </motion.span>
                            )}
                            {duration && (
                                <span style={{ color: '#ccc', fontSize: '1.1rem' }}>
                                    🕐 {Math.floor(duration / 60)}h {duration % 60}m
                                </span>
                            )}
                            {format && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {format.is4K && <span className="badge badge-4k">4K</span>}
                                    {format.is3D && <span className="badge badge-3d">3D</span>}
                                    {format.isIMAX && <span className="badge" style={{ borderColor: 'gold', color: 'gold' }}>IMAX</span>}
                                    {format.isDolby && <span className="badge" style={{ borderColor: '#00d4ff', color: '#00d4ff' }}>DOLBY</span>}
                                </div>
                            )}

                            {/* Watch Trailer Button */}
                            {youtubeId && (
                                <motion.button
                                    onClick={() => setShowTrailer(true)}
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,0,0,0.5)' }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '12px 25px',
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '30px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        ▶️
                                    </motion.span>
                                    Watch Trailer
                                </motion.button>
                            )}
                        </motion.div>

                        {/* Description */}
                        {description && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{
                                    fontSize: '1.15rem',
                                    maxWidth: '700px',
                                    margin: '25px 0',
                                    color: '#ddd',
                                    lineHeight: 1.7
                                }}
                            >
                                {description}
                            </motion.p>
                        )}

                        {/* Genres */}
                        {genre && genre.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
                            >
                                {genre.map((g, i) => (
                                    <motion.span
                                        key={g}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        whileHover={{ scale: 1.05, borderColor: 'var(--neon-blue)' }}
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            padding: '8px 20px',
                                            borderRadius: '25px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {g}
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            {/* Showtimes Section */}
            <div className="container" style={{ padding: '60px 20px' }}>
                <motion.h2
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ marginBottom: '30px' }}
                >
                    Select a Showtime
                </motion.h2>

                {shows.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel"
                        style={{ padding: '40px', textAlign: 'center' }}
                    >
                        <p style={{ color: '#aaa', margin: 0, fontSize: '1.1rem' }}>
                            No upcoming shows available for this movie.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* Date selector */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', gap: '12px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}
                        >
                            {dates.map((date, i) => {
                                const d = new Date(date);
                                const isToday = new Date().toDateString() === date;
                                const isSelected = selectedDate === date;

                                return (
                                    <motion.button
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: '15px 25px',
                                            background: isSelected ? 'linear-gradient(135deg, var(--primary), #b20710)' : 'rgba(255,255,255,0.05)',
                                            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            minWidth: '100px',
                                            textAlign: 'center',
                                            boxShadow: isSelected ? '0 10px 30px rgba(229,9,20,0.3)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>
                                            {isToday ? 'Today' : d.toLocaleDateString([], { weekday: 'short' })}
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {d.getDate()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                            {d.toLocaleDateString([], { month: 'short' })}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>

                        {/* Shows for selected date */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedDate}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '20px'
                                }}
                            >
                                {(showsByDate[selectedDate] || []).map((show, index) => (
                                    <motion.div
                                        key={show._id}
                                        className="glass-panel"
                                        style={{ padding: '25px', position: 'relative', overflow: 'hidden' }}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0,242,234,0.1)'
                                        }}
                                    >
                                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--neon-blue)' }}>
                                            {show.theaterName}
                                        </h3>
                                        <p style={{ color: '#aaa', margin: '0 0 15px 0', fontSize: '1.1rem' }}>
                                            {new Date(show.startTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: 'var(--success)',
                                            margin: '0 0 20px 0'
                                        }}>
                                            ₹{show.price.toFixed(0)}
                                            <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}> onwards</span>
                                        </p>
                                        <motion.button
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onClick={() => navigate(`/book/${show._id}`)}
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(229,9,20,0.5)' }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {/* Animated gradient effect */}
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '100%']
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2,
                                                    ease: 'linear'
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '50%',
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            🎬 Select Seats
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
};

export default MovieDetails;
