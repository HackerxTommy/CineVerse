import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import MovieCard from '../components/MovieCard';
import HeroScene from '../components/HeroScene';
import { Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
 
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Using shared api instance

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const res = await api.get('/movies');
            setMovies(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError('Failed to load movies. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <HeroScene />

            <div className="container" style={{ paddingTop: '100px', position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ textAlign: 'center', marginBottom: '80px' }}
                >
                    <motion.h1
                        style={{
                            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                            margin: '0 0 20px 0',
                            lineHeight: 1.1,
                            fontWeight: 800
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Experience Cinema{' '}
                        <motion.span
                            style={{
                                color: 'var(--primary)',
                                display: 'inline-block',
                                textShadow: '0 0 40px rgba(229,9,20,0.5)'
                            }}
                            animate={{
                                textShadow: [
                                    '0 0 20px rgba(229,9,20,0.3)',
                                    '0 0 40px rgba(229,9,20,0.6)',
                                    '0 0 20px rgba(229,9,20,0.3)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Reimagined
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        style={{ color: '#aaa', fontSize: '1.3rem', maxWidth: '600px', margin: '0 auto' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Book your tickets for the latest blockbusters in 4K, 3D and IMAX.
                    </motion.p>

                    {/* Animated scroll indicator */}
                    <motion.div
                        style={{ marginTop: '50px' }}
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <span style={{ color: '#555', fontSize: '2rem' }}>↓</span>
                    </motion.div>
                </motion.div>

                {/* Movies Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 style={{
                        borderLeft: '4px solid var(--primary)',
                        paddingLeft: '15px',
                        marginBottom: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'inline-block'
                            }}
                        />
                        Now Showing
                    </h2>
                </motion.div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{
                                width: '50px',
                                height: '50px',
                                border: '3px solid rgba(255,255,255,0.1)',
                                borderTopColor: 'var(--primary)',
                                borderRadius: '50%',
                                margin: '0 auto 20px'
                            }}
                        />
                        <p style={{ color: '#888' }}>Loading movies...</p>
                    </div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '50px' }}
                    >
                        <p style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error}</p>
                        <motion.button
                            className="btn btn-primary"
                            onClick={fetchMovies}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Retry
                        </motion.button>
                    </motion.div>
                )}

                {!loading && !error && movies.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p style={{ color: '#aaa' }}>No movies available at the moment.</p>
                    </div>
                )}

                {!loading && !error && movies.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ height: '80vh', paddingBottom: '80px', width: '100%' }}
                    >
                        <AutoSizer>
                            {({ height, width }) => {
                                const columnWidth = 300; // Expected card width + gap
                                const rowHeight = 450;
                                const columnCount = Math.max(1, Math.floor(width / columnWidth));
                                const rowCount = Math.ceil(movies.length / columnCount);

                                return (
                                    <Grid
                                        columnCount={columnCount}
                                        columnWidth={width / columnCount}
                                        height={height}
                                        rowCount={rowCount}
                                        rowHeight={rowHeight}
                                        width={width}
                                        style={{ overflowX: 'hidden' }}
                                    >
                                        {({ columnIndex, rowIndex, style }) => {
                                            const index = rowIndex * columnCount + columnIndex;
                                            if (index >= movies.length) return null;
                                            const movie = movies[index];
                                            
                                            // Ensure loading="lazy" is passed automatically or handled by MovieCard
                                            return (
                                                <div style={{ ...style, padding: '15px' }}>
                                                    <motion.div
                                                        variants={itemVariants}
                                                        transition={{ delay: 0.1 }}
                                                        style={{ height: '100%' }}
                                                    >
                                                        <MovieCard movie={movie} />
                                                    </motion.div>
                                                </div>
                                            );
                                        }}
                                    </Grid>
                                );
                            }}
                        </AutoSizer>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Home;
