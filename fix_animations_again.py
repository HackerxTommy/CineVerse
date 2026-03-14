import sys

# 1. Update MovieDetails.jsx
file_path = 'c:/CineVerse/client/src/pages/MovieDetails.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_details = """                {/* Ambient trailer video background (muted) */}
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
                            backgroundImage: `url(${backdrop || poster})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            backgroundAttachment: 'fixed',
                            zIndex: -2,
                            pointerEvents: 'none'
                        }}
                    />
                )}"""

target_details_lf = target_details.replace('\r\n', '\n')

new_details = """                {/* Ambient trailer video background (muted) - Always mount to buffer, but fade in later */}
                {youtubeId && !showTrailer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: ambientTrailerReady ? 0.35 : 0 }}
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

                {/* Poster Background layer (fades out and unmounts when trailer starts) */}
                <AnimatePresence>
                    {(backdrop || poster) && !ambientTrailerReady && (
                        <motion.div
                            key="hero-poster"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${backdrop || poster})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center top',
                                backgroundAttachment: 'fixed',
                                zIndex: -2,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </AnimatePresence>"""

if target_details in content:
    content = content.replace(target_details, new_details)
elif target_details_lf in content:
    content = content.replace(target_details_lf, new_details)
else:
    print("Warning: target_details not found in MovieDetails.jsx")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("MovieDetails.jsx poster animation rewritten.")

# 2. Update SeatSelection.jsx
seat_file = 'c:/CineVerse/client/src/pages/SeatSelection.jsx'
with open(seat_file, 'r', encoding='utf-8') as f:
    s_content = f.read()

target_seat = """            {/* Movie Trailer Background */}
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

target_seat_lf = target_seat.replace('\r\n', '\n')

new_seat = """            {/* Movie Trailer Background */}
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
            </AnimatePresence>"""

if target_seat in s_content:
    s_content = s_content.replace(target_seat, new_seat)
elif target_seat_lf in s_content:
    s_content = s_content.replace(target_seat_lf, new_seat)
else:
    print("Warning: target_seat not found in SeatSelection.jsx")

with open(seat_file, 'w', encoding='utf-8') as f:
    f.write(s_content)
print("SeatSelection.jsx poster animation rewritten.")
