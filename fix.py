import sys
import re

# 1. Fix AuthContext.jsx
auth_file = 'c:/CineVerse/client/src/context/AuthContext.jsx'
with open(auth_file, 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_content = auth_content.replace(
    'window.location.href = `${API_URL}/auth/google`;',
    '''const isVercel = window.location.hostname !== 'localhost';
        const serverUrl = isVercel ? 'https://cineverse-world.vercel.app/api' : 'http://localhost:5000/api';
        window.location.href = `${serverUrl}/auth/google`;'''
)

with open(auth_file, 'w', encoding='utf-8') as f:
    f.write(auth_content)
print("AuthContext updated")

# 2. Fix SeatSelection.jsx
seat_file = 'c:/CineVerse/client/src/pages/SeatSelection.jsx'
with open(seat_file, 'r', encoding='utf-8') as f:
    seat_content = f.read()

# Add state
seat_content = seat_content.replace(
    "const [error, setError] = useState('');",
    "const [error, setError] = useState('');\n    const [showTrailer, setShowTrailer] = useState(false);"
)

# Add useEffect and keep loading check
target_loading = "if (loading && !show) {"
replacement_loading = '''useEffect(() => {
        if (!loading && show) {
            const timer = setTimeout(() => {
                setShowTrailer(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, show]);

    if (loading && !show) {'''
seat_content = seat_content.replace(target_loading, replacement_loading)

# Replace the trailer snippet
target_trailer_bg = '''            {/* Movie Trailer Background */}
            {youtubeId && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    overflow: 'hidden',
                    zIndex: 0,
                    opacity: 0.15, // Reduced from 0.25
                    pointerEvents: 'none',
                    filter: 'grayscale(80%) contrast(1.2)' // Added filter for darker tone
                }}>
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
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, #000 85%)' // Darker gradient
                    }} />
                </div>
            )}'''

target_trailer_bg_lf = target_trailer_bg.replace('\r\n', '\n')

new_trailer_bg = '''            {/* Movie Poster Cover */}
            {show?.movie?.poster && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -1,
                    opacity: 0.25,
                    pointerEvents: 'none',
                    backgroundImage: `url(${show?.movie?.poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(80%) contrast(1.2)'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, #000 85%)'
                    }} />
                </div>
            )}

            {/* Movie Trailer Background */}
            {youtubeId && showTrailer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ duration: 1.5 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        overflow: 'hidden',
                        zIndex: 0,
                        pointerEvents: 'none',
                        filter: 'grayscale(80%) contrast(1.2)' // Added filter for darker tone
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
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, #000 85%)' // Darker gradient
                    }} />
                </motion.div>
            )}'''

if target_trailer_bg in seat_content:
    seat_content = seat_content.replace(target_trailer_bg, new_trailer_bg)
elif target_trailer_bg_lf in seat_content:
    seat_content = seat_content.replace(target_trailer_bg_lf, new_trailer_bg)
else:
    print("Warning: Could not find exact trailer string in SeatSelection.")

with open(seat_file, 'w', encoding='utf-8') as f:
    f.write(seat_content)
print("SeatSelection updated")
