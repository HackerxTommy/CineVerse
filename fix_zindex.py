import sys

# 1. Update MovieDetails.jsx
file_path = 'c:/CineVerse/client/src/pages/MovieDetails.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_movie = """            {/* Hero Backdrop with parallax effect */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                    minHeight: '75vh',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: '60px'
                }}
            >
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
                )}"""

target_movie_lf = target_movie.replace('\r\n', '\n')

new_movie = """            {/* Hero Backdrop with parallax effect */}
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
                }} />"""

if target_movie in content:
    content = content.replace(target_movie, new_movie)
elif target_movie_lf in content:
    content = content.replace(target_movie_lf, new_movie)
else:
    print("Warning: target_movie not found in MovieDetails.jsx")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("MovieDetails.jsx zIndex updated.")

# 2. Update SeatSelection.jsx
seat_file = 'c:/CineVerse/client/src/pages/SeatSelection.jsx'
with open(seat_file, 'r', encoding='utf-8') as f:
    s_content = f.read()

target_seat = """    return (
        <div style={{
            paddingTop: '100px',
            paddingBottom: '50px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Movie Poster Cover */}
            {show && show.movie && show.movie.poster && (
                <motion.div
                    initial={{ opacity: 0.25 }}
                    animate={{ opacity: showTrailer ? 0 : 0.25 }}
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

            {/* Movie Trailer Background */}
            {youtubeId && showTrailer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
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
            )}"""

target_seat_lf = target_seat.replace('\r\n', '\n')

new_seat = """    return (
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
            {youtubeId && showTrailer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
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
            {show && show.movie && show.movie.poster && (
                <motion.div
                    initial={{ opacity: 0.25 }}
                    animate={{ opacity: showTrailer ? 0 : 0.25 }}
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
            )}"""

if target_seat in s_content:
    s_content = s_content.replace(target_seat, new_seat)
elif target_seat_lf in s_content:
    s_content = s_content.replace(target_seat_lf, new_seat)
else:
    print("Warning: target_seat not found in SeatSelection.jsx")

with open(seat_file, 'w', encoding='utf-8') as f:
    f.write(s_content)
print("SeatSelection.jsx zIndex updated.")
