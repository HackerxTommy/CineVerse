import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
    if (!movie) return null;

    const { _id, title, poster, format, rating, genre, duration } = movie;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                scale: 1.03,
                boxShadow: '0 20px 40px rgba(229,9,20,0.3)'
            }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '2/3',
                background: '#1a1a1a',
                cursor: 'pointer'
            }}
        >
            {/* Poster Image */}
            <motion.img
                src={poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={title}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                }}
            />

            {/* Hover Glow Effect */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(229,9,20,0.2) 0%, transparent 70%)',
                    opacity: 0,
                    pointerEvents: 'none'
                }}
                whileHover={{ opacity: 1 }}
            />

            {/* Overlay */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)',
                padding: '80px 18px 18px 18px'
            }}>
                {/* Rating Badge */}
                {rating && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        style={{
                            position: 'absolute',
                            top: '-35px',
                            right: '12px',
                            background: 'linear-gradient(135deg, var(--primary), #b20710)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(229,9,20,0.4)'
                        }}
                    >
                        ★ {rating.toFixed(1)}
                    </motion.div>
                )}

                {/* Title */}
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.15rem',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {title}
                </h3>

                {/* Genres & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    {genre && genre.length > 0 && (
                        <span style={{ color: '#888', fontSize: '0.8rem' }}>
                            {genre.slice(0, 2).join(' • ')}
                        </span>
                    )}
                    {duration && (
                        <span style={{ color: '#666', fontSize: '0.75rem' }}>
                            • {duration} min
                        </span>
                    )}
                </div>

                {/* Format Badges */}
                {format && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                        {format.is4K && (
                            <motion.span
                                className="badge badge-4k"
                                whileHover={{ scale: 1.1, boxShadow: '0 0 10px var(--neon-blue)' }}
                            >
                                4K
                            </motion.span>
                        )}
                        {format.is3D && (
                            <motion.span
                                className="badge badge-3d"
                                whileHover={{ scale: 1.1, boxShadow: '0 0 10px var(--neon-purple)' }}
                            >
                                3D
                            </motion.span>
                        )}
                        {format.isIMAX && (
                            <motion.span
                                className="badge"
                                style={{ borderColor: 'gold', color: 'gold' }}
                                whileHover={{ scale: 1.1, boxShadow: '0 0 10px gold' }}
                            >
                                IMAX
                            </motion.span>
                        )}
                        {format.isDolby && (
                            <motion.span
                                className="badge"
                                style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
                                whileHover={{ scale: 1.1, boxShadow: '0 0 10px #00d4ff' }}
                            >
                                DOLBY
                            </motion.span>
                        )}
                    </div>
                )}

                {/* Book Button */}
                <Link
                    to={`/movie/${_id}`}
                    style={{ textDecoration: 'none' }}
                >
                    <motion.button
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            fontSize: '0.9rem',
                            padding: '12px'
                        }}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: '0 0 25px rgba(229,9,20,0.5)'
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Book Tickets
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
};

export default MovieCard;
